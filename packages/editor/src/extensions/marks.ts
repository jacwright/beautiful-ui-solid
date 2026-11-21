import { toggleMark } from "prosemirror-commands";
import type { MarkSpec } from "prosemirror-model";
import { markActive, markRule, safeHref } from "../commands.ts";
import { icons } from "../icons.tsx";
import type { EditorAction, EditorContext, Extension, ExtensionContext } from "../types.ts";
import { run } from "./base.ts";

/**
 * The marks: bold, italic, strikethrough, code, highlight and link. Each is its own extension,
 * with its mark, its action in the selection toolbar, the fixed toolbar and the right-click menu,
 * its key, and the Markdown you can type for it.
 */

type MarkOptions = {
  name: string;
  mark: string;
  spec: MarkSpec;
  action: Omit<EditorAction, "run" | "active" | "enabled">;
  rules?: RegExp[];
};

function markExtension({ name, mark, spec, action, rules = [] }: MarkOptions): Extension {
  return {
    name,
    marks: { [mark]: spec },
    actions: ({ schema }: ExtensionContext) => {
      const type = schema.marks[mark];
      if (!type) return [];
      const toggle = toggleMark(type);
      return [
        {
          section: "marks",
          actions: [
            {
              in: ["bubble", "toolbar"],
              ...action,
              active: ({ state }: EditorContext) => markActive(state, type),
              enabled: ({ state }: EditorContext) => toggle(state),
              run: run(toggle),
            },
          ],
        },
      ];
    },
    inputRules: ({ schema }) => {
      const type = schema.marks[mark];
      return type ? rules.map((rule) => markRule(rule, type)) : [];
    },
  };
}

export const bold = markExtension({
  name: "bold",
  mark: "strong",
  spec: {
    parseDOM: [
      { tag: "strong" },
      // Google Docs wraps everything in <b style="font-weight: normal">.
      { tag: "b", getAttrs: (node) => (node as HTMLElement).style.fontWeight !== "normal" && null },
      { style: "font-weight=400", clearMark: (m) => m.type.name === "strong" },
      { style: "font-weight", getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null },
    ],
    toDOM: () => ["strong", 0],
  },
  action: { id: "bold", label: "Bold", icon: icons.bold, keys: "Mod+B" },
  rules: [/(?:^|[^*])(\*\*([^*]+)\*\*)$/],
});

export const italic = markExtension({
  name: "italic",
  mark: "em",
  spec: {
    parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }, { style: "font-style=normal", clearMark: (m) => m.type.name === "em" }],
    toDOM: () => ["em", 0],
  },
  action: { id: "italic", label: "Italic", icon: icons.italic, keys: "Mod+I" },
  rules: [/(?:^|[^_\w])(_([^_]+)_)$/, /(?:^|[^*])(\*([^*]+)\*)$/],
});

export const strike = markExtension({
  name: "strike",
  mark: "strike",
  spec: {
    parseDOM: [{ tag: "s" }, { tag: "del" }, { tag: "strike" }, { style: "text-decoration=line-through" }],
    toDOM: () => ["s", 0],
  },
  action: { id: "strike", label: "Strikethrough", icon: icons.strike, keys: "Shift+Mod+X" },
  rules: [/(?:^|[^~])(~~([^~]+)~~)$/],
});

export const code = markExtension({
  name: "code",
  mark: "code",
  spec: {
    // Code is code: no bold or link inside it.
    excludes: "_",
    code: true,
    parseDOM: [{ tag: "code" }],
    toDOM: () => ["code", 0],
  },
  action: { id: "code", label: "Code", icon: icons.code, keys: "Mod+E" },
  rules: [/(?:^|[^`])(`([^`]+)`)$/],
});

export const highlight = markExtension({
  name: "highlight",
  mark: "highlight",
  spec: {
    outer: true,
    parseDOM: [{ tag: "mark" }],
    toDOM: () => ["mark", 0],
  },
  action: { id: "highlight", label: "Highlight", icon: icons.highlight, keys: "Shift+Mod+H" },
  rules: [/(?:^|[^=])(==([^=]+)==)$/],
});

/**
 * Links. The link editor (⌘K or the toolbar's button) sets and removes them. A link keeps only
 * an address people can follow (safeHref): http, https, mailto, tel, or a path on the site.
 */
export const link: Extension = {
  name: "link",
  marks: {
    link: {
      attrs: { href: {}, title: { default: null } },
      inclusive: false,
      outer: true,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs: (node) => {
            const href = safeHref((node as HTMLElement).getAttribute("href"));
            return href ? { href, title: (node as HTMLElement).getAttribute("title") } : false;
          },
        },
      ],
      toDOM: (mark) => ["a", { href: safeHref(mark.attrs.href) ?? "", title: mark.attrs.title ?? undefined }, 0],
    },
  },
  actions: ({ schema }) => {
    const type = schema.marks.link;
    if (!type) return [];
    return [
      {
        section: "marks",
        actions: [
          {
            id: "link",
            label: "Link",
            icon: icons.link,
            keys: "Mod+K",
            in: ["bubble", "toolbar"],
            active: ({ state }) => markActive(state, type),
            enabled: ({ state }) => !state.selection.empty || markActive(state, type),
            run: ({ editor }) => editor.editLink(),
          },
        ],
      },
    ];
  },
};
