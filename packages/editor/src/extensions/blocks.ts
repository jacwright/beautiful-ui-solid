import { lift, setBlockType, wrapIn } from "prosemirror-commands";
import { InputRule, textblockTypeInputRule, wrappingInputRule } from "prosemirror-inputrules";
import { liftListItem, sinkListItem, splitListItem, wrapInList } from "prosemirror-schema-list";
import type { Command, EditorState } from "prosemirror-state";
import { blockActive, insertBlock, textblockIs } from "../commands.ts";
import { icons } from "../icons.tsx";
import type { EditorContext, Extension } from "../types.ts";
import { run } from "./base.ts";

/**
 * The blocks: headings, lists, quotes, code and the divider. Each is its own extension. Its
 * action is in the slash menu and in the right-click menu's Turn into, and the ones with an icon
 * a toolbar shows are in the fixed toolbar too.
 */

/** Whether the cursor is in a list or a quote, which Text takes it out of. */
function wrapped(state: EditorState) {
  const { nodes } = state.schema;
  return (
    (!!nodes.list_item && blockActive(state, nodes.list_item)) || (!!nodes.blockquote && blockActive(state, nodes.blockquote))
  );
}

/** Text: the paragraph, out of any list or quote, and no longer a heading or code. */
export const text: Extension = {
  name: "text",
  actions: ({ schema }) => {
    const paragraph = schema.nodes.paragraph;
    if (!paragraph) return [];
    return [
      {
        section: "blocks",
        select: "one",
        actions: [
          {
            id: "text",
            label: "Text",
            icon: icons.text,
            keys: "Alt+Mod+0",
            keywords: ["paragraph", "plain", "body"],
            in: ["slash"],
            active: ({ state }) => textblockIs(state, paragraph) && !wrapped(state),
            run: ({ view }) => {
              const { list_item: item, blockquote } = view.state.schema.nodes;
              // Out of lists and quotes one level at a time, then back to a paragraph.
              for (let guard = 0; guard < 20 && wrapped(view.state); guard++) {
                const inItem = item && blockActive(view.state, item);
                const done = inItem ? liftListItem(item)(view.state, view.dispatch) : lift(view.state, view.dispatch);
                if (!done && blockquote) break;
              }
              setBlockType(paragraph)(view.state, view.dispatch);
              view.focus();
            },
          },
        ],
      },
    ];
  },
};

/** Headings 2 to 4: a post's title is the page's h1. "# " starts one, "## " the next, "### " the last. */
export const heading: Extension = {
  name: "heading",
  nodes: {
    heading: {
      attrs: { level: { default: 2 } },
      content: "inline*",
      group: "block",
      defining: true,
      parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({ tag: `h${level}`, attrs: { level: Math.min(Math.max(level, 2), 4) } })),
      toDOM: (node) => [`h${node.attrs.level}`, 0],
    },
  },
  actions: ({ schema }) => {
    const type = schema.nodes.heading;
    if (!type) return [];
    const level = (n: 2 | 3 | 4, keywords: string[]) => ({
      id: `heading-${n}`,
      label: `Heading ${n - 1}`,
      icon: icons.heading,
      keys: `Alt+Mod+${n - 1}`,
      keywords: ["heading", "title", `h${n - 1}`, ...keywords],
      in: ["slash" as const],
      active: ({ state }: EditorContext) => textblockIs(state, type, { level: n }),
      run: run(setBlockType(type, { level: n })),
    });
    return [{ section: "blocks", select: "one", actions: [level(2, ["section"]), level(3, ["subheading"]), level(4, [])] }];
  },
  inputRules: ({ schema }) => {
    const type = schema.nodes.heading;
    return type ? [textblockTypeInputRule(/^(#{1,3})\s$/, type, (m) => ({ level: m[1]!.length + 1 }))] : [];
  },
  keys: ({ schema }) => ({
    // Backspace at the very start of a heading makes it text again, even on the first line.
    Backspace: (state, dispatch) => {
      const { $from, empty } = state.selection;
      if (!empty || $from.parentOffset !== 0 || $from.parent.type !== schema.nodes.heading || !schema.nodes.paragraph) return false;
      return setBlockType(schema.nodes.paragraph)(state, dispatch);
    },
  }),
};

/** A quote. "> " starts one. */
export const quote: Extension = {
  name: "quote",
  nodes: {
    blockquote: {
      content: "block+",
      group: "block",
      defining: true,
      parseDOM: [{ tag: "blockquote" }],
      toDOM: () => ["blockquote", 0],
    },
  },
  actions: ({ schema }) => {
    const type = schema.nodes.blockquote;
    if (!type) return [];
    const toggle: Command = (state, dispatch) => (blockActive(state, type) ? lift(state, dispatch) : wrapIn(type)(state, dispatch));
    return [
      {
        section: "blocks",
        select: "one",
        actions: [
          {
            id: "quote",
            label: "Quote",
            icon: icons.quote,
            keys: "Shift+Mod+.",
            keywords: ["blockquote", "citation"],
            in: ["slash", "toolbar"],
            active: ({ state }) => blockActive(state, type),
            run: run(toggle),
          },
        ],
      },
    ];
  },
  inputRules: ({ schema }) => (schema.nodes.blockquote ? [wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote)] : []),
};

/** Bulleted and numbered lists. "- " or "1. " starts one; Tab and Shift+Tab indent and outdent. */
export const lists: Extension = {
  name: "lists",
  nodes: {
    bullet_list: {
      content: "list_item+",
      group: "block",
      attrs: { tight: { default: true } },
      parseDOM: [{ tag: "ul" }],
      toDOM: () => ["ul", 0],
    },
    ordered_list: {
      content: "list_item+",
      group: "block",
      attrs: { order: { default: 1 }, tight: { default: true } },
      parseDOM: [{ tag: "ol", getAttrs: (dom) => ({ order: Number((dom as HTMLElement).getAttribute("start") ?? 1) || 1 }) }],
      toDOM: (node) => (node.attrs.order === 1 ? ["ol", 0] : ["ol", { start: node.attrs.order }, 0]),
    },
    list_item: {
      content: "paragraph block*",
      defining: true,
      parseDOM: [{ tag: "li" }],
      toDOM: () => ["li", 0],
    },
  },
  actions: ({ schema }) => {
    const { bullet_list: bullets, ordered_list: numbers, list_item: item } = schema.nodes;
    if (!bullets || !numbers || !item) return [];
    /** In this kind of list already: lift out of it. In the other kind: switch. Else: wrap. */
    const toggle = (type: typeof bullets): Command => (state, dispatch, view) => {
      const { $from } = state.selection;
      for (let d = $from.depth; d > 0; d--) {
        const node = $from.node(d);
        if (node.type === type) return liftListItem(item)(state, dispatch);
        if (node.type === bullets || node.type === numbers) {
          if (dispatch) dispatch(state.tr.setNodeMarkup($from.before(d), type, { ...node.attrs }));
          return true;
        }
      }
      return wrapInList(type)(state, dispatch, view);
    };
    const inList = (type: typeof bullets) => ({ state }: EditorContext) => {
      const { $from } = state.selection;
      for (let d = $from.depth; d > 0; d--) if ($from.node(d).type === type) return true;
      return false;
    };
    return [
      {
        section: "blocks",
        select: "one",
        actions: [
          {
            id: "bullets",
            label: "Bulleted list",
            icon: icons.bullets,
            keys: "Shift+Mod+8",
            keywords: ["unordered", "ul", "list"],
            in: ["slash", "toolbar"],
            active: inList(bullets),
            run: run(toggle(bullets)),
          },
          {
            id: "numbers",
            label: "Numbered list",
            icon: icons.numbers,
            keys: "Shift+Mod+7",
            keywords: ["ordered", "ol", "list"],
            in: ["slash", "toolbar"],
            active: inList(numbers),
            run: run(toggle(numbers)),
          },
        ],
      },
    ];
  },
  inputRules: ({ schema }) => {
    const { bullet_list: bullets, ordered_list: numbers } = schema.nodes;
    if (!bullets || !numbers) return [];
    return [
      wrappingInputRule(/^\s*([-+*])\s$/, bullets),
      wrappingInputRule(
        /^(\d+)\.\s$/,
        numbers,
        (m) => ({ order: Number(m[1]) }),
        (m, node) => node.childCount + node.attrs.order === Number(m[1]),
      ),
    ];
  },
  keys: ({ schema }): Record<string, Command> => {
    const item = schema.nodes.list_item;
    if (!item) return {};
    return {
      Enter: splitListItem(item),
      Tab: sinkListItem(item),
      "Shift-Tab": liftListItem(item),
      "Mod-]": sinkListItem(item),
      "Mod-[": liftListItem(item),
    };
  },
};

/** A block of code, kept as typed. "``` " starts one; ⌘Enter or Shift+Enter on its last line leaves it. */
export const codeBlock: Extension = {
  name: "codeBlock",
  nodes: {
    code_block: {
      attrs: { params: { default: "" } },
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
          getAttrs: (node) => ({ params: (node as HTMLElement).getAttribute("data-language") ?? "" }),
        },
      ],
      toDOM: (node) => ["pre", node.attrs.params ? { "data-language": node.attrs.params } : {}, ["code", 0]],
    },
  },
  actions: ({ schema }) => {
    const type = schema.nodes.code_block;
    if (!type) return [];
    return [
      {
        section: "blocks",
        select: "one",
        actions: [
          {
            id: "code-block",
            label: "Code block",
            icon: icons.codeBlock,
            keys: "Alt+Mod+C",
            keywords: ["pre", "snippet", "program"],
            in: ["slash"],
            active: ({ state }) => textblockIs(state, type),
            run: run(setBlockType(type)),
          },
        ],
      },
    ];
  },
  inputRules: ({ schema }) =>
    schema.nodes.code_block ? [textblockTypeInputRule(/^```([a-z0-9-]*)\s$/, schema.nodes.code_block, (m) => ({ params: m[1] ?? "" }))] : [],
};

/** A divider between sections. "---" on a line of its own makes one. */
export const divider: Extension = {
  name: "divider",
  nodes: {
    horizontal_rule: {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM: () => ["hr"],
    },
  },
  actions: ({ schema }) => {
    const type = schema.nodes.horizontal_rule;
    if (!type) return [];
    return [
      {
        section: "insert",
        actions: [
          {
            id: "divider",
            label: "Divider",
            icon: icons.divider,
            keywords: ["hr", "rule", "line", "separator"],
            in: ["slash"],
            run: run(insertBlock(type)),
          },
        ],
      },
    ];
  },
  inputRules: ({ schema }) => {
    const rule = schema.nodes.horizontal_rule;
    const paragraph = schema.nodes.paragraph;
    if (!rule || !paragraph) return [];
    return [
      new InputRule(/^(?:---|\*\*\*|___)$/, (state, _m, start) => {
        const $start = state.doc.resolve(start);
        if ($start.parent.type !== paragraph || $start.depth !== 1) return null;
        return state.tr.replaceRangeWith($start.before(), $start.after(), rule.create()).scrollIntoView();
      }),
    ];
  },
};
