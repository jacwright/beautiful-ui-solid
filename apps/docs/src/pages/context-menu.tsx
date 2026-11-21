import { Example, PropsTable } from "../spec.tsx";

export default function ContextMenuPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Context menu</h1>
      <p class="lede">
        What you can do to a thing, defined once and offered everywhere: from its "…" button, on a right-click, and on
        its keyboard shortcuts.
      </p>
      <Example title="Context menu" hero name="context-menu/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          <strong>One action list, many places.</strong> An action list is plain data: each action's label, icon, keys
          and what it does. The same list fills a row's "…" menu and its right-click menu, binds its keyboard shortcuts,
          and is what an editor's slash menu and toolbar read. Nobody writes the menu twice, and the two can't drift
          apart.
        </li>
        <li>
          <strong>Generic over what it acts on.</strong> A list is made once, for a kind of thing: a page in a Tree, an
          editor's selection. Each surface hands it the thing when it opens, so whether an action shows, is enabled, or
          is on is asked then. Delete can't be used on the home page; Publish shows only on a draft.
        </li>
        <li>
          <strong>Right-click.</strong> Any element becomes a region with <code>ref={"{contextMenu(actions, contextOf)}"}</code>.
          A right-click, a long press on a touch screen, the menu key or <kbd>Shift</kbd> <kbd>F10</kbd> asks{" "}
          <code>contextOf</code> what was clicked, and opens the menu at the pointer, or beside what has focus from the
          keyboard. Where there is nothing to act on, it returns nothing and the browser's own menu shows.
        </li>
        <li>
          <strong>The "…" button.</strong> <code>ActionMenu</code> is an <a href="/icon-button">Icon button</a> that
          opens the same list below it. Right-click is quick but hidden, so anything in a context menu should also be
          reachable from a button or a key: the shared list makes that free.
        </li>
        <li>
          <strong>It's Dropdown's menu.</strong> The same look, item parts and keys as <a href="/dropdown">Dropdown</a>,
          plus what an action list needs: submenus, such as Move to › Blog, and items that are on or off, such as Wrap
          lines, or one of a set, such as a text size.
        </li>
        <li>
          <strong>One menu on the page.</strong> Every region and every "…" button opens one shared menu, built when it
          opens. A tree of 500 pages has 500 buttons and one menu.
        </li>
        <li>
          <strong>The browser's menu is a Shift away.</strong> <kbd>Shift</kbd> with a right-click always shows the
          browser's own menu, as Firefox already does, for Inspect or a link's Open in new tab. On a phone, text being
          edited keeps the phone's own menu, with its selection handles.
        </li>
      </ul>

      <h2>Examples</h2>
      <p>
        Each example is the Solid components, with their code and the markup they render. Right-click a row, long-press it on a phone, focus one with <kbd>Tab</kbd> and
        press <kbd>Shift</kbd> <kbd>F10</kbd>, or press <kbd>F2</kbd>, <kbd>⌘D</kbd> or <kbd>Delete</kbd> on it.
      </p>
      <Example title="Site pages: the … menu and right-click are one list" name="context-menu/site-pages" />
      <Example title="A writing area: undo, the clipboard, and a submenu" name="context-menu/writing" />

      <h2>The action list</h2>
      <p>
        <code>ActionList&lt;C&gt;</code> is a list of actions and groups, in order, for a context of type{" "}
        <code>C</code>. It is in <code>src/actions.ts</code>, and the Tree and the text editor are built on it.
      </p>
      <h3>Action</h3>
      <PropsTable
        rows={[
          { name: "id", type: "string", description: "Stable and unique in its list, such as \"rename\". A surface keys on it, and a test finds it by it." },
          { name: "label", type: "string", description: "What it does, as a verb: Rename, Turn into." },
          {
            name: "icon",
            type: "() => JSX.Element",
            default: "none",
            description: "An <svg>, drawn fresh each time, since one list shows in several places at once.",
          },
          { name: "description", type: "string", default: "none", description: "A line under the label, as DropdownDescription." },
          { name: "keywords", type: "string[]", default: "none", description: "More words a search finds it by, such as an editor's slash menu: h1 and title for Heading 1." },
          {
            name: "keys",
            type: "string",
            default: "none",
            description: (
              <>
                An app-wide shortcut, written as <code>aria-keyshortcuts</code> writes it, with <code>Mod</code> for{" "}
                <kbd>⌘</kbd> on Apple and <kbd>Ctrl</kbd> elsewhere: <code>"Mod+D"</code>, <code>"Shift+Mod+Z"</code>,{" "}
                <code>"F2"</code>. Shown at the item's end as ⌘D or Ctrl+D, and run in the region it belongs to.
              </>
            ),
          },
          { name: "shortcut", type: "string", default: "none", description: "One letter that picks it while the menu is open, as DropdownItem's shortcut." },
          { name: "color", type: '"danger"', default: "none", description: "For an action that destroys something." },
          { name: "hidden", type: "(context) => boolean", default: "never", description: "Left out of every surface when it returns true." },
          { name: "enabled", type: "(context) => boolean", default: "always", description: "Faded, and skipped by the keys, when it returns false. Its shortcut does nothing then." },
          {
            name: "active",
            type: "(context) => boolean",
            default: "none",
            description: (
              <>
                Whether it is on now, such as Bold in a bold selection. Given, the menu shows it as a checkbox item with
                a check at its end, or a radio item in a group with <code>select: "one"</code>, and a toolbar as a pressed
                button.
              </>
            ),
          },
          { name: "run", type: "(context) => void", default: "none", description: "Does it. The menu closes and focus goes back first, so an editor's Paste lands in the editor." },
          { name: "href", type: "(context) => string", default: "none", description: "Makes it a link, an <a href>, in place of run." },
          { name: "actions", type: "ActionList<C>", default: "none", description: "Makes it a submenu, such as Move to, in place of run and href." },
        ]}
      />
      <h3>ActionGroup</h3>
      <p>
        An entry with no <code>id</code> is a group: <code>{"{ heading?, select?, actions }"}</code>. A menu draws a line
        between a group and what's beside it, and a heading names one that has it, as DropdownSection does. With{" "}
        <code>select: "one"</code>, its actions are a set of which one is on. There is no divider type: a group is the
        divider.
      </p>
      <h3>Helpers</h3>
      <PropsTable
        rows={[
          {
            name: "runActionKey(list, event, context)",
            type: "boolean",
            description: "Runs the action whose keys were pressed, if it shows and is enabled, and stops the browser's default. For an editor's own key handling, such as ProseMirror's handleKeyDown.",
          },
          { name: "shownActions(list, context)", type: "ActionList<C>", description: "The list without what's hidden, and without groups and submenus left empty. For a toolbar or slash menu to draw itself." },
          { name: "keyLabel(keys)", type: "string", description: "The keys as a person reads them: ⇧⌘Z on Apple, Ctrl+Shift+Z elsewhere." },
          { name: "ariaKeys(keys)", type: "string", description: "The keys as aria-keyshortcuts writes them: Meta+Z or Control+Z." },
        ]}
      />

      <h2>Props</h2>
      <h3>contextMenu(actions, contextOf, options)</h3>
      <p>
        A ref that makes an element a region: <code>{"<ul ref={contextMenu(actions, pageOf)}>"}</code>. It adds no
        element and no wrapper.
      </p>
      <PropsTable
        rows={[
          { name: "actions", type: "ActionList<C> | () => ActionList<C>", description: "The list, or a function that returns it when the menu opens." },
          {
            name: "contextOf",
            type: "(target: Element) => C | undefined",
            default: "always opens",
            description: "What was right-clicked, or has focus, as the list's context: a Tree's node under the pointer. Undefined leaves the browser's own menu. Left out, the list has no context and always opens.",
          },
          { name: "options.keys", type: "boolean", default: "true", description: "false: the region doesn't run the actions' keys, as an editor or a text box runs its own." },
          { name: "options.scope", type: "string", default: "none", description: "Names the region's actions where a ? sheet or a command palette lists them, such as Pages. With keys false, whatever runs the keys names them." },
          { name: "options.label", type: "(context) => string", default: '"Actions"', description: "The menu's name for a screen reader, such as \"Actions for Pricing\"." },
          { name: "options.returnFocus", type: "(target) => Element | undefined", default: "where it was", description: "Where focus goes when the menu closes." },
          { name: "options.onToggle", type: "(open, context) => void", default: "none", description: "Called when the menu opens, and once when it closes, as a Tree marks its row." },
        ]}
      />
      <h3>ActionMenu</h3>
      <PropsTable
        rows={[
          { name: "actions", type: "ActionList<C>", description: "The list." },
          { name: "context", type: "C", description: "What it acts on: this row's page." },
          { name: "label", type: "string", description: "The button's name, in its tooltip, and the menu's: \"Actions for Pricing\"." },
          { name: "side", type: '"bottom end" | "bottom start"', default: '"bottom end"', description: "Where the menu opens: below the button, lined up with its end, as a … sits at the end of a row." },
          {
            name: "focusable",
            type: "boolean",
            default: "true",
            description: "false: out of the Tab order and hidden from screen readers, for a row whose own keys reach the menu, as a Tree's row is one Tab stop and opens it with Shift+F10. Give returnFocus the row.",
          },
          { name: "returnFocus", type: "Element", default: "the button", description: "Where focus goes when the menu closes." },
          { name: "onToggle", type: "(open: boolean) => void", default: "none", description: "Called when its menu opens and closes." },
          { name: "icon", type: "JSX.Element", default: "three dots", description: "In place of the three dots." },
        ]}
      />
      <p>
        Everything else is Icon button's: <code>variant</code>, which is <code>"tertiary"</code> here, and{" "}
        <code>disabled</code>. <code>openActions(actions, context, options)</code> opens the menu from code, beside an
        element or at a point, for a surface that draws its own button.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/">APG menu keys</a>, as Dropdown, with
        submenus as APG's menubar opens them. APG has no context menu pattern: this follows what desktop apps do.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Key or event</th>
              <th>Behavior</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Right-click in a region</td>
              <td>Opens the menu with its corner at the pointer, focus on the menu and no item lit. It flips to fit at the screen's edges.</td>
            </tr>
            <tr>
              <td>
                <kbd>Shift</kbd> with a right-click
              </td>
              <td>The browser's own menu.</td>
            </tr>
            <tr>
              <td>Long press, on a touch screen</td>
              <td>Opens the menu at the finger as it lifts, after half a second held without moving. A menu shown while it was still down would close as it lifted. Not in text being edited, which keeps the phone's menu.</td>
            </tr>
            <tr>
              <td>
                The menu key, <kbd>Shift</kbd> <kbd>F10</kbd>
              </td>
              <td>Opens the menu below what has focus, on its first item.</td>
            </tr>
            <tr>
              <td>An action's keys, in the region</td>
              <td>Runs it for what has focus, when it shows and is enabled. A text box's own keys stay its own.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> on a … button
              </td>
              <td>Opens the menu on its first item. A click opens it with no item lit, and a second click closes it.</td>
            </tr>
            <tr>
              <td>
                <kbd>↓</kbd> <kbd>↑</kbd> <kbd>Home</kbd> <kbd>End</kbd>, letters, <kbd>Tab</kbd>
              </td>
              <td>As in Dropdown: move, wrap, jump to an item by its first letters, or pick one by its shortcut letter.</td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd>, <kbd>Enter</kbd> on an item with a submenu
              </td>
              <td>Opens the submenu beside it, on its first item.</td>
            </tr>
            <tr>
              <td>
                <kbd>←</kbd>, <kbd>Escape</kbd> in a submenu
              </td>
              <td>Closes the submenu, back to the item that opened it.</td>
            </tr>
            <tr>
              <td>Pointer resting on an item with a submenu</td>
              <td>Opens it after 150ms. Moving to another item closes it after the same wait, so a diagonal path to the submenu doesn't lose it.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>, a click on an item
              </td>
              <td>Closes the menu, puts focus back where it was, then does the action. A checkbox item flips; a radio item becomes the one.</td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>, a click outside
              </td>
              <td>Closes the menu. Focus goes back where it was, or stays where the click put it.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                The menu is named by its <code>label</code>, or by its … button. Items read as menu items, with their
                keys (<code>aria-keyshortcuts</code>). A checkbox or radio item reads as checked or not. An item with a
                submenu reads as having one, and whether it's open. A region isn't announced as having a menu, since
                no ARIA role says so: the … button and the keys are what a screen reader user finds.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Items:</strong> as Dropdown's: lit with the quiet tint, faded when disabled, danger in its color, an
          icon at the start, keys at the end in the muted color.
        </li>
        <li>
          <strong>On or off:</strong> a check at the end of the item when it's on, as on a Listbox's option, in a column
          every such item keeps, so the labels line up whether they're on or not.
        </li>
        <li>
          <strong>Submenu:</strong> a chevron at the item's end. While its submenu is open the item stays lit, and the
          submenu opens beside it with its first item level with it, flipping to the other side where it doesn't fit.
        </li>
        <li>
          <strong>Opening:</strong> as Popover, it grows in from its corner at the pointer, and from the button's side
          below a … button. Under reduced motion, a plain fade.
        </li>
        <li>
          <strong>Inside a dialog:</strong> the menu opens inside the open modal dialog, which makes the page behind it
          inert.
        </li>
        <li>
          <strong>Themes:</strong> Popover's panel: classic's raised color with a hairline edge, or glass's frosted pane.
        </li>
      </ul>

      <h2>Platform support</h2>
      <ul>
        <li>
          As Popover and Dropdown: <code>popover</code> everywhere, anchor positioning in Chrome 125, Safari 26 and
          Firefox 147. The menu at the pointer anchors to a point the kit places there.
        </li>
        <li>
          Safari on iPhone and iPad sends no right-click for a long press, so the kit times one itself. Chrome on Android
          sends one, which opens the same menu.
        </li>
        <li>
          Paste from a menu reads the clipboard with <code>navigator.clipboard</code>, which the browser may ask
          permission for. <kbd>⌘V</kbd> needs no permission.
        </li>
      </ul>

      <h2>Left out</h2>
      <ul>
        <li>
          <strong>Regions inside regions sharing their actions.</strong> The innermost region's list shows, alone. A list
          that wants another's actions includes them: <code>[...editorActions, ...pageActions]</code>.
        </li>
        <li>
          <strong>A menu with no JS.</strong> A right-click needs JS. A Dropdown of static markup still works without it.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Dropdown and Popover for the menu, APG's menu keys and menubar submenus, and the context menus of macOS and
        Figma for the pointer, the Shift escape, and the submenu's timing. No reference component has a context menu, so
        the name and the action list are ours.
      </p>
    </article>
  );
}
