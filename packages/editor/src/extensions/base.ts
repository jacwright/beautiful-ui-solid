import { baseKeymap, chainCommands, createParagraphNear, exitCode, liftEmptyBlock, newlineInCode, splitBlock } from "prosemirror-commands";
import { history as historyPlugin, redo, redoDepth, undo, undoDepth } from "prosemirror-history";
import { undoInputRule } from "prosemirror-inputrules";
import type { Command } from "prosemirror-state";
import { icons } from "../icons.tsx";
import type { EditorContext, Extension } from "../types.ts";

/** Runs a ProseMirror command on the action's context. */
export const run = (command: Command) => ({ state, view }: EditorContext) => {
  command(state, view.dispatch, view);
  view.focus();
};

/** Whether a command can run now. */
export const can = (command: Command) => ({ state }: EditorContext) => command(state);

/**
 * Text in paragraphs, the base of the text and post presets. Enter starts a paragraph and
 * Shift+Enter breaks the line inside one.
 */
export const paragraphs: Extension = {
  name: "paragraphs",
  nodes: {
    doc: { content: "block+" },
    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM: () => ["p", 0],
    },
    text: { group: "inline" },
    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM: () => ["br"],
    },
  },
  keys: ({ schema }) => {
    const br = schema.nodes.hard_break;
    const lineBreak: Command = (state, dispatch) => {
      if (!br) return false;
      dispatch?.(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
      return true;
    };
    return {
      ...baseKeymap,
      Enter: chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),
      "Shift-Enter": chainCommands(exitCode, lineBreak),
      "Mod-Enter": exitCode,
      Backspace: chainCommands(undoInputRule, baseKeymap.Backspace!),
    };
  },
};

/**
 * One line: a page's headline, a button's words. The text has no blocks, and Enter does nothing,
 * so a form's Enter stays the form's.
 */
export const singleLine: Extension = {
  name: "singleLine",
  nodes: {
    doc: { content: "inline*" },
    text: { group: "inline" },
  },
  keys: () => ({
    ...baseKeymap,
    Enter: () => true,
    "Shift-Enter": () => true,
    "Mod-Enter": () => false,
    Backspace: chainCommands(undoInputRule, baseKeymap.Backspace!),
  }),
};

/** Undo and redo, with ⌘Z and ⇧⌘Z (and Ctrl+Y on Windows), in the right-click menu. */
export const history: Extension = {
  name: "history",
  plugins: () => [historyPlugin()],
  keys: () => ({ "Mod-y": redo }),
  actions: () => [
    {
      section: "history",
      actions: [
        { id: "undo", label: "Undo", icon: icons.undo, keys: "Mod+Z", enabled: ({ state }) => undoDepth(state) > 0, run: run(undo) },
        { id: "redo", label: "Redo", icon: icons.redo, keys: "Shift+Mod+Z", enabled: ({ state }) => redoDepth(state) > 0, run: run(redo) },
      ],
    },
  ],
};

/**
 * Cut, copy and paste in the right-click menu. The keys are the browser's own, so these have none
 * to bind, only to show. Paste reads the clipboard, which the browser may ask permission for; when
 * it can't, the action says to press the keys.
 */
export const clipboard: Extension = {
  name: "clipboard",
  actions: () => {
    const selected = ({ state }: EditorContext) => !state.selection.empty;
    const exec = (command: "cut" | "copy") => ({ view }: EditorContext) => {
      view.focus();
      view.dom.ownerDocument.execCommand(command);
    };
    return [
      {
        section: "clipboard",
        actions: [
          { id: "cut", label: "Cut", icon: icons.cut, enabled: (c) => selected(c) && c.view.editable, run: exec("cut") },
          { id: "copy", label: "Copy", icon: icons.copy, enabled: selected, run: exec("copy") },
          {
            id: "paste",
            label: "Paste",
            icon: icons.paste,
            enabled: ({ view }) => view.editable && typeof navigator !== "undefined" && !!navigator.clipboard,
            run: ({ view }) => void pasteFromClipboard(view),
          },
        ],
      },
    ];
  },
};

async function pasteFromClipboard(view: EditorContext["view"]) {
  view.focus();
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.includes("text/html")) {
        view.pasteHTML(await (await item.getType("text/html")).text());
        return;
      }
    }
    for (const item of items) {
      if (item.types.includes("text/plain")) {
        view.pasteText(await (await item.getType("text/plain")).text());
        return;
      }
    }
  } catch {
    // Reading the clipboard was refused, or isn't offered. Plain text may still be.
    try {
      view.pasteText(await navigator.clipboard.readText());
    } catch {
      // Nothing to read: the person can still press the keys.
    }
  }
}
