import type { Action } from "beautiful-ui-solid";
import type { JSX } from "@solidjs/web";
import type { InputRule } from "prosemirror-inputrules";
import type { MarkSpec, NodeSpec, Schema, Slice } from "prosemirror-model";
import type { Command, EditorState, Plugin, Transaction } from "prosemirror-state";
import type { EditorView, NodeViewConstructor } from "prosemirror-view";

/** What every action of the editor acts on: its state and view now, and the editor's own handle. */
export type EditorContext = { state: EditorState; view: EditorView; editor: EditorHandle };

/** Where an action shows besides the right-click menu, which shows every group but "insert". */
export type Surface = "bubble" | "toolbar" | "slash";

export type EditorAction = Action<EditorContext> & {
  /** The menus it shows in beyond the right-click menu. */
  in?: Surface[];
};

/**
 * The sections of the editor's action list, in the order a right-click menu shows them:
 * history, clipboard, node (the selected picture, video or embed), marks, blocks ("Turn into"),
 * insert (the slash menu's), and any an app adds.
 */
export type Section = "history" | "clipboard" | "node" | "marks" | "blocks" | "insert" | (string & {});

export type EditorGroup = {
  section: Section;
  heading?: string;
  select?: "one";
  actions: EditorAction[];
};

/** The editor's one action list: every menu and every key reads it. */
export type EditorActions = EditorGroup[];

/** An app's own block: a sign-up form, a pricing table, a small app. It stores only its props. */
export type EmbedDefinition<P extends Record<string, unknown> = Record<string, unknown>> = {
  /** Its name in the slash menu and in its block's header: "Sign-up form". */
  label: string;
  /** A line under the label in the slash menu. */
  description?: string;
  /** An <svg>, drawn fresh each time. */
  icon?: () => JSX.Element;
  /** More words the slash menu finds it by. */
  keywords?: string[];
  /** The props a new one starts with. */
  defaults?: P;
  /**
   * Draws it in the editor. setProps saves new props, which is how its own settings change it.
   * It is drawn again from its props wherever the text is shown, by the app.
   */
  component: (props: { props: P; setProps: (next: P) => void; selected: boolean }) => JSX.Element;
};

export type UploadResult = { src: string; width?: number; height?: number };

/** Stores a picture or video the person added, and says where it is. progress takes 0 to 1. */
export type Upload = (file: File, progress: (fraction: number) => void) => Promise<UploadResult>;

/** What an extension's parts are built from: the editor's schema, and its options. */
export type ExtensionContext = {
  schema: Schema;
  upload?: Upload;
  embeds: Record<string, EmbedDefinition>;
};

/**
 * One feature of the editor, with everything it needs, so turning it on is adding it to a list.
 * The editor merges the list into one schema, one keymap and one plugin list, in order.
 */
export interface Extension {
  name: string;
  nodes?: Record<string, NodeSpec>;
  marks?: Record<string, MarkSpec>;
  /** Its actions, by section. Every menu and the keys read them. Built once the schema is. */
  actions?: (context: ExtensionContext) => EditorGroup[];
  /** "# " starts a heading, "**words**" turns bold. */
  inputRules?: (context: ExtensionContext) => InputRule[];
  /** Keys that aren't an action's, such as Enter in a list, by ProseMirror's key names ("Mod-Enter"). */
  keys?: (context: ExtensionContext) => Record<string, Command>;
  plugins?: (context: ExtensionContext) => Plugin[];
  nodeViews?: (context: ExtensionContext) => Record<string, NodeViewConstructor>;
  /** Cleans what is pasted, after the schema has read it. */
  paste?: (slice: Slice, context: ExtensionContext) => Slice;
}

/** The handle a ref gets, for an app that needs ProseMirror itself. */
export interface EditorHandle {
  /** The view, once the editor is on the page. */
  readonly view: EditorView | undefined;
  /** The state now, tracked: a memo or effect that reads it runs again on every change. */
  state(): EditorState | undefined;
  /** The value now, in the editor's format, not waiting for a pause. */
  value(): unknown;
  /** Replaces the text with a value in the editor's format, as a new value prop does. */
  setValue(value: unknown): void;
  /** Puts in a whole new state, plugins and all, as an app that starts over from its server does. */
  setState(state: EditorState): void;
  /** Applies a transaction as it is, past the dispatch prop: a collaborator's steps, which aren't the person's. */
  apply(tr: Transaction): void;
  /** Runs an action by its id. Returns whether it ran. */
  run(id: string): boolean;
  focus(): void;
  /** Opens the link editor over the selection. */
  editLink(): void;
  /** Opens the alt text editor for the picture or video at this position. */
  editAlt(pos: number): void;
  /** Opens the file picker, and adds what is picked as pictures or videos at the cursor. */
  pickFiles(accept?: string): void;
  /** Adds these files as pictures or videos at the cursor, through the editor's upload. */
  addFiles(files: File[]): void;
}
