import { reservedKeys, keyLabel } from "beautiful-ui-solid";
import { For } from "solid-js";
import { Example, PropsTable } from "../spec.tsx";

export default function ShortcutsPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Shortcuts</h1>
      <p class="lede">
        One keyboard shortcut system for the whole app. Each part of a screen hands over the actions it offers, and the
        keys go to the part that has focus.
      </p>
      <Example title="Shortcuts" hero name="shortcuts/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          <strong>A scope is an action list.</strong> Any element becomes a scope with{" "}
          <code>ref={"{shortcuts(actions)}"}</code>: the app's root, a list of messages, a Tree, the editor, a dialog.
          It's the same list a <a href="/context-menu">Context menu</a> shows, so a key, its menu item and its tooltip
          can't disagree. A context menu region and the <a href="/editor">Editor</a> are scopes already.
        </li>
        <li>
          <strong>The innermost scope wins.</strong> On a key press the kit walks from what has focus outward, and the
          first scope with an action for those keys runs it. In the editor, <kbd>⌘K</kbd> adds a link; anywhere else on
          this site it opens the command palette. A scope can ask what's focused, as a context menu does, so the message list's{" "}
          <kbd>E</kbd> archives the message that has focus.
        </li>
        <li>
          <strong>An open dialog or menu is a wall.</strong> While a modal dialog or a menu is open, no scope outside it
          runs: the page's <kbd>N</kbd> doesn't start a new site behind the settings. Give the dialog a scope of its own
          for the keys that work in it.
        </li>
        <li>
          <strong>Text boxes keep their keys.</strong> In a text box, what's typed stays typing: a letter, <kbd>?</kbd>,{" "}
          <kbd>Delete</kbd>, the arrows, and its editing keys (<kbd>⌘Z</kbd>, <kbd>⌘C</kbd>, <kbd>⌘V</kbd>,{" "}
          <kbd>⌘A</kbd>). Keys with <kbd>⌘</kbd>, <kbd>Ctrl</kbd> or <kbd>⌥</kbd> still reach the scopes around it, so{" "}
          <kbd>⌘S</kbd> saves from a form. A list, a tree or a combobox keeps the letters it picks items by. An action
          with <code>typing: true</code> runs in a text box anyway. A scope on the text box itself, as the reply box's{" "}
          <kbd>⌘↵</kbd> or the editor's, gets every key.
        </li>
        <li>
          <strong>Keys the browser keeps are refused.</strong>{" "}
          <For each={reservedKeys}>{(keys, i) => <>{i() ? ", " : ""}<kbd>{keyLabel(keys)}</kbd></>}</For> belong to the
          browser's tabs and windows, so they never bind. In development a scope warns about them, and about two actions
          in one list with the same keys. The docs' tests fail on either warning on any page.
        </li>
        <li>
          <strong>Inner handlers first.</strong> A scope's element listens for the key presses that bubble up to it, so
          a component inside it that handles a key itself and stops its default, as a menu's arrows or the editor's own
          keys, runs first, and a scope further out finds the press handled. A held letter runs its action once.
        </li>
        <li>
          <strong>What it enables.</strong> <code>reachableShortcuts()</code> lists every action reachable from where
          focus is, innermost first, with the keys a scope further in has taken marked. The{" "}
          <a href="/shortcut-sheet">Shortcut sheet</a> (<kbd>?</kbd> on this site, outside a text box) and the{" "}
          <a href="/command-palette">Command palette</a> (<kbd>⌘K</kbd>) are built on it, and later, keys a person sets
          for themselves.
        </li>
      </ul>

      <h2>Other examples</h2>
      <p>
        In the inbox at the top, focus a message with <kbd>Tab</kbd> and press <kbd>E</kbd>, <kbd>S</kbd> or <kbd>Delete</kbd>.{" "}
        <kbd>R</kbd> goes to the reply, where those letters type, and <kbd>⌘↵</kbd> sends it.
      </p>
      <Example title="A dialog is a wall: the page's N stops at it" name="shortcuts/dialog" />

      <h2>API</h2>
      <h3>shortcuts(actions, contextOf, options)</h3>
      <p>
        A ref that makes an element a scope: <code>{"<section ref={shortcuts(actions)}>"}</code>. It adds no element.
        The scope lasts as long as the element: once it leaves the page, no key reaches it.
      </p>
      <PropsTable
        rows={[
          { name: "actions", type: "ActionList<C> | () => ActionList<C>", description: "The list, or a function that returns it on each key press." },
          {
            name: "contextOf",
            type: "(target: Element) => C | undefined",
            default: "no context",
            description: "What a key press acts on, from the element with focus: the message whose row has it. Undefined, and this scope sits the press out, so the next one out gets it.",
          },
          { name: "options.label", type: "string", default: "none", description: 'Names the scope where its keys are listed, such as a ? sheet\'s "Editor" section.' },
          {
            name: "options.inTextBoxes",
            type: "boolean",
            default: "true",
            description: "false: a text box inside the scope keeps every key, as a row's rename box keeps F2 and ⌘D from the row. Context menu regions pass it.",
          },
        ]}
      />
      <h3>Action</h3>
      <p>
        An action's <code>keys</code> are Context menu's: <code>"Mod+B"</code>, <code>"Shift+Mod+Z"</code>,{" "}
        <code>"F2"</code>, <code>"E"</code>, with <code>Mod</code> for <kbd>⌘</kbd> on Apple and <kbd>Ctrl</kbd>{" "}
        elsewhere. A sign alone, such as <code>"?"</code>, matches with or without <kbd>Shift</kbd>, since layouts type it either
        way. A person can set their own keys for an action, or turn single-key ones off, from the{" "}
        <a href="/shortcut-sheet">Shortcut sheet</a>, so a surface shows and matches <code>actionKeys(action)</code>, never{" "}
        <code>action.keys</code>. One more field:
      </p>
      <PropsTable
        rows={[
          { name: "typing", type: "boolean", default: "false", description: "Its keys run in a text box too, from a scope around the box. For a key that means nothing to text, such as Escape to close a panel, it isn't needed: Escape and the F keys always reach the scopes." },
        ]}
      />
      <h3>Helpers</h3>
      <PropsTable
        rows={[
          { name: "addShortcuts(el, actions, contextOf, options)", type: "() => void", description: "The ref's work, for an element that isn't in JSX, such as document.body for the app's own keys. Returns what undoes it." },
          {
            name: "reachableShortcuts(from)",
            type: "ReachableShortcut[]",
            description: "Every action that shows and does something, reachable from this element (focus by default), innermost scope first: { action, context, scope, shadowed, enabled }. shadowed: its keys don't run from here, since a scope further in has them or the text box keeps them. enabled: it runs for its context now. For a command palette and a ? sheet; ask before moving focus, and run an entry, or follow its href, once focus is back.",
          },
          {
            name: "shortcutSections(reached)",
            type: "ShortcutSection[]",
            description: "What's reachable, as { scope, shortcuts } sections, innermost first: a palette's or a ? sheet's headings. Scopes next to each other with the same label share one.",
          },
          {
            name: "findActions(items, query, actionOf?)",
            type: "T[]",
            description: "The items whose action fits a search, by label and keywords, best first: a label that starts with it, a word of the label, a keyword, then anywhere. The Editor's slash menu filters with it, and a palette will.",
          },
          { name: "actionKeys(action)", type: "string | undefined", description: "The keys that run the action and show beside it: the ones the person set, or its own. None when they removed them, or they're one character and single-key shortcuts are off. It reads a signal, so a menu or tooltip that shows it follows a change." },
          { name: "keysProblem(action, keys, reached)", type: "string | undefined", description: "Why a person can't give the action these keys: the browser keeps them, another action reached from here has them, or they're one character while single-key shortcuts are off. Undefined when they can." },
          { name: "shortcutSettings() / setShortcutSettings(next)", type: "ShortcutSettings", description: "The person's { singleKeys, keys }, kept in localStorage under beautiful:shortcuts and shared by every app on the origin. An app that keeps settings on the person's account can load them in with setShortcutSettings. setActionKeys(id, keys) and setSingleKeys(on) change one part." },
          { name: "shortcutProblems(actions)", type: "string[]", description: "Two actions with the same keys, and keys the browser keeps, as sentences. Empty when the list is fine. A scope warns with them in development." },
          { name: "reservedKeys", type: "string[]", description: "The keys that never bind." },
        ]}
      />

      <h2>Keyboard and screen readers</h2>
      <ul>
        <li>
          Give the element an action works on <code>aria-keyshortcuts</code> with its keys, as{" "}
          <code>ariaKeys(keys)</code> writes them, and show them where the action is offered: a menu shows them at the
          item's end, a button in its tooltip.
        </li>
        <li>
          A scope never moves focus or announces anything itself. An action that changes what's on screen says so, as the
          inbox's status line does.
        </li>
        <li>
          A single-letter key on a scope that holds focus, such as a message's <kbd>E</kbd>, meets WCAG 2.1.4, since it
          runs only there. One on the app's root runs from anywhere but a text box, so WCAG asks for a way to turn it off
          or change it: the <a href="/shortcut-sheet">Shortcut sheet</a> does both, for every key. Still keep a root's
          keys few, as this site's <kbd>T</kbd> and <kbd>M</kbd>.
        </li>
      </ul>
    </article>
  );
}
