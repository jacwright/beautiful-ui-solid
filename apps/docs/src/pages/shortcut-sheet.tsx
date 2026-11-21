import { Example, PropsTable } from "../spec.tsx";

export default function ShortcutSheetPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Shortcut sheet</h1>
      <p class="lede">
        Press <kbd>?</kbd> to see the keys that work from where you are. The sheet lists each part of the screen's
        keys, nearest first.
      </p>
      <Example title="Shortcut sheet" hero name="shortcut-sheet/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          <strong>It lists what works from where focus was.</strong> The sheet reads{" "}
          <a href="/shortcuts">Shortcuts</a>' <code>reachableShortcuts()</code> from the element that had focus when{" "}
          <kbd>?</kbd> was pressed. In the inbox above, <kbd>?</kbd> on a message lists the message's{" "}
          <kbd>E</kbd> and <kbd>S</kbd> as well as the inbox's keys; from the button, only the inbox's.
        </li>
        <li>
          <strong>One section per scope, nearest first.</strong> Each scope's label is a heading: Message, then Inbox,
          then this site's Docs. A scope with no label lists its keys with no heading.
        </li>
        <li>
          <strong>Only keys that work.</strong> A key a scope further in took, as the inbox's <kbd>?</kbd> takes the
          site's, is left out of the scopes further out, and so is one the text box with focus keeps, and an action
          that can't run there now, as Archive on a message that's archived. Every key on the sheet does what it says
          from there.
        </li>
        <li>
          <strong>It's a Dialog.</strong> It opens modal, so it's a wall: no key reaches the page behind it.{" "}
          <kbd>Esc</kbd>, Close or a click outside closes it, and focus goes back where it was.
        </li>
        <li>
          <strong>Anywhere on this site.</strong> The docs site binds <kbd>?</kbd> on its root: press it on any page,
          outside a text box or a list, tree or combobox that picks items by the letter typed.
        </li>
      </ul>

      <h2>Your own keys</h2>
      <p>
        WCAG 2.1.4 asks that a person can turn off shortcuts that are a single character, or change them: a speech user
        who says a word types its letters, and each one would run something. The sheet does both, for every key, and the
        choice holds everywhere: menus, tooltips, the palette, this sheet and the keys themselves all read it.
      </p>
      <ul>
        <li>
          <strong>Single-key shortcuts.</strong> A switch at the top of the sheet, on by default. Off, keys with no{" "}
          <kbd>⌘</kbd>, <kbd>Ctrl</kbd> or <kbd>Alt</kbd>, such as <kbd>?</kbd>, <kbd>T</kbd> or a message's{" "}
          <kbd>E</kbd>, stop running and leave the sheet. <kbd>?</kbd> is one, so the sheet opens from the{" "}
          <a href="/command-palette">Command palette</a> (<kbd>⌘K</kbd>) then, or from a button.
        </li>
        <li>
          <strong>Change keys.</strong> The button in the footer turns each row's keys into a button. Press it, then the new
          keys: the sheet says what it set. <kbd>Esc</kbd> cancels, and leaving the button does too. Beside it, Remove takes an
          action's keys off, or, once they're changed, Reset puts its own back, and Reset all puts every key back and turns single-key shortcuts on.
          A row shows every action with keys from here, including one whose keys were removed.
        </li>
        <li>
          <strong>Refused keys.</strong> Keys another action reached from here already has, keys the browser keeps
          (<kbd>⌘W</kbd>, <kbd>⌘T</kbd> and the rest of Shortcuts' reserved keys), and <kbd>Enter</kbd>,{" "}
          <kbd>Space</kbd> and <kbd>Tab</kbd>, which work the controls, are refused with the reason, and the sheet waits
          for other keys. So is a single character while single-key shortcuts are off.
        </li>
        <li>
          <strong>Kept per person.</strong> In the browser's storage, under <code>beautiful:shortcuts</code>, for every
          app on the site, so the choice lasts through a reload and follows to other tabs. A key is set by the
          action's id, so the same action keeps it in every place it's offered.
        </li>
      </ul>
      <p>
        Try it above: press <kbd>?</kbd> on a message, choose Change keys, then Archive's <kbd>E</kbd>, and press{" "}
        <kbd>Alt+E</kbd>.
      </p>

      <h2>API</h2>
      <h3>ShortcutSheet</h3>
      <p>
        Render one per app, beside its layout. Give it where focus was to open it, and clear that when it closes.
      </p>
      <PropsTable
        rows={[
          { name: "from", type: "Element", default: "closed", description: "Where focus was when the sheet was asked for. Set, the sheet is open and lists what works from there." },
          { name: "onClose", type: "() => void", description: "Called when it closes, however it closed. Set from back to undefined." },
          { name: "title", type: "string", default: '"Keyboard shortcuts"', description: "The dialog's title." },
          { name: "id", type: "string", default: "a unique id", description: "The dialog's id." },
        ]}
      />
      <h3>shortcutSheetAction(open)</h3>
      <p>
        The action that opens it, for an app's root scope: <code>keys: "?"</code>, labeled Keyboard shortcuts. It hands{" "}
        <code>open</code> the element with focus. A button that opens the sheet passes itself.
      </p>
      <pre tabindex="0">
        <code>{`const [from, setFrom] = createSignal<Element>();
addShortcuts(document.body, [shortcutSheetAction((el) => setFrom(() => el))], undefined, { label: "App" });
<ShortcutSheet from={from()} onClose={() => setFrom(undefined)} />`}</code>
      </pre>

      <h2>Keyboard and screen readers</h2>
      <ul>
        <li>
          <kbd>?</kbd> opens it from anywhere but a text box, which keeps <kbd>?</kbd> for typing, and a list, tree or
          combobox, which keeps it for typeahead. Its keys are a{" "}
          <code>dl</code> per section: each action's name, then its keys as a person reads them (<kbd>⌘K</kbd> on a
          Mac, <kbd>Ctrl+K</kbd> elsewhere).
        </li>
        <li>
          Opening it focuses the dialog, as Dialog does, so a screen reader reads its title. A button that opens it says
          so with <code>aria-keyshortcuts="?"</code>.
        </li>
        <li>
          While keys are being changed, each row's keys are a button named for its action and its keys ("Archive: E"),
          and a status line under the switch says what to press and what was set. The button takes the next press,
          whatever it is, but <kbd>Tab</kbd>, which still moves on.
        </li>
      </ul>
    </article>
  );
}
