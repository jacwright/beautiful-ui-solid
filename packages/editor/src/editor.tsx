import {
  type ActionList,
  actionKeys,
  addShortcuts,
  ariaKeys,
  contextMenu,
  Field,
  findActions,
  IconButton,
  Input,
  keyLabel,
  Label,
  openActions,
  runActionKey,
  useField,
  Button,
} from "beautiful-ui-solid";
import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, createSignal, createUniqueId, For, onCleanup, onSettled, Show, untrack } from "solid-js";
import { EditorState, NodeSelection, TextSelection, type Plugin, type Transaction } from "prosemirror-state";
import type { Node, Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { build, type Built } from "./build.ts";
import { insertBlock, safeHref, safeSrc } from "./commands.ts";
import { parse, serialize, type Codec, type Format } from "./format.ts";
import { icons } from "./icons.tsx";
import { addFiles, bindAltEditor, providerOf } from "./extensions/media.ts";
import { presets, type Preset } from "./presets.ts";
import type { EditorAction, EditorActions, EditorContext, EditorHandle, EmbedDefinition, Extension, Surface, Upload } from "./types.ts";

/**
 * Editor: rich text people write in, on ProseMirror, with none of its setup left to the app.
 * The look is the kit's CSS (styles/elements/editor.css). The spec is the docs site's Editor page.
 *
 * Extensions (or a preset of them) make the schema, keys and actions. Every menu draws one action
 * list: the selection toolbar, the slash menu, the right-click menu (Context menu's), and the fixed
 * toolbar when asked for. In a Field it takes the label, description and error, as Input does.
 */

type MenuOption = boolean | ((actions: EditorActions, context: EditorContext) => ActionList<EditorContext>);

export type EditorProps = {
  /** What it can hold. Ignored when extensions is given. */
  preset?: Preset;
  /** The features, in place of a preset. */
  extensions?: Extension[];
  /** A schema of the app's own, with the names the extensions use. They then add no nodes or marks. */
  schema?: Schema;
  /** The text, in format. */
  value?: unknown;
  format?: Format;
  /** The value as the person pauses typing, and when the editor loses focus. */
  onChange?: (value: unknown) => void;
  /** Shown on the empty editor's first line. */
  placeholder?: string;
  /** Changes the one list every menu and key reads. */
  actions?: (defaults: EditorActions) => EditorActions;
  menus?: { bubble?: MenuOption; slash?: MenuOption; context?: MenuOption; toolbar?: MenuOption };
  upload?: Upload;
  embeds?: Record<string, EmbedDefinition<any>>;
  appearance?: "well" | "plain";
  readOnly?: boolean;
  disabled?: boolean;
  /** Its name, where no Field's label names it. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  id?: string;
  /** Sees every transaction before it applies, and applies it, or another in its place, as suggested edits do. */
  dispatch?: (tr: Transaction, apply: (tr: Transaction) => void, view: EditorView) => void;
  /** Called after each transaction applies. */
  onTransaction?: (tr: Transaction, view: EditorView) => void;
  /** More ProseMirror props for the view, such as handleClick. */
  editorProps?: Partial<ConstructorParameters<typeof EditorView>[1]>;
  ref?: (editor: EditorHandle) => void;
  class?: string;
};

const debounce = 400;

/** Actions as a surface shows them: the groups as Context menu's ActionList. */
const asList = (groups: EditorActions): ActionList<EditorContext> =>
  groups.map(({ heading, select, actions }) => ({ heading, select, actions }));

/** The actions of the groups that show on a surface, keeping their groups. */
const onSurface = (groups: EditorActions, surface: Surface): EditorActions =>
  groups.map((g) => ({ ...g, actions: g.actions.filter((a) => a.in?.includes(surface)) })).filter((g) => g.actions.length);

/** Lowercase words a query matches: the label's and the keywords'. */
/** Where a node is in the document: the one with the same type and attributes, as it may have moved. */
function findNode(doc: Node, wanted: Node): number | undefined {
  let found: number | undefined;
  doc.descendants((node, pos) => {
    if (found == null && node.type === wanted.type && node.sameMarkup(wanted)) found = pos;
    return found == null;
  });
  return found;
}

export function Editor(props: EditorProps) {
  const own = createUniqueId();
  const field = useField({
    get "aria-describedby"() {
      return props["aria-describedby"];
    },
    get "aria-invalid"() {
      return props["aria-invalid"] === true ? "true" : props["aria-invalid"] || undefined;
    },
    get disabled() {
      return props.disabled;
    },
  });
  const id = () => field.id ?? props.id ?? `${own}-text`;
  const preset = untrack(() => props.preset ?? "text");
  const extensions = untrack(() => props.extensions ?? presets[preset]);
  const format = untrack(() => props.format ?? "json");
  const inline = untrack(() => (props.schema ?? null) === null && extensions.some((e) => e.name === "singleLine"));
  const appearance = () => props.appearance ?? (preset === "post" && !props.extensions ? "plain" : "well");
  const editable = () => !props.readOnly && !field.disabled;

  const [tick, setTick] = createSignal(0);
  const [focused, setFocused] = createSignal(false);
  const [labelledBy, setLabelledBy] = createSignal<string>();
  let view: EditorView | undefined;
  let built: Built | undefined;
  let markdown: Codec | undefined;
  let frame!: HTMLElement;
  let content!: HTMLElement;
  let anchor!: HTMLElement;
  let bubble: HTMLElement | undefined;
  let slash: HTMLElement | undefined;
  let prompt: HTMLElement | undefined;
  let fileInput!: HTMLInputElement;

  const state = () => {
    tick();
    return view?.state;
  };
  const context = (): EditorContext | undefined => (view ? { state: view.state, view, editor: handle } : undefined);
  // Read tick first: built arrives after mounting, and the memo must have tracked something to rerun.
  const actions = createMemo(() => (tick() >= 0 && built ? (props.actions ?? ((a) => a))(built.actions) : []));

  // ---- Value in and out --------------------------------------------------------------------------

  let lastSent: unknown;
  let sentKey: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const keyOf = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value ?? null));
  const current = () => (view ? serialize(view.state.doc, format, markdown) : untrack(() => props.value));
  function send() {
    clearTimeout(timer);
    timer = undefined;
    if (!view || !props.onChange) return;
    const value = current();
    const key = keyOf(value);
    if (key === sentKey) return;
    lastSent = value;
    sentKey = key;
    props.onChange(value);
  }
  function setDoc(doc: Node) {
    if (!view || !built) return;
    view.updateState(EditorState.create({ doc, plugins: view.state.plugins }));
    setTick((n) => n + 1);
  }

  /** Applies a transaction to the view: what every dispatch ends in. */
  function apply(tr: Transaction) {
    if (!view) return;
    view.updateState(view.state.apply(tr));
    setTick((n) => n + 1);
    props.onTransaction?.(tr, view);
    if (tr.docChanged && props.onChange) {
      clearTimeout(timer);
      timer = setTimeout(send, debounce);
    }
  }

  // ---- The handle --------------------------------------------------------------------------------

  const handle: EditorHandle = {
    get view() {
      return view;
    },
    state,
    value: current,
    setValue(value) {
      if (!built) return;
      setDoc(parse(value, format, built.schema, markdown));
      sentKey = keyOf(value);
    },
    run(actionId) {
      const ctx = context();
      if (!ctx) return false;
      const all = actions().flatMap((g) => g.actions);
      const found = all.find((a) => a.id === actionId);
      if (!found?.run || found.enabled?.(ctx) === false || found.hidden?.(ctx)) return false;
      found.run(ctx);
      return true;
    },
    focus: () => view?.focus(),
    editLink: () => openLink(),
    editAlt: (pos) => openAlt(pos),
    apply: (tr) => apply(tr),
    setState(next) {
      if (!view) return;
      view.updateState(next);
      setTick((n) => n + 1);
    },
    pickFiles(accept) {
      if (props.upload) {
        fileInput.accept = accept ?? "image/*,video/mp4,video/webm";
        fileInput.click();
      } else openAddress(accept?.startsWith("video") ? "video" : "image");
    },
    addFiles: (files) => view && void addFiles(view, files, props.upload),
  };

  // ---- Mounting ----------------------------------------------------------------------------------

  onSettled(() => {
    let cancelled = false;
    const start = async () => {
      if (format === "markdown") markdown = (await import("./markdown.ts")).markdown;
      if (cancelled) return;
      built = build(extensions, {
        schema: props.schema,
        upload: (file, progress) => (props.upload ? props.upload(file, progress) : Promise.reject(new Error("No upload."))),
        embeds: props.embeds,
        placeholder: () => ({
          empty: props.placeholder,
          line: preset === "post" || extensions.some((e) => e.name === "embed") ? "Write, or press / for blocks" : undefined,
          focused: focused(),
        }),
      });
      if (!props.upload) built.context.upload = undefined;
      const initial = untrack(() => props.value);
      const doc = parse(initial, format, built.schema, markdown);
      sentKey = keyOf(initial);
      lastSent = initial;
      view = new EditorView(
        { mount: content },
        {
          ...props.editorProps,
          state: EditorState.create({ doc, plugins: built.plugins as Plugin[] }),
          nodeViews: { ...built.nodeViews, ...props.editorProps?.nodeViews },
          editable: () => editable(),
          transformPasted: (slice, v) => {
            const cleaned = built!.paste(slice);
            return props.editorProps?.transformPasted ? props.editorProps.transformPasted(cleaned, v, false) : cleaned;
          },
          handleKeyDown: (v, event) => {
            if (slashKey(event)) return true;
            if (event.key === "F10" && event.altKey) {
              event.preventDefault();
              focusToolbar();
              return true;
            }
            if (props.editorProps?.handleKeyDown?.(v, event)) return true;
            const ctx = context();
            return !!ctx && runActionKey(asList(actions()), event, ctx);
          },
          dispatchTransaction: (tr) => (props.dispatch && view ? props.dispatch(tr, apply, view) : apply(tr)),
        },
      );
      bindAltEditor(view, handle, (pos) => openAlt(pos));
      setTick((n) => n + 1);
      props.ref?.(handle);
    };
    void start();

    // A Field's label names the text, and a click on it puts the cursor there.
    const label = content.ownerDocument.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id())}"]`);
    const onLabel = (event: MouseEvent) => {
      event.preventDefault();
      view?.focus();
    };
    if (label) {
      label.id ||= `${id()}-label`;
      setLabelledBy(label.id);
      label.addEventListener("click", onLabel);
    }
    return () => {
      cancelled = true;
      label?.removeEventListener("click", onLabel);
    };
  });

  onCleanup(() => {
    if (timer) send();
    view?.destroy();
    view = undefined;
  });

  // A new value from outside replaces the text, unless it's what the editor last sent.
  createEffect(
    () => props.value,
    (value) => {
      if (!view || !built || keyOf(value) === sentKey) return;
      setDoc(parse(value, format, built.schema, markdown));
      sentKey = keyOf(value);
      lastSent = value;
    },
  );
  void lastSent;

  // The view reads editable when its state changes: tell it when the prop does.
  createEffect(editable, () => {
    view?.setProps({});
  });

  // ---- Focus -------------------------------------------------------------------------------------

  const within = (el: EventTarget | null) => el instanceof globalThis.Node && frame?.contains(el);
  const popupHasFocus = () => [bubble, slash, prompt].some((p) => p?.contains(content.ownerDocument.activeElement));
  function onFocusIn() {
    if (!focused()) {
      setFocused(true);
      view?.dispatch(view.state.tr.setMeta("focus", true));
    }
  }
  function onFocusOut(event: FocusEvent) {
    if (within(event.relatedTarget) || popupHasFocus()) return;
    setFocused(false);
    view?.dispatch(view.state.tr.setMeta("focus", false));
    send();
  }

  // ---- Where popups sit --------------------------------------------------------------------------

  /** Puts the anchor over a rectangle given in the window's coordinates, inside the frame so it scrolls with the text. */
  function placeAnchor(rect: { left: number; top: number; right: number; bottom: number }) {
    const box = frame.getBoundingClientRect();
    Object.assign(anchor.style, {
      left: `${rect.left - box.left}px`,
      top: `${rect.top - box.top}px`,
      width: `${Math.max(rect.right - rect.left, 1)}px`,
      height: `${Math.max(rect.bottom - rect.top, 1)}px`,
    });
  }
  function selectionRect() {
    if (!view) return undefined;
    const { from, to } = view.state.selection;
    const a = view.coordsAtPos(from);
    const b = view.coordsAtPos(to, -1);
    return { left: Math.min(a.left, b.left), right: Math.max(a.right, b.right), top: Math.min(a.top, b.top), bottom: Math.max(a.bottom, b.bottom) };
  }
  const show = (popup: HTMLElement | undefined) => {
    if (!popup || popup.matches(":popover-open")) return;
    popup.showPopover({ source: anchor } as ShowPopoverOptions);
  };
  const hide = (popup: HTMLElement | undefined) => popup?.matches(":popover-open") && popup.hidePopover();

  // ---- The selection toolbar ---------------------------------------------------------------------

  const [pointerDown, setPointerDown] = createSignal(false);
  const bubbleOn = () => props.menus?.bubble !== false;
  const bubbleActions = () => {
    const all = actions();
    const ctx = context();
    if (!ctx) return [];
    const custom = props.menus?.bubble;
    if (typeof custom === "function") return custom(all, ctx);
    return withTurnInto(asList(onSurface(all, "bubble")));
  };
  const turnIntoAction = (): EditorAction | undefined => {
    const blocks = actions().find((g) => g.section === "blocks");
    if (!blocks || blocks.actions.length < 2) return undefined;
    return {
      id: "turn-into",
      label: "Turn into",
      icon: icons.turnInto,
      hidden: ({ state }) => state.selection instanceof NodeSelection,
      actions: [{ select: "one", actions: blocks.actions }],
    };
  };
  const withTurnInto = (list: ActionList<EditorContext>): ActionList<EditorContext> => {
    const turn = turnIntoAction();
    return turn ? [...list, { actions: [turn] }] : list;
  };
  const bubbleWanted = createMemo(() => {
    const s = state();
    if (!s || !bubbleOn() || !focused() || pointerDown() || !editable()) return false;
    const sel = s.selection;
    if (!(sel instanceof TextSelection) || sel.empty || sel.$from.parent.type.spec.code) return false;
    return !slashState();
  });
  createEffect(
    () => [bubbleWanted(), tick()] as const,
    ([wanted]) => {
      if (!wanted) {
        hide(bubble);
        return;
      }
      const rect = selectionRect();
      if (rect) placeAnchor(rect);
      show(bubble);
    },
  );

  // ---- The fixed toolbar -------------------------------------------------------------------------

  const toolbarOn = () => !!props.menus?.toolbar;
  const toolbarActions = () => {
    const all = actions();
    const ctx = context();
    if (!ctx) return [];
    const custom = props.menus?.toolbar;
    if (typeof custom === "function") return custom(all, ctx);
    return asList(onSurface(all, "toolbar"));
  };
  let toolbar: HTMLElement | undefined;
  function focusToolbar() {
    const target = bubble?.matches(":popover-open") ? bubble : toolbar;
    target?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }

  // ---- The slash menu ----------------------------------------------------------------------------

  const [dismissedAt, setDismissedAt] = createSignal<number>();
  const [lit, setLit] = createSignal(0);
  const slashOn = () => props.menus?.slash !== false;
  /** The "/query" being typed, dismissed or not. */
  const typedSlash = createMemo(() => {
    const s = state();
    if (!s || !slashOn() || !focused() || !editable()) return undefined;
    const { $from, empty } = s.selection;
    if (!empty || !$from.parent.isTextblock || $from.parent.type.spec.code || $from.depth === 0) return undefined;
    const text = $from.parent.textContent;
    const match = /^\/([\p{L}\p{N} -]{0,24})$/u.exec(text);
    if (!match || $from.parentOffset !== text.length) return undefined;
    return { query: match[1]!, start: $from.start() };
  });
  // Escape closes it for this "/": once the slash is gone, the next one opens it again.
  createEffect(typedSlash, (typed) => {
    if (!typed) setDismissedAt(undefined);
  });
  const slashState = createMemo(() => {
    const typed = typedSlash();
    return typed && dismissedAt() !== typed.start ? typed : undefined;
  });
  const slashItems = createMemo(() => {
    const found = slashState();
    const ctx = context();
    if (!found || !ctx) return [];
    const custom = props.menus?.slash;
    const list = typeof custom === "function" ? custom(actions(), ctx) : asList(onSurface(actions(), "slash"));
    return findActions(
      list
        .flatMap((entry) => ("actions" in entry && !("id" in entry) ? entry.actions : [entry as EditorAction]))
        .filter((a) => !a.hidden?.(ctx) && a.enabled?.(ctx) !== false),
      found.query,
    );
  });
  createEffect(
    () => slashState()?.query,
    () => {
      setLit(0);
    },
  );
  // The lit option stays in sight as the arrows move it down a long list.
  createEffect(lit, (i) => {
    slash?.querySelector(`#${CSS.escape(optionId(i))}`)?.scrollIntoView({ block: "nearest" });
  });
  createEffect(
    () => [slashState(), slashItems().length] as const,
    ([found, count]) => {
      if (!found || !count || !view) {
        hide(slash);
        return;
      }
      const at = view.coordsAtPos(found.start);
      placeAnchor({ left: at.left, right: at.left + 1, top: at.top, bottom: at.bottom });
      show(slash);
    },
  );
  function pickSlash(index: number) {
    const found = slashState();
    const action = slashItems()[index];
    if (!found || !action || !view) return;
    // The "/query" goes, then the action runs on the line it was typed on.
    view.dispatch(view.state.tr.delete(found.start, view.state.selection.from));
    const ctx = context();
    if (ctx) action.run?.(ctx);
    view.focus();
  }
  function slashKey(event: KeyboardEvent) {
    const found = slashState();
    const count = slashItems().length;
    if (!found || !count) return false;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const step = event.key === "ArrowDown" ? 1 : -1;
      setLit((i) => (i + step + count) % count);
      event.preventDefault();
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      pickSlash(lit());
      return true;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setDismissedAt(found.start);
      return true;
    }
    return false;
  }
  const slashId = () => `${id()}-blocks`;
  const optionId = (i: number) => `${slashId()}-${i}`;

  // ---- The right-click menu ----------------------------------------------------------------------

  const contextActions = (): ActionList<EditorContext> => {
    const ctx = context();
    if (!ctx) return [];
    const custom = props.menus?.context;
    if (typeof custom === "function") return custom(actions(), ctx);
    const out: ActionList<EditorContext> = [];
    for (const group of actions()) {
      if (group.section === "insert" || group.section === "blocks") continue;
      if (group.section === "marks") {
        // At a bare cursor, marks would only set what's typed next, and a picture takes none: the
        // menu offers them on selected words.
        const words = (c: EditorContext) => !c.state.selection.empty && !(c.state.selection instanceof NodeSelection);
        const actionsShown = group.actions.map((a) => ({ ...a, hidden: (c: EditorContext) => !words(c) || !!a.hidden?.(c) }));
        out.push({ heading: group.heading, actions: actionsShown });
        const turn = turnIntoAction();
        if (turn) out.push({ actions: [turn] });
        continue;
      }
      out.push({ heading: group.heading, select: group.select, actions: group.actions });
    }
    return out;
  };
  /** The position of the node a figure or embed's DOM draws, however deep it sits. */
  function blockPos(dom: Element): number | undefined {
    if (!view) return undefined;
    // An atom's position is the one before it; a figure's is inside, before its caption.
    const pos = view.posAtDOM(dom, 0);
    for (const at of [pos, pos - 1]) if (at >= 0 && view.nodeDOM(at) === dom) return at;
    const $pos = view.state.doc.resolve(pos);
    for (let d = $pos.depth; d > 0; d--) if (view.nodeDOM($pos.before(d)) === dom) return $pos.before(d);
    return undefined;
  }
  const contextOf = (target: Element) => {
    if (!view || props.menus?.context === false) return undefined;
    // A right-click on a picture, video or embed selects it, so its actions are what the menu offers.
    const block = target.closest("figure, beautiful-editor-embed");
    if (block && view.dom.contains(block) && !(target.closest("figcaption"))) {
      const at = blockPos(block);
      const node = at == null ? null : view.state.doc.nodeAt(at);
      if (at != null && node && NodeSelection.isSelectable(node) && !(view.state.selection instanceof NodeSelection && view.state.selection.from === at)) {
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, at)));
      }
    }
    return context();
  };

  // ---- The link editor, alt text and addresses ---------------------------------------------------

  type Prompt = {
    title: string;
    label: string;
    value: string;
    type: "url" | "text";
    hint?: string;
    remove?: () => void;
    save: (value: string) => string | undefined;
  };
  const [ask, setAsk] = createSignal<Prompt>();
  /** The prompt as shown: kept while it closes, as its parts may read it once more on the way out. */
  let lastAsk: Prompt = { title: "", label: "", value: "", type: "text", save: () => undefined };
  const shown = () => (lastAsk = ask() ?? lastAsk);
  const [askValue, setAskValue] = createSignal("");
  const [askError, setAskError] = createSignal<string>();
  function openPrompt(next: Prompt, rect = selectionRect()) {
    if (rect) placeAnchor(rect);
    setAsk(next);
    setAskValue(next.value);
    setAskError(undefined);
    hide(bubble);
    show(prompt);
    queueMicrotask(() => prompt?.querySelector<HTMLInputElement>("input")?.select());
  }
  function closePrompt(refocus = true) {
    hide(prompt);
    setAsk(undefined);
    if (refocus) view?.focus();
  }
  /** The form has novalidate: the editor checks the address itself, as /about is no URL to the browser. */
  function submitPrompt(event: SubmitEvent) {
    event.preventDefault();
    const current = ask();
    if (!current) return;
    const problem = current.save(askValue().trim());
    if (problem) return setAskError(problem);
    closePrompt();
  }

  /** The extent of the link around the cursor, if it is in one. */
  function linkRange() {
    if (!view) return undefined;
    const type = view.state.schema.marks.link;
    if (!type) return undefined;
    const { $from } = view.state.selection;
    const mark = type.isInSet($from.marks()) ?? ($from.nodeAfter && type.isInSet($from.nodeAfter.marks));
    if (!mark) return undefined;
    let from = $from.pos;
    let to = $from.pos;
    const parent = $from.parent;
    const start = $from.start();
    parent.forEach((child, offset) => {
      const a = start + offset;
      const b = a + child.nodeSize;
      if (mark.isInSet(child.marks) && b >= from && a <= to) {
        from = Math.min(from, a);
        to = Math.max(to, b);
      }
    });
    return { from, to, href: String(mark.attrs.href) };
  }
  function withScheme(text: string) {
    if (!text || /^[a-z][a-z0-9+.-]*:/i.test(text) || /^[/#?]/.test(text)) return text;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return `mailto:${text}`;
    if (/^[^\s/]+\.[^\s]+/.test(text)) return `https://${text}`;
    return text;
  }
  function openLink() {
    if (!view) return;
    const type = view.state.schema.marks.link;
    if (!type) return;
    const existing = linkRange();
    const { from, to } = view.state.selection;
    const range = from === to && existing ? existing : { from, to };
    openPrompt({
      title: existing ? "Edit link" : "Add link",
      label: "Address",
      type: "url",
      value: existing?.href ?? "",
      hint: "A web address, an email, or a page on this site.",
      remove: existing
        ? () => {
            view!.dispatch(view!.state.tr.removeMark(existing.from, existing.to, type));
            closePrompt();
          }
        : undefined,
      save: (text) => {
        if (!view) return undefined;
        if (!text) {
          view.dispatch(view.state.tr.removeMark(range.from, range.to, type));
          return undefined;
        }
        const href = safeHref(withScheme(text));
        if (!href) return "Use a web address (https://…), an email, or a path on this site (/about).";
        const tr = view.state.tr;
        if (range.from === range.to) {
          tr.insertText(text, range.from);
          tr.addMark(range.from, range.from + text.length, type.create({ href }));
        } else tr.removeMark(range.from, range.to, type).addMark(range.from, range.to, type.create({ href }));
        view.dispatch(tr);
        return undefined;
      },
    });
  }
  function openAlt(pos: number) {
    if (!view) return;
    const node = view.state.doc.nodeAt(pos);
    if (!node) return;
    const dom = view.nodeDOM(pos);
    const rect = dom instanceof HTMLElement ? dom.getBoundingClientRect() : selectionRect();
    openPrompt(
      {
        title: "Alt text",
        label: "Describe it",
        type: "text",
        value: node.attrs.alt ?? "",
        hint: "What's in it, for people who can't see it. Leave it empty if it's only decoration.",
        save: (text) => {
          if (!view) return undefined;
          // The text may have changed while the prompt was open: find the picture again.
          const at = view.state.doc.nodeAt(pos) === node ? pos : findNode(view.state.doc, node);
          if (at != null) view.dispatch(view.state.tr.setNodeAttribute(at, "alt", text));
          return undefined;
        },
      },
      rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.top + 1 } : undefined,
    );
  }
  function openAddress(kind: "image" | "video") {
    if (!view) return;
    const type = view.state.schema.nodes[kind];
    if (!type) return;
    openPrompt({
      title: kind === "image" ? "Add a picture" : "Add a video",
      label: kind === "image" ? "Picture's address" : "YouTube or Vimeo link, or a video's address",
      type: "url",
      value: "",
      save: (text) => {
        if (!view) return undefined;
        const found = kind === "video" ? providerOf(text) : null;
        const src = safeSrc(withScheme(text));
        if (!found && !src) return "Use a web address that starts with https://.";
        const attrs = found
          ? { provider: found.provider, videoId: found.id, mode: "player" }
          : kind === "video"
            ? { sources: [{ src }], mode: "loop" }
            : { src };
        insertBlock(type, attrs)(view.state, view.dispatch);
        return undefined;
      },
    });
  }

  // ---- Rendering ---------------------------------------------------------------------------------

  const ToolbarButtons = (p: { list: () => ActionList<EditorContext> }) => (
    <For each={p.list()}>
      {(entry, index) => {
        const list = () => ("id" in entry ? [entry as EditorAction] : (entry as { actions: EditorAction[] }).actions);
        return (
          <>
            <Show when={index() > 0}>
              <hr aria-orientation="vertical" />
            </Show>
            <For each={list()}>
              {(action) => {
                const ctx = () => (tick() >= 0 ? context() : undefined);
                const active = () => {
                  const c = ctx();
                  return c && action.active ? (action.active!(c) ? "true" : "false") : undefined;
                };
                const keys = createMemo(() => actionKeys(action));
                const disabled = () => {
                  const c = ctx();
                  return !c || action.enabled?.(c) === false || !editable();
                };
                return (
                  <Show when={!(ctx() && action.hidden?.(ctx()!))}>
                    <IconButton
                      variant="tertiary"
                      label={action.label}
                      shortcut={keys() ? keyLabel(keys()!) : undefined}
                      aria-keyshortcuts={keys() ? ariaKeys(keys()!) : undefined}
                      aria-pressed={action.actions ? undefined : active()}
                      aria-haspopup={action.actions ? "menu" : undefined}
                      disabled={disabled()}
                      tabindex={-1}
                      onClick={(event: MouseEvent) => {
                        const c = ctx();
                        if (!c) return;
                        if (action.actions) {
                          openActions(action.actions!, c, { anchor: event.currentTarget as Element, focus: "first", label: action.label, returnFocus: content });
                          return;
                        }
                        action.run?.(c);
                      }}
                    >
                      {action.icon?.()}
                    </IconButton>
                  </Show>
                );
              }}
            </For>
          </>
        );
      }}
    </For>
  );

  /** APG Toolbar: one tab stop, the arrow keys between its buttons, Escape back to the text. */
  function toolbarKeys(event: KeyboardEvent) {
    const bar = event.currentTarget as HTMLElement;
    const buttons = [...bar.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
    const i = buttons.indexOf(event.target as HTMLButtonElement);
    let next: HTMLButtonElement | undefined;
    if (event.key === "ArrowRight") next = buttons[(i + 1) % buttons.length];
    else if (event.key === "ArrowLeft") next = buttons[(i - 1 + buttons.length) % buttons.length];
    else if (event.key === "Home") next = buttons[0];
    else if (event.key === "End") next = buttons.at(-1);
    else if (event.key === "Escape") {
      event.preventDefault();
      view?.focus();
      return;
    }
    if (next) {
      event.preventDefault();
      for (const b of buttons) b.tabIndex = b === next ? 0 : -1;
      next.focus();
    }
  }
  /** The first button of the fixed toolbar is its tab stop until the arrow keys move it. */
  const firstStop = (bar: HTMLElement) => {
    const buttons = [...bar.querySelectorAll<HTMLButtonElement>("button")];
    if (!buttons.some((b) => b.tabIndex === 0)) buttons.find((b) => !b.disabled)?.setAttribute("tabindex", "0");
  };
  createEffect(tick, () => {
    if (toolbar) firstStop(toolbar);
  });

  const keepSelection = (event: MouseEvent) => {
    // A press on a toolbar button keeps the text's selection, as a menu would.
    if ((event.target as Element).closest("button")) event.preventDefault();
  };

  return (
    <beautiful-editor
      ref={(el: HTMLElement) => (frame = el)}
      class={props.class}
      data-preset={inline ? "inline" : preset === "post" || props.extensions ? (preset === "post" ? "post" : "text") : preset}
      data-appearance={appearance() === "plain" ? "plain" : undefined}
      aria-invalid={field["aria-invalid"] === "true" ? "true" : undefined}
      aria-disabled={field.disabled ? "true" : undefined}
      onFocusIn={onFocusIn}
      onFocusOut={onFocusOut}
    >
      <Show when={toolbarOn()}>
        <beautiful-editor-toolbar
          ref={(el: HTMLElement) => (toolbar = el)}
          role="toolbar"
          aria-label="Format"
          aria-controls={id()}
          onKeyDown={toolbarKeys}
          onMouseDown={keepSelection}
        >
          <ToolbarButtons list={toolbarActions} />
        </beautiful-editor-toolbar>
      </Show>
      <beautiful-editor-content
        ref={(el: HTMLElement) => {
          content = el;
          contextMenu(() => contextActions(), contextOf, { keys: false, label: () => "Edit", returnFocus: () => content })(el);
          // A shortcut scope too, so its keys shadow the app's (⌘K adds a link here) and a palette
          // lists them. ProseMirror's handleKeyDown runs them first; this scope finds them handled.
          // Read-only, ProseMirror skips its handleKeyDown, and so does this: no context.
          addShortcuts(el, () => asList(actions()), () => (editable() ? context() : undefined), { label: "Editor" });
        }}
        id={id()}
        role="textbox"
        aria-multiline={inline ? undefined : "true"}
        aria-label={labelledBy() || props["aria-labelledby"] ? undefined : props["aria-label"]}
        aria-labelledby={labelledBy() ?? props["aria-labelledby"]}
        aria-describedby={field["aria-describedby"]}
        aria-invalid={field["aria-invalid"] === "true" ? "true" : undefined}
        aria-readonly={props.readOnly ? "true" : undefined}
        aria-disabled={field.disabled ? "true" : undefined}
        aria-controls={slashState() ? slashId() : undefined}
        aria-activedescendant={slashState() && slashItems().length ? optionId(lit()) : undefined}
        onPointerDown={() => setPointerDown(true)}
        onPointerUp={() => setPointerDown(false)}
      />
      <beautiful-editor-anchor ref={(el: HTMLElement) => (anchor = el)} aria-hidden="true" />
      <Show when={bubbleOn()}>
        <beautiful-editor-bubble
          ref={(el: HTMLElement) => (bubble = el)}
          popover="manual"
          role="toolbar"
          aria-label="Format"
          aria-controls={id()}
          data-anchor="top"
          onKeyDown={toolbarKeys}
          onMouseDown={keepSelection}
        >
          <ToolbarButtons list={bubbleActions} />
        </beautiful-editor-bubble>
      </Show>
      <Show when={slashOn()}>
        <beautiful-popover ref={(el: HTMLElement) => (slash = el)} popover="manual" data-slash="">
          <beautiful-listbox role="listbox" id={slashId()} aria-label="Blocks" tabindex={-1} onMouseDown={(e: MouseEvent) => e.preventDefault()}>
            <For each={slashItems()}>
              {(action, index) => (
                <beautiful-listbox-option
                  role="option"
                  id={optionId(index())}
                  aria-selected="false"
                  data-active={index() === lit() ? "" : undefined}
                  onPointerMove={() => setLit(index())}
                  onClick={() => pickSlash(index())}
                >
                  {action.icon?.()}
                  {action.label}
                  <Show when={action.description}>
                    <small>{action.description}</small>
                  </Show>
                </beautiful-listbox-option>
              )}
            </For>
          </beautiful-listbox>
        </beautiful-popover>
      </Show>
      <beautiful-popover
        ref={(el: HTMLElement) => (prompt = el)}
        popover="auto"
        data-anchor="bottom start"
        onToggle={(event: ToggleEvent) => event.newState === "closed" && ask() && setAsk(undefined)}
      >
        <Show when={ask()}>
          {(_) => (
            <form onSubmit={submitPrompt} aria-label={shown().title} novalidate>
              <Field>
                <Label>{shown().label}</Label>
                <Input
                  type={shown().type}
                  value={askValue()}
                  onInput={(e: InputEvent) => {
                    setAskValue((e.currentTarget as HTMLInputElement).value);
                    setAskError(undefined);
                  }}
                  aria-invalid={askError() ? "true" : undefined}
                  autocomplete="off"
                />
                <Show when={askError() ?? shown().hint}>
                  <p data-error={askError() ? "" : undefined}>{askError() ?? shown().hint}</p>
                </Show>
              </Field>
              <beautiful-editor-prompt-actions>
                <Show when={shown().remove}>
                  <Button variant="tertiary" color="danger" onClick={() => shown().remove?.()}>
                    Remove
                  </Button>
                </Show>
                <Button variant="secondary" onClick={() => closePrompt()}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </beautiful-editor-prompt-actions>
            </form>
          )}
        </Show>
      </beautiful-popover>
      <input
        ref={(el: HTMLInputElement) => (fileInput = el)}
        type="file"
        multiple
        hidden
        tabindex={-1}
        aria-hidden="true"
        onChange={(event: Event) => {
          const input = event.currentTarget as HTMLInputElement;
          const files = [...(input.files ?? [])];
          input.value = "";
          if (view && files.length) {
            // Replace… on a selected picture: the new file takes its place.
            const sel = view.state.selection;
            if (sel instanceof NodeSelection && sel.node.type.name === "image") view.dispatch(view.state.tr.deleteSelection());
            void addFiles(view, files, props.upload);
          }
        }}
      />
    </beautiful-editor>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-editor": HTMLAttributes<HTMLElement>;
      "beautiful-editor-toolbar": HTMLAttributes<HTMLElement>;
      "beautiful-editor-content": HTMLAttributes<HTMLElement>;
      "beautiful-editor-anchor": HTMLAttributes<HTMLElement>;
      "beautiful-editor-bubble": HTMLAttributes<HTMLElement> & { popover?: string };
      "beautiful-editor-prompt-actions": HTMLAttributes<HTMLElement>;
      "beautiful-editor-embed": HTMLAttributes<HTMLElement>;
    }
  }
}

export type { JSX };
