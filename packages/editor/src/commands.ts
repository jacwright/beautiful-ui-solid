import { InputRule } from "prosemirror-inputrules";
import type { MarkType, NodeType } from "prosemirror-model";
import { TextSelection, type Command, type EditorState } from "prosemirror-state";

/**
 * The commands and checks the extensions share. Each takes its type from the schema the editor
 * built, so an app's own schema with the same names works too.
 */

/** Whether the mark is on: across the whole selection, or where the cursor would type. */
export function markActive(state: EditorState, type: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;
  if (empty) return !!type.isInSet(state.storedMarks ?? $from.marks());
  return state.doc.rangeHasMark(from, to, type);
}

/** Whether the cursor is inside a block of this type, with these attributes. */
export function blockActive(state: EditorState, type: NodeType, attrs?: Record<string, unknown>): boolean {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type === type && (!attrs || Object.entries(attrs).every(([k, v]) => node.attrs[k] === v))) return true;
  }
  return false;
}

/** Whether the cursor's own text block is this type, with these attributes. */
export function textblockIs(state: EditorState, type: NodeType, attrs?: Record<string, unknown>): boolean {
  const { $from, $to } = state.selection;
  const parent = $from.parent;
  return (
    $from.sameParent($to) &&
    parent.type === type &&
    (!attrs || Object.entries(attrs).every(([k, v]) => parent.attrs[k] === v))
  );
}

/** `**bold**`, `_italic_`, `` `code` ``: the mark, once its closing characters are typed. */
export function markRule(pattern: RegExp, type: MarkType): InputRule {
  return new InputRule(pattern, (state, match, start, end) => {
    const inner = match[2]!;
    const full = match[0]!;
    const textStart = start + full.indexOf(match[1]!);
    const tr = state.tr;
    tr.replaceWith(textStart, end, type.schema.text(inner, [type.create()]));
    tr.removeStoredMark(type);
    return tr;
  });
}

/** Inserts a block node at the cursor, on a line of its own, and puts the cursor after it. */
export function insertBlock(type: NodeType, attrs?: Record<string, unknown>): Command {
  return (state, dispatch) => {
    const node = type.createAndFill(attrs);
    if (!node) return false;
    if (!dispatch) return true;
    const { $from } = state.selection;
    const tr = state.tr;
    let end: number;
    // An empty line is replaced by the block, as the slash menu's line is.
    if ($from.parent.isTextblock && $from.parent.content.size === 0 && $from.depth > 0) {
      const start = $from.before();
      tr.replaceWith(start, $from.after(), node);
      end = start + node.nodeSize;
    } else {
      tr.replaceSelectionWith(node);
      end = Math.min(tr.mapping.map(state.selection.to), tr.doc.content.size);
    }
    // A paragraph after it, when it's the last block, so there's somewhere to keep writing.
    const paragraph = state.schema.nodes.paragraph;
    if (paragraph && end >= tr.doc.content.size) tr.insert(tr.doc.content.size, paragraph.create());
    tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(end + 1, tr.doc.content.size)), 1));
    dispatch(tr.scrollIntoView());
    return true;
  };
}

/** A link a person can follow: the web, mail, or a path on this site. Anything else is dropped. */
export function safeHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  const value = href.trim();
  if (!value) return null;
  if (/^(?:https?:|mailto:|tel:)/i.test(value)) return value;
  // A path, a fragment or a query on this site. "//host" is another site with no scheme, and is a URL.
  if (/^(?:\/(?!\/)|#|\?)/.test(value)) return value;
  return null;
}

/** A picture or video's address: the web, a path on this site, or a file not yet uploaded (blob:). */
export function safeSrc(src: unknown): string | null {
  if (typeof src !== "string") return null;
  const value = src.trim();
  if (/^(?:https?:|blob:)/i.test(value)) return value;
  if (/^\/(?!\/)/.test(value)) return value;
  return null;
}
