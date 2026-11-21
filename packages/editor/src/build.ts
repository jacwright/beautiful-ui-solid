import { chainCommands } from "prosemirror-commands";
import { inputRules } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { Schema, type MarkSpec, type NodeSpec, type Slice } from "prosemirror-model";
import { Plugin, type Command } from "prosemirror-state";
import { Decoration, DecorationSet, type NodeViewConstructor } from "prosemirror-view";
import { dropCursor, gapCursor } from "./cursors.ts";
import type { EditorActions, EditorGroup, EmbedDefinition, Extension, ExtensionContext, Upload } from "./types.ts";

/**
 * Builds an editor from its extensions: one schema, one action list, one keymap and one plugin
 * list. The order is fixed, so extensions never fight: nodes and marks in the order given; keys
 * from the last extension first, so a list's Enter runs before a paragraph's; the actions merged by
 * section, in the order the right-click menu shows them.
 */

export type Built = {
  schema: Schema;
  context: ExtensionContext;
  actions: EditorActions;
  plugins: Plugin[];
  nodeViews: Record<string, NodeViewConstructor>;
  paste: (slice: Slice) => Slice;
};

const sectionOrder = ["history", "clipboard", "node", "marks", "blocks", "insert"];

/** The schema the extensions make together. */
export function buildSchema(extensions: Extension[]): Schema {
  const nodes: Record<string, NodeSpec> = {};
  const marks: Record<string, MarkSpec> = {};
  for (const extension of extensions) {
    Object.assign(nodes, extension.nodes);
    Object.assign(marks, extension.marks);
  }
  if (!nodes.doc) throw new Error("The editor needs a doc node: start the extensions with paragraphs or singleLine.");
  if (!nodes.text) nodes.text = { group: "inline" };
  // doc first: ProseMirror takes the top node and the default block from the order.
  const { doc, ...rest } = nodes;
  // Marks that span others come first, so one link or highlight holds its bold words, not one
  // each side of them: ProseMirror nests marks in the schema's order.
  const ordered = Object.entries(marks).sort(([, a], [, b]) => Number(!!b.outer) - Number(!!a.outer));
  return new Schema({ nodes: { doc, ...rest }, marks: Object.fromEntries(ordered) });
}

/** Merges groups of one section into one group, keeping the sections' order. */
export function mergeActions(groups: EditorGroup[]): EditorActions {
  const bySection = new Map<string, EditorGroup>();
  for (const group of groups) {
    const existing = bySection.get(group.section);
    if (existing) existing.actions.push(...group.actions);
    else bySection.set(group.section, { ...group, actions: [...group.actions] });
  }
  const rank = (section: string) => {
    const i = sectionOrder.indexOf(section);
    return i < 0 ? sectionOrder.length : i;
  };
  return [...bySection.values()].filter((g) => g.actions.length).sort((a, b) => rank(a.section) - rank(b.section));
}

export function build(
  extensions: Extension[],
  options: { schema?: Schema; upload?: Upload; embeds?: Record<string, EmbedDefinition>; placeholder?: () => Placeholder } = {},
): Built {
  const schema = options.schema ?? buildSchema(extensions);
  const context: ExtensionContext = { schema, upload: options.upload, embeds: options.embeds ?? {} };
  const actions = mergeActions(extensions.flatMap((e) => e.actions?.(context) ?? []));

  // Keys: every extension's commands for a key, tried from the last extension to the first.
  const keys = new Map<string, Command[]>();
  for (const extension of [...extensions].reverse()) {
    for (const [key, command] of Object.entries(extension.keys?.(context) ?? {})) {
      keys.set(key, [...(keys.get(key) ?? []), command]);
    }
  }
  const bindings = Object.fromEntries([...keys].map(([key, commands]) => [key, commands.length === 1 ? commands[0]! : chainCommands(...commands)]));

  const rules = extensions.flatMap((e) => e.inputRules?.(context) ?? []);
  const own = [...new Set(extensions.flatMap((e) => e.plugins?.(context) ?? []))];
  const plugins = [
    ...(rules.length ? [inputRules({ rules })] : []),
    ...own,
    keymap(bindings),
    dropCursor(),
    gapCursor(),
    ...(options.placeholder ? [placeholder(options.placeholder)] : []),
  ];

  const nodeViews = Object.assign({}, ...extensions.map((e) => e.nodeViews?.(context) ?? {})) as Record<string, NodeViewConstructor>;
  const pasters = extensions.flatMap((e) => (e.paste ? [e.paste] : []));
  const paste = (slice: Slice) => pasters.reduce((s, clean) => clean(s, context), slice);
  return { schema, context, actions, plugins, nodeViews, paste };
}

export type Placeholder = { empty?: string; line?: string; focused: boolean };

/**
 * The hint on an empty line, drawn by CSS from data-placeholder, so it is never text in the value.
 * `empty` is on the first line of an empty editor; `line` on the empty line the cursor is on.
 */
function placeholder(get: () => Placeholder) {
  return new Plugin({
    props: {
      // One line has no block to mark: the text itself carries it.
      attributes(state): Record<string, string> {
        const { empty } = get();
        return state.doc.inlineContent && empty && !state.doc.content.size ? { "data-placeholder": empty } : {};
      },
      decorations(state) {
        const { empty, line, focused } = get();
        const doc = state.doc;
        const decorate = (pos: number, size: number, text: string) =>
          DecorationSet.create(doc, [Decoration.node(pos, pos + size, { "data-placeholder": text })]);
        if (doc.inlineContent) return null;
        const first = doc.firstChild;
        if (empty && doc.childCount === 1 && first?.isTextblock && !first.content.size) return decorate(0, first.nodeSize, empty);
        if (!line || !focused) return null;
        const { $from, empty: collapsed } = state.selection;
        const parent = $from.parent;
        if (!collapsed || !parent.isTextblock || parent.content.size || parent.type.spec.code || $from.depth !== 1) return null;
        return decorate($from.before(), parent.nodeSize, line);
      },
    },
  });
}
