import { Example, PropsTable } from "../spec.tsx";

export default function CommandPalettePage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Command palette</h1>
      <p class="lede">
        Press <kbd>⌘K</kbd> to find any action you can take from where you are, by typing a few letters of it.
      </p>
      <Example title="Command palette" hero name="command-palette/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          <strong>Every action reachable from where focus was.</strong> The palette reads{" "}
          <a href="/shortcuts">Shortcuts</a>' <code>reachableShortcuts()</code> from the element that had focus when{" "}
          <kbd>⌘K</kbd> was pressed: the actions of every scope around it, with keys or without. In the inbox above,{" "}
          <kbd>⌘K</kbd> on a message lists Archive and Star for that message, then the inbox's, then this site's.
        </li>
        <li>
          <strong>Sections, then best first.</strong> Empty, it lists the actions in a section per scope, nearest
          first, as the <a href="/shortcut-sheet">Shortcut sheet</a> does. Typed into, it lists the ones that fit, best
          first, by name and keywords, each with its scope after it: the same search as the Editor's slash menu.
        </li>
        <li>
          <strong>Runs where you were.</strong> <kbd>↵</kbd> or a click closes the palette, focus goes back where it
          was, and then the action runs for what was focused: Archive archives the message you were on. A link action
          goes to its address.
        </li>
        <li>
          <strong>Keys taught in place.</strong> Each action shows its keys at its end, unless a scope further in took
          them, so a person learns them as they use it. An action that can't run now, such as Archive on a message
          that's archived, is faded and skipped.
        </li>
        <li>
          <strong>⌘K is the palette, / is search.</strong> An app binds <kbd>⌘K</kbd> (<kbd>Ctrl+K</kbd> elsewhere) on
          its root to the palette, and <kbd>/</kbd> to its search box. A scope further in that binds{" "}
          <kbd>⌘K</kbd> wins there, as the Editor's link does.
        </li>
      </ul>

      <h2>API</h2>
      <h3>CommandPalette</h3>
      <p>Render one per app, beside its layout. Give it where focus was to open it, and clear that when it closes.</p>
      <PropsTable
        rows={[
          { name: "from", type: "Element", default: "closed", description: "Where focus was when the palette was asked for. Set, it's open and lists what's reachable from there." },
          { name: "onClose", type: "() => void", description: "Called when it closes, however it closed. Set from back to undefined." },
          { name: "placeholder", type: "string", default: '"Search actions"', description: "The search box's name and placeholder." },
          { name: "id", type: "string", default: "a unique id", description: "The dialog's id, and the start of its options' ids." },
        ]}
      />
      <h3>commandPaletteAction(open)</h3>
      <p>
        The action that opens it, for an app's root scope: <code>keys: "Mod+K"</code>, labeled Command palette. It hands{" "}
        <code>open</code> the element with focus. A button that opens the palette passes itself. An action's{" "}
        <code>keywords</code> are what else the search finds it by.
      </p>
      <pre tabindex="0">
        <code>{`const [from, setFrom] = createSignal<Element>();
addShortcuts(document.body, [commandPaletteAction((el) => setFrom(() => el)), ...appActions], undefined, { label: "App" });
<CommandPalette from={from()} onClose={() => setFrom(undefined)} />`}</code>
      </pre>

      <h2>Keyboard and screen readers</h2>
      <ul>
        <li>
          The search box is a combobox whose list is always open (APG Combobox with list autocomplete). Focus stays in
          the box: <kbd>↓</kbd> and <kbd>↑</kbd> move the lit action, named by <code>aria-activedescendant</code>, and
          typing goes on. <kbd>↵</kbd> runs the lit one, and <kbd>Esc</kbd> closes it.
        </li>
        <li>
          It's a modal Dialog named Command palette, so it's a wall: no key reaches the page behind it. Each section is
          a group named by its scope.
        </li>
      </ul>
    </article>
  );
}
