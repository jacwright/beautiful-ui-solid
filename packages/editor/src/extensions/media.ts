import { toast } from "beautiful-ui-solid";
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import type { Node, NodeType, Schema } from "prosemirror-model";
import { NodeSelection, Plugin, type EditorState } from "prosemirror-state";
import { insertPoint } from "prosemirror-transform";
import type { EditorView, NodeView, NodeViewConstructor } from "prosemirror-view";
import { insertBlock, safeSrc } from "../commands.ts";
import { icons } from "../icons.tsx";
import type { EditorAction, EditorContext, EmbedDefinition, Extension, ExtensionContext, Upload } from "../types.ts";

/**
 * Pictures, videos and an app's own blocks (embeds). The node views draw them in the editor;
 * toDOM is what they are in the value's HTML. A figure's caption is its content, edited in place.
 * Uploads go through the app's upload, and show from the local file until it's stored.
 */

export type FigureWidth = "text" | "wide" | "full";
export type VideoSource = { src: string; type?: string };
export type VideoMode = "loop" | "player";

/** A clip past these is better as a player: the research on looping clips. */
const loopSeconds = 30;
const loopBytes = 10 * 1024 * 1024;

const widths: FigureWidth[] = ["text", "wide", "full"];

/** A figure's caption to read, or an empty one where the figure has none, as a figure may not. */
const caption = (dom: HTMLElement): HTMLElement =>
  dom.querySelector<HTMLElement>(":scope > figcaption") ?? dom.ownerDocument.createElement("figcaption");
const widthOf = (value: unknown): FigureWidth => (widths.includes(value as FigureWidth) ? (value as FigureWidth) : "text");

// ---- Uploads ----------------------------------------------------------------------------------

type Pending = { file: File; fraction: number; error?: string; listeners: Set<() => void> };

/** The uploads under way, by the id their node carries, so its view can show the progress. */
const pending = new Map<string, Pending>();
let uploads = 0;

function notify(id: string) {
  for (const listener of pending.get(id)?.listeners ?? []) listener();
}

/** Where the node with this upload id is now, or -1. */
function findUpload(state: EditorState, id: string): number {
  let at = -1;
  state.doc.descendants((node, pos) => {
    if (at >= 0) return false;
    if (node.attrs.upload === id) at = pos;
    return true;
  });
  return at;
}

/** A video's size, length and first frame, read from the file before it uploads. */
function probeVideo(url: string): Promise<{ width: number; height: number; duration: number; poster?: Blob }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    let settled = false;
    const done = (poster?: Blob) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration || 0, poster });
    };
    // A browser that won't load media data unasked (iOS Safari, Data Saver) never sends
    // loadeddata: after a few seconds the clip goes in with what's known, and no poster.
    const timer = setTimeout(() => done(), 4000);
    video.addEventListener("error", () => done(), { once: true });
    video.addEventListener(
      "loadeddata",
      () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (!context || !canvas.width) return done();
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => done(blob ?? undefined), "image/webp", 0.85);
      },
      { once: true },
    );
  });
}

function imageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}

/** Stores one file, and points its node at where it landed. */
async function send(view: EditorView, id: string, upload: Upload) {
  const job = pending.get(id);
  if (!job) return;
  job.error = undefined;
  job.fraction = 0;
  notify(id);
  try {
    const result = await upload(job.file, (fraction) => {
      job.fraction = Math.min(Math.max(fraction, 0), 1);
      notify(id);
    });
    const src = safeSrc(result.src);
    if (!src) throw new Error("The upload gave no address for the file.");
    const at = findUpload(view.state, id);
    if (at < 0) return;
    const node = view.state.doc.nodeAt(at)!;
    const attrs: Record<string, unknown> = { ...node.attrs, upload: null };
    if (node.type.name === "video") attrs.sources = [{ src, type: job.file.type || undefined }];
    else attrs.src = src;
    if (result.width && result.height) Object.assign(attrs, { width: result.width, height: result.height });
    // The local copy stays until the stored one has loaded, so the picture doesn't blink.
    view.dispatch(view.state.tr.setNodeMarkup(at, undefined, attrs).setMeta("addToHistory", false));
    if (node.type.name === "video") stored.set(id, src);
    pending.delete(id);
  } catch (error) {
    job.error = error instanceof Error && error.message ? error.message : "It couldn't be uploaded.";
    notify(id);
  }
}

/** Adds pictures and videos at a place in the text (the cursor's, or where they were dropped). */
export async function addFiles(view: EditorView, files: File[], upload: Upload | undefined, at?: number) {
  const { image, video } = view.state.schema.nodes;
  if (!upload) {
    toast({ message: "Files can't be added here", description: "Add a picture by its address instead.", tone: "danger" });
    return;
  }
  for (const file of files) {
    const isVideo = file.type.startsWith("video/");
    const type = isVideo ? video : file.type.startsWith("image/") ? image : undefined;
    if (!type) {
      toast({ message: `${file.name} isn't a picture or a video`, tone: "danger" });
      continue;
    }
    const id = `upload-${++uploads}`;
    const local = URL.createObjectURL(file);
    pending.set(id, { file, fraction: 0, listeners: new Set() });
    let attrs: Record<string, unknown>;
    if (isVideo) {
      const probe = await probeVideo(local);
      attrs = { sources: [{ src: local, type: file.type }], width: probe.width || null, height: probe.height || null, mode: "loop", upload: id };
      if (probe.duration > loopSeconds || file.size > loopBytes) {
        attrs.mode = "player";
        toast({
          message: "This video plays with controls",
          description: `Clips under ${loopSeconds} seconds and ${loopBytes / 1024 / 1024} MB can loop on their own.`,
        });
      }
      // The first frame shows before it plays, and while it loads.
      if (probe.poster) {
        const poster = new File([probe.poster], `${file.name.replace(/\.[^.]+$/, "")}-poster.webp`, { type: "image/webp" });
        upload(poster, () => {})
          .then((result) => {
            const posterSrc = safeSrc(result.src);
            const pos = findUpload(view.state, id) >= 0 ? findUpload(view.state, id) : -1;
            if (pos >= 0 && posterSrc) view.dispatch(view.state.tr.setNodeAttribute(pos, "poster", posterSrc).setMeta("addToHistory", false));
            else if (posterSrc) setPosterBySource(view, stored.get(id) ?? local, posterSrc);
            stored.delete(id);
          })
          .catch(() => {});
      }
    } else {
      const size = await imageSize(local);
      attrs = { src: local, width: size.width || null, height: size.height || null, upload: id };
    }
    const node = type.create(attrs);
    if (at == null) insertBlock(type, attrs)(view.state, view.dispatch);
    else {
      // Where it was dropped, or the nearest place a block fits if the text changed meanwhile;
      // the next file goes after it, so they keep their order.
      const tr = view.state.tr;
      const fit = insertPoint(tr.doc, Math.min(at, tr.doc.content.size), type) ?? tr.doc.content.size;
      tr.insert(fit, node);
      view.dispatch(tr);
      at = fit + node.nodeSize;
    }
    void send(view, id, upload);
  }
}

/** Where each video's upload landed, for its poster if that lands after it. */
const stored = new Map<string, string>();

/** A poster that arrived after its video's own upload: found by the video's stored address. */
function setPosterBySource(view: EditorView, src: string, poster: string) {
  view.state.doc.descendants((node, pos) => {
    if (node.type.name === "video" && (node.attrs.sources as VideoSource[]).some((s) => s.src === src)) {
      view.dispatch(view.state.tr.setNodeAttribute(pos, "poster", poster).setMeta("addToHistory", false));
      return false;
    }
    return true;
  });
}

// ---- Node views ---------------------------------------------------------------------------------

/** Under an uploading figure: the bar, then on failure what went wrong, with Retry and Remove. */
function uploadStatus(view: EditorView, getPos: () => number | undefined, id: string, upload: Upload | undefined) {
  const status = document.createElement("beautiful-editor-upload");
  status.contentEditable = "false";
  const bar = document.createElement("progress");
  bar.max = 1;
  bar.setAttribute("aria-label", "Uploading");
  const message = document.createElement("p");
  const retry = document.createElement("button");
  retry.type = "button";
  retry.dataset.variant = "secondary";
  retry.textContent = "Retry";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.dataset.variant = "tertiary";
  remove.textContent = "Remove";
  status.append(bar, message, retry, remove);
  const update = () => {
    const job = pending.get(id);
    if (!job) return;
    bar.value = job.fraction;
    bar.hidden = !!job.error;
    message.hidden = retry.hidden = remove.hidden = !job.error;
    message.textContent = job.error ? `Not uploaded. ${job.error}` : "";
    if (job.error) status.dataset.error = "";
    else delete status.dataset.error;
  };
  retry.addEventListener("click", () => upload && void send(view, id, upload));
  remove.addEventListener("click", () => {
    const pos = getPos();
    if (pos == null) return;
    const node = view.state.doc.nodeAt(pos);
    if (node) view.dispatch(view.state.tr.delete(pos, pos + node.nodeSize));
    pending.delete(id);
  });
  pending.get(id)?.listeners.add(update);
  update();
  return { status, dispose: () => pending.get(id)?.listeners.delete(update) };
}

/** The "Add alt text" mark on a picture or video that has none. It opens the alt text editor. */
function altMark(onClick: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.variant = "secondary";
  button.dataset.alt = "";
  button.contentEditable = "false";
  button.textContent = "Add alt text";
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("click", onClick);
  return button;
}

type FigureView = NodeView & { contentDOM: HTMLElement };

function imageView(context: ExtensionContext, editAlt: (view: EditorView, pos: number) => void): NodeViewConstructor {
  return (node, view, getPos) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.draggable = false;
    const caption = document.createElement("figcaption");
    caption.dataset.placeholder = "Add a caption";
    const alt = altMark(() => {
      const pos = getPos();
      if (pos != null) editAlt(view, pos);
    });
    figure.append(img, alt, caption);
    let status: ReturnType<typeof uploadStatus> | undefined;
    const set = (n: Node) => {
      const src = safeSrc(n.attrs.src);
      if (src && img.getAttribute("src") !== src) {
        // A stored copy replacing the local one: swap once it has loaded.
        const next = new Image();
        next.onload = () => (img.src = src);
        next.src = src;
        if (!img.getAttribute("src")) img.src = src;
      }
      img.alt = n.attrs.alt ?? "";
      if (n.attrs.width) img.width = n.attrs.width;
      if (n.attrs.height) img.height = n.attrs.height;
      figure.dataset.width = widthOf(n.attrs.width_mode);
      alt.hidden = !!n.attrs.alt || !view.editable;
      if (n.attrs.upload && !status) {
        status = uploadStatus(view, getPos, n.attrs.upload, context.upload);
        figure.insertBefore(status.status, caption);
        figure.setAttribute("aria-busy", "true");
      } else if (!n.attrs.upload && status) {
        status.dispose();
        status.status.remove();
        status = undefined;
        figure.removeAttribute("aria-busy");
      }
    };
    set(node);
    const view_: FigureView = {
      dom: figure,
      contentDOM: caption,
      update(next) {
        if (next.type !== node.type) return false;
        node = next;
        set(next);
        return true;
      },
      selectNode: () => figure.setAttribute("data-selected", ""),
      deselectNode: () => figure.removeAttribute("data-selected"),
      stopEvent: (event) => event.target instanceof HTMLButtonElement,
      ignoreMutation: (mutation) => !caption.contains(mutation.target),
      destroy: () => status?.dispose(),
    };
    return view_;
  };
}

/** Videos that loop play only while on screen, and never on their own under reduced motion. */
let observer: IntersectionObserver | undefined;
function watchLoop(video: HTMLVideoElement) {
  if (typeof IntersectionObserver === "undefined") return () => {};
  observer ??= new IntersectionObserver((entries) => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const entry of entries) {
      const el = entry.target as HTMLVideoElement;
      if (entry.isIntersecting && !still && !el.dataset.paused) void el.play().catch(() => {});
      else el.pause();
    }
  });
  observer.observe(video);
  return () => observer?.unobserve(video);
}

/** The player for a YouTube or Vimeo video: built from its id, never from a pasted address. */
export function providerEmbed(provider: string, id: string): string | null {
  if (provider === "youtube" && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
  if (provider === "vimeo" && /^\d{1,12}$/.test(id)) return `https://player.vimeo.com/video/${id}`;
  return null;
}

/** A YouTube or Vimeo link, as pasted on its own: its provider and the video's id. */
export function providerOf(url: string): { provider: "youtube" | "vimeo"; id: string } | null {
  const text = url.trim();
  const youtube = text.match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})(?:[?&#].*)?$/i);
  if (youtube) return { provider: "youtube", id: youtube[1]! };
  const vimeo = text.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d{1,12})(?:[/?#].*)?$/i);
  if (vimeo) return { provider: "vimeo", id: vimeo[1]! };
  return null;
}

function videoMedia(n: Node, inEditor: boolean): HTMLElement {
  const src = n.attrs.provider ? providerEmbed(n.attrs.provider, n.attrs.videoId) : null;
  if (n.attrs.provider) {
    const frame = document.createElement("iframe");
    if (src) frame.src = src;
    frame.title = n.attrs.alt || "Video";
    frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation allow-popups");
    frame.setAttribute("allow", "fullscreen; picture-in-picture; encrypted-media");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.loading = "lazy";
    // In the editor a click selects the block; the player is for the published page.
    if (inEditor) frame.tabIndex = -1;
    return frame;
  }
  const video = document.createElement("video");
  const loop = n.attrs.mode !== "player";
  video.playsInline = true;
  video.preload = loop ? "none" : "metadata";
  if (loop) {
    video.muted = true;
    video.loop = true;
    video.setAttribute("muted", "");
  } else video.controls = true;
  if (n.attrs.poster && safeSrc(n.attrs.poster)) video.poster = safeSrc(n.attrs.poster)!;
  if (n.attrs.width) video.width = n.attrs.width;
  if (n.attrs.height) video.height = n.attrs.height;
  if (n.attrs.alt) video.setAttribute("aria-label", n.attrs.alt);
  for (const source of (n.attrs.sources as VideoSource[]) ?? []) {
    const s = safeSrc(source.src);
    if (!s) continue;
    const el = document.createElement("source");
    el.src = s;
    if (source.type) el.type = source.type;
    video.append(el);
  }
  return video;
}

function videoView(context: ExtensionContext, editAlt: (view: EditorView, pos: number) => void): NodeViewConstructor {
  return (node, view, getPos) => {
    const figure = document.createElement("figure");
    const caption = document.createElement("figcaption");
    caption.dataset.placeholder = "Add a caption";
    const alt = altMark(() => {
      const pos = getPos();
      if (pos != null) editAlt(view, pos);
    });
    let media = videoMedia(node, true);
    let unwatch = () => {};
    let status: ReturnType<typeof uploadStatus> | undefined;
    const wire = () => {
      unwatch();
      unwatch = media instanceof HTMLVideoElement && media.loop ? watchLoop(media) : () => {};
      if (media instanceof HTMLVideoElement && media.loop) {
        media.addEventListener("click", (event) => {
          const v = event.currentTarget as HTMLVideoElement;
          if (v.paused) {
            delete v.dataset.paused;
            void v.play().catch(() => {});
          } else {
            v.dataset.paused = "";
            v.pause();
          }
        });
      }
    };
    figure.append(media, alt, caption);
    wire();
    let shown = JSON.stringify([node.attrs.sources, node.attrs.mode, node.attrs.provider, node.attrs.videoId, node.attrs.poster]);
    const set = (n: Node) => {
      const key = JSON.stringify([n.attrs.sources, n.attrs.mode, n.attrs.provider, n.attrs.videoId, n.attrs.poster]);
      if (key !== shown) {
        shown = key;
        const next = videoMedia(n, true);
        media.replaceWith(next);
        media = next;
        wire();
      }
      figure.dataset.width = widthOf(n.attrs.width_mode);
      alt.hidden = !!n.attrs.alt || !view.editable;
      if (n.attrs.upload && !status) {
        status = uploadStatus(view, getPos, n.attrs.upload, context.upload);
        figure.insertBefore(status.status, caption);
        figure.setAttribute("aria-busy", "true");
      } else if (!n.attrs.upload && status) {
        status.dispose();
        status.status.remove();
        status = undefined;
        figure.removeAttribute("aria-busy");
      }
    };
    set(node);
    const nodeView: FigureView = {
      dom: figure,
      contentDOM: caption,
      update(next) {
        if (next.type !== node.type) return false;
        node = next;
        set(next);
        return true;
      },
      selectNode: () => figure.setAttribute("data-selected", ""),
      deselectNode: () => figure.removeAttribute("data-selected"),
      stopEvent: (event) => event.target instanceof HTMLButtonElement || (event.target === media && event.type === "click"),
      ignoreMutation: (mutation) => !caption.contains(mutation.target),
      destroy: () => {
        unwatch();
        status?.dispose();
      },
    };
    return nodeView;
  };
}

function embedView(context: ExtensionContext): NodeViewConstructor {
  return (node, view, getPos) => {
    const dom = document.createElement("beautiful-editor-embed");
    dom.contentEditable = "false";
    dom.dataset.type = node.attrs.type;
    const definition = context.embeds[node.attrs.type] as EmbedDefinition | undefined;
    const header = document.createElement("header");
    const body = document.createElement("beautiful-editor-embed-body");
    dom.append(header, body);
    const [props, setPropsSignal] = createSignal<Record<string, unknown>>(node.attrs.props ?? {});
    const [selected, setSelected] = createSignal(false);
    const setProps = (next: Record<string, unknown>) => {
      const pos = getPos();
      if (pos == null) return;
      view.dispatch(view.state.tr.setNodeAttribute(pos, "props", next));
    };
    const dispose = render(
      () => [
        definition?.icon?.() ?? icons.embed(),
        definition?.label ?? `Unknown block: ${node.attrs.type}`,
      ],
      header,
    );
    const disposeBody = definition
      ? render(() => definition.component({ get props() { return props(); }, setProps, get selected() { return selected(); } }), body)
      : () => {};
    return {
      dom,
      update(next) {
        if (next.type !== node.type || next.attrs.type !== node.attrs.type) return false;
        node = next;
        setPropsSignal(next.attrs.props ?? {});
        return true;
      },
      selectNode: () => {
        dom.setAttribute("data-selected", "");
        setSelected(true);
      },
      deselectNode: () => {
        dom.removeAttribute("data-selected");
        setSelected(false);
      },
      // The block's own controls are the app's: the editor leaves their events alone.
      stopEvent: (event) => body.contains(event.target as globalThis.Node),
      ignoreMutation: () => true,
      destroy: () => {
        dispose();
        disposeBody();
      },
    };
  };
}

// ---- The extensions -----------------------------------------------------------------------------

const figureWidth = { width_mode: { default: "text" } };

/** Where a selected picture, video or embed is, if one is selected. */
function selectedNode(state: EditorState, type: NodeType | undefined) {
  const { selection } = state;
  return type && selection instanceof NodeSelection && selection.node.type === type ? selection : undefined;
}

function nodeActions(type: NodeType | undefined, label: string, extra: EditorAction[] = []): EditorAction[] {
  if (!type) return [];
  const shows = ({ state }: EditorContext) => !selectedNode(state, type);
  const widthAction = (width: FigureWidth, text: string): EditorAction => ({
    id: `${type.name}-width-${width}`,
    label: text,
    hidden: shows,
    active: ({ state }) => widthOf(selectedNode(state, type)?.node.attrs.width_mode) === width,
    run: ({ state, view }) => {
      const sel = selectedNode(state, type);
      if (sel) view.dispatch(state.tr.setNodeAttribute(sel.from, "width_mode", width));
    },
  });
  return [
    {
      id: `${type.name}-alt`,
      label: "Alt text…",
      icon: icons.alt,
      description: `Describes the ${label} for people who can't see it.`,
      hidden: shows,
      run: ({ state, editor }) => {
        const sel = selectedNode(state, type);
        if (sel) altEditors.get(editor)?.(sel.from);
      },
    },
    ...extra,
    {
      id: `${type.name}-width`,
      label: "Width",
      icon: icons.width,
      hidden: shows,
      actions: [{ heading: undefined, select: "one", actions: [widthAction("text", "Text width"), widthAction("wide", "Wide"), widthAction("full", "Full width")] }],
    },
    {
      id: `${type.name}-remove`,
      label: "Remove",
      icon: icons.remove,
      color: "danger",
      hidden: shows,
      run: ({ state, view }) => {
        const sel = selectedNode(state, type);
        if (sel) view.dispatch(state.tr.deleteSelection().scrollIntoView());
        view.focus();
      },
    },
  ];
}

/** Each editor's way to open its alt text editor, set by the Editor when it mounts. */
export const altEditors = new WeakMap<object, (pos: number) => void>();

/** Pictures: pasted, dropped or picked from the slash menu, with alt text, a caption and a width. */
export const image: Extension = {
  name: "image",
  nodes: {
    image: {
      group: "block",
      content: "inline*",
      marks: "",
      draggable: true,
      isolating: true,
      attrs: {
        src: {},
        alt: { default: "" },
        width: { default: null },
        height: { default: null },
        upload: { default: null },
        ...figureWidth,
      },
      parseDOM: [
        {
          tag: "figure",
          contentElement: caption,
          getAttrs: (dom) => {
            const img = (dom as HTMLElement).querySelector("img");
            const src = safeSrc(img?.getAttribute("src"));
            if (!img || !src) return false;
            return {
              src,
              alt: img.getAttribute("alt") ?? "",
              width: Number(img.getAttribute("width")) || null,
              height: Number(img.getAttribute("height")) || null,
              width_mode: widthOf((dom as HTMLElement).dataset.width),
            };
          },
        },
        {
          tag: "img[src]",
          getAttrs: (dom) => {
            const src = safeSrc((dom as HTMLElement).getAttribute("src"));
            if (!src) return false;
            return {
              src,
              alt: (dom as HTMLElement).getAttribute("alt") ?? "",
              width: Number((dom as HTMLElement).getAttribute("width")) || null,
              height: Number((dom as HTMLElement).getAttribute("height")) || null,
            };
          },
        },
      ],
      toDOM: (node) => [
        "figure",
        node.attrs.width_mode !== "text" ? { "data-width": node.attrs.width_mode } : {},
        [
          "img",
          {
            src: safeSrc(node.attrs.src) ?? "",
            alt: node.attrs.alt ?? "",
            ...(node.attrs.width ? { width: node.attrs.width } : {}),
            ...(node.attrs.height ? { height: node.attrs.height } : {}),
          },
        ],
        ["figcaption", 0],
      ],
    },
  },
  actions: ({ schema, upload }) => {
    const type = schema.nodes.image;
    if (!type) return [];
    return [
      {
        section: "insert",
        actions: [
          {
            id: "image",
            label: "Image",
            icon: icons.image,
            description: upload ? "Upload or paste a picture." : "Add a picture by its address.",
            keywords: ["picture", "photo", "img", "figure"],
            in: ["slash"],
            run: ({ editor }) => editor.pickFiles("image/*"),
          },
        ],
      },
      {
        section: "node",
        actions: nodeActions(type, "picture", [
          {
            id: "image-replace",
            label: "Replace…",
            icon: icons.replace,
            hidden: ({ state }) => !upload || !selectedNode(state, type),
            run: ({ editor }) => editor.pickFiles("image/*"),
          },
        ]),
      },
    ];
  },
  nodeViews: (context) => ({ image: imageView(context, (view, pos) => altFor(view, pos)) }),
  plugins: (context) => [filesPlugin(context)],
};

/** The alt text editor for the node at pos, found by its view's editor. */
const viewEditors = new WeakMap<EditorView, object>();
export function bindAltEditor(view: EditorView, editor: object, open: (pos: number) => void) {
  viewEditors.set(view, editor);
  altEditors.set(editor, open);
}
function altFor(view: EditorView, pos: number) {
  const editor = viewEditors.get(view);
  if (editor) altEditors.get(editor)?.(pos);
}

/**
 * Videos: an uploaded clip, which loops muted and in place while it's on screen, as a help page's
 * five-second demo does, or plays with controls (mode "player"). Or a YouTube or Vimeo link pasted
 * on its own line, drawn as that site's player.
 */
export const video: Extension = {
  name: "video",
  nodes: {
    video: {
      group: "block",
      content: "inline*",
      marks: "",
      draggable: true,
      isolating: true,
      attrs: {
        sources: { default: [] },
        poster: { default: null },
        width: { default: null },
        height: { default: null },
        alt: { default: "" },
        mode: { default: "loop" },
        provider: { default: null },
        videoId: { default: null },
        upload: { default: null },
        ...figureWidth,
      },
      parseDOM: [
        {
          tag: "figure",
          contentElement: caption,
          getAttrs: (dom) => {
            const el = dom as HTMLElement;
            const video = el.querySelector("video");
            const frame = el.querySelector("iframe");
            if (video) return videoAttrs(video, el);
            if (frame) return frameAttrs(frame, el);
            return false;
          },
        },
        { tag: "video", getAttrs: (dom) => videoAttrs(dom as HTMLVideoElement) },
        { tag: "iframe[src]", getAttrs: (dom) => frameAttrs(dom as HTMLIFrameElement) },
      ],
      toDOM: (node) => {
        const box = node.attrs.width_mode !== "text" ? { "data-width": node.attrs.width_mode } : {};
        if (node.attrs.provider) {
          const src = providerEmbed(node.attrs.provider, node.attrs.videoId);
          return [
            "figure",
            box,
            [
              "iframe",
              {
                src: src ?? "",
                title: node.attrs.alt || "Video",
                sandbox: "allow-scripts allow-same-origin allow-presentation allow-popups",
                allow: "fullscreen; picture-in-picture; encrypted-media",
                loading: "lazy",
              },
            ],
            ["figcaption", 0],
          ];
        }
        const loop = node.attrs.mode !== "player";
        const attrs: Record<string, string> = loop
          ? { muted: "", loop: "", playsinline: "", preload: "none", "data-mode": "loop" }
          : { controls: "", playsinline: "", preload: "metadata" };
        if (safeSrc(node.attrs.poster)) attrs.poster = safeSrc(node.attrs.poster)!;
        if (node.attrs.width) attrs.width = String(node.attrs.width);
        if (node.attrs.height) attrs.height = String(node.attrs.height);
        if (node.attrs.alt) attrs["aria-label"] = node.attrs.alt;
        const sources = ((node.attrs.sources as VideoSource[]) ?? []).flatMap((s) => {
          const src = safeSrc(s.src);
          return src && !src.startsWith("blob:") ? [["source", s.type ? { src, type: s.type } : { src }] as const] : [];
        });
        return ["figure", box, ["video", attrs, ...sources], ["figcaption", 0]];
      },
    },
  },
  actions: ({ schema, upload }) => {
    const type = schema.nodes.video;
    if (!type) return [];
    const mode = (m: VideoMode, label: string, description: string): EditorAction => ({
      id: `video-${m}`,
      label,
      description,
      hidden: ({ state }) => {
        const sel = selectedNode(state, type);
        return !sel || !!sel.node.attrs.provider;
      },
      active: ({ state }) => (selectedNode(state, type)?.node.attrs.mode ?? "loop") === m,
      run: ({ state, view }) => {
        const sel = selectedNode(state, type);
        if (sel) view.dispatch(state.tr.setNodeAttribute(sel.from, "mode", m));
      },
    });
    return [
      {
        section: "insert",
        actions: [
          {
            id: "video",
            label: "Video",
            icon: icons.video,
            description: upload ? "Upload a clip, or paste a YouTube or Vimeo link." : "Paste a YouTube or Vimeo link.",
            keywords: ["movie", "clip", "youtube", "vimeo", "loop", "gif"],
            in: ["slash"],
            run: ({ editor }) => editor.pickFiles("video/mp4,video/webm"),
          },
        ],
      },
      {
        section: "node",
        actions: nodeActions(type, "video", [
          {
            id: "video-mode",
            label: "Plays",
            hidden: ({ state }) => {
              const sel = selectedNode(state, type);
              return !sel || !!sel.node.attrs.provider;
            },
            actions: [
              {
                select: "one",
                actions: [
                  mode("loop", "On a loop", "Silent, on repeat, while it's on screen."),
                  mode("player", "With controls", "Waits for a press of play, with sound."),
                ],
              },
            ],
          },
        ]),
      },
    ];
  },
  nodeViews: (context) => ({ video: videoView(context, (view, pos) => altFor(view, pos)) }),
  plugins: (context) => [filesPlugin(context), videoLinks(context.schema)],
};

function videoAttrs(video: HTMLVideoElement, figure?: HTMLElement) {
  const sources = [...video.querySelectorAll("source")].flatMap((s) => {
    const src = safeSrc(s.getAttribute("src"));
    return src ? [{ src, type: s.getAttribute("type") ?? undefined }] : [];
  });
  const own = safeSrc(video.getAttribute("src"));
  if (own) sources.push({ src: own, type: undefined });
  if (!sources.length) return false;
  return {
    sources,
    poster: safeSrc(video.getAttribute("poster")),
    width: Number(video.getAttribute("width")) || null,
    height: Number(video.getAttribute("height")) || null,
    alt: video.getAttribute("aria-label") ?? "",
    mode: video.hasAttribute("controls") ? "player" : "loop",
    width_mode: widthOf(figure?.dataset.width),
  };
}

function frameAttrs(frame: HTMLIFrameElement, figure?: HTMLElement) {
  const found = providerOf(
    (frame.getAttribute("src") ?? "")
      .replace("youtube-nocookie.com/embed/", "youtube.com/embed/")
      .replace("player.vimeo.com/video/", "vimeo.com/"),
  );
  if (!found) return false;
  return { provider: found.provider, videoId: found.id, alt: frame.getAttribute("title") ?? "", width_mode: widthOf(figure?.dataset.width) };
}

/** A YouTube or Vimeo link pasted on its own becomes its player. */
function videoLinks(schema: Schema) {
  return new Plugin({
    props: {
      handlePaste(view, event) {
        const type = schema.nodes.video;
        const text = event.clipboardData?.getData("text/plain");
        if (!type || !text || event.clipboardData?.getData("text/html")) return false;
        const found = providerOf(text);
        if (!found) return false;
        insertBlock(type, { provider: found.provider, videoId: found.id, mode: "player" })(view.state, view.dispatch);
        return true;
      },
    },
  });
}

/** Files pasted or dropped into the text upload and show where they landed. One per editor. */
const filesPlugins = new WeakMap<ExtensionContext, Plugin>();
function filesPlugin(context: ExtensionContext) {
  const existing = filesPlugins.get(context);
  if (existing) return existing;
  const plugin = new Plugin({
    props: {
      handlePaste(view, event) {
        const files = [...(event.clipboardData?.files ?? [])];
        if (!files.length) return false;
        void addFiles(view, files, context.upload);
        return true;
      },
      handleDrop(view, event, _slice, moved) {
        const files = [...((event as DragEvent).dataTransfer?.files ?? [])];
        if (moved || !files.length) return false;
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
        const pos = at ? view.state.doc.resolve(at.pos) : undefined;
        // On a line of its own: after the block it was dropped on.
        void addFiles(view, files, context.upload, pos ? (pos.depth ? pos.after(1) : pos.pos) : undefined);
        event.preventDefault();
        return true;
      },
    },
  });
  filesPlugins.set(context, plugin);
  return plugin;
}

/**
 * An app's own blocks: each type in the Editor's embeds is a block in the slash menu, drawn by
 * its component. It stores only { type, props }: never HTML.
 */
export const embed: Extension = {
  name: "embed",
  nodes: {
    embed: {
      group: "block",
      atom: true,
      draggable: true,
      attrs: { type: {}, props: { default: {} } },
      parseDOM: [
        {
          tag: "beautiful-editor-embed[data-type]",
          getAttrs: (dom) => {
            const el = dom as HTMLElement;
            let props: unknown = {};
            try {
              props = JSON.parse(el.dataset.props ?? "{}");
            } catch {
              props = {};
            }
            return { type: el.dataset.type, props: props && typeof props === "object" && !Array.isArray(props) ? props : {} };
          },
        },
      ],
      toDOM: (node) => ["beautiful-editor-embed", { "data-type": node.attrs.type, "data-props": JSON.stringify(node.attrs.props ?? {}) }],
    },
  },
  actions: ({ schema, embeds }) => {
    const type = schema.nodes.embed;
    if (!type) return [];
    return [
      {
        section: "insert",
        actions: Object.entries(embeds).map(([name, definition]) => ({
          id: `embed-${name}`,
          label: definition.label,
          description: definition.description,
          icon: definition.icon ?? icons.embed,
          keywords: [...(definition.keywords ?? []), "embed", "block", name],
          in: ["slash" as const],
          run: ({ state, view }: EditorContext) => {
            insertBlock(type, { type: name, props: { ...(definition.defaults ?? {}) } })(state, view.dispatch);
            view.focus();
          },
        })),
      },
      { section: "node", actions: nodeActions(type, "block").filter((a) => a.id === `${type.name}-remove`) },
    ];
  },
  nodeViews: (context) => ({ embed: embedView(context) }),
};
