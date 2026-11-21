import { gapCursor as gapCursorPlugin, GapCursor } from "prosemirror-gapcursor";
import { Plugin } from "prosemirror-state";
import { dropPoint } from "prosemirror-transform";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

/**
 * The two cursors ProseMirror draws that aren't the browser's caret, as kit elements, not the
 * <div>s ProseMirror's own plugins add: the gap cursor, a line where text can go between two
 * blocks that have none between them (two pictures), and the drop cursor, where a dragged block
 * or file will land.
 */

/** The gap cursor: ProseMirror's own selection and keys, drawn as <beautiful-editor-gap>. */
export function gapCursor() {
  const own = gapCursorPlugin();
  return new Plugin({
    props: {
      ...own.props,
      decorations(state) {
        if (!(state.selection instanceof GapCursor)) return null;
        const gap = document.createElement("beautiful-editor-gap");
        return DecorationSet.create(state.doc, [Decoration.widget(state.selection.head, gap, { key: "gap" })]);
      },
    },
  });
}

/** The drop cursor: a line in the accent where a dragged block or file will land. */
export function dropCursor() {
  return new Plugin({
    view(view) {
      return new DropCursor(view);
    },
  });
}

class DropCursor {
  private line: HTMLElement | null = null;
  private at: number | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly off: (() => void)[];

  constructor(private readonly view: EditorView) {
    const on = <K extends keyof HTMLElementEventMap>(name: K, handler: (event: HTMLElementEventMap[K]) => void) => {
      view.dom.addEventListener(name, handler);
      return () => view.dom.removeEventListener(name, handler);
    };
    this.off = [
      on("dragover", (event) => this.over(event)),
      on("dragend", () => this.clearSoon()),
      on("drop", () => this.clearSoon()),
      on("dragleave", (event) => {
        if (!view.dom.contains(event.relatedTarget as Node | null)) this.set(null);
      }),
    ];
  }

  update() {
    if (this.at != null && this.at > this.view.state.doc.content.size) this.set(null);
    else if (this.at != null) this.draw();
  }

  destroy() {
    for (const off of this.off) off();
    this.line?.remove();
  }

  private over(event: DragEvent) {
    if (!this.view.editable) return;
    const found = this.view.posAtCoords({ left: event.clientX, top: event.clientY });
    if (!found) return;
    const node = found.inside >= 0 ? this.view.state.doc.nodeAt(found.inside) : null;
    const disabled = node?.type.spec.disableDropCursor;
    if (disabled === true) return;
    let at = found.pos;
    const slice = this.view.dragging?.slice;
    if (slice) {
      const point = dropPoint(this.view.state.doc, at, slice);
      if (point != null) at = point;
    }
    clearTimeout(this.timer);
    this.set(at);
  }

  private clearSoon() {
    this.timer = setTimeout(() => this.set(null), 20);
  }

  private set(at: number | null) {
    if (at === this.at) return;
    this.at = at;
    if (at == null) {
      this.line?.remove();
      this.line = null;
    } else this.draw();
  }

  private draw() {
    if (this.at == null) return;
    const { view } = this;
    const $pos = view.state.doc.resolve(this.at);
    const block = !$pos.parent.inlineContent;
    const frame = view.dom.getBoundingClientRect();
    let rect: { left: number; right: number; top: number; bottom: number };
    if (block) {
      const before = $pos.nodeBefore;
      const after = $pos.nodeAfter;
      if (before || after) {
        const dom = view.nodeDOM(this.at - (before ? before.nodeSize : 0));
        if (dom instanceof HTMLElement) {
          const box = dom.getBoundingClientRect();
          const top = before ? box.bottom : box.top;
          rect = { left: box.left, right: box.right, top: top - 1, bottom: top + 1 };
        } else rect = view.coordsAtPos(this.at);
      } else rect = view.coordsAtPos(this.at);
    } else {
      const coords = view.coordsAtPos(this.at);
      rect = { left: coords.left - 1, right: coords.left + 1, top: coords.top, bottom: coords.bottom };
    }
    if (!this.line) {
      this.line = view.dom.ownerDocument.createElement("beautiful-editor-drop");
      this.line.setAttribute("aria-hidden", "true");
      view.dom.parentElement?.append(this.line);
    }
    // Placed against the editor's frame, which is positioned.
    const parent = (view.dom.parentElement ?? view.dom).getBoundingClientRect();
    void frame;
    Object.assign(this.line.style, {
      left: `${rect.left - parent.left}px`,
      top: `${rect.top - parent.top}px`,
      width: `${Math.max(rect.right - rect.left, 2)}px`,
      height: `${Math.max(rect.bottom - rect.top, 2)}px`,
    });
  }
}
