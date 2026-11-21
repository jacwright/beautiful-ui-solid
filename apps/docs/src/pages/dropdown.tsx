import { itemLabel } from "beautiful-ui-solid";
import { onSettled } from "solid-js";
import { Example, PropsTable } from "../spec.tsx";

export default function DropdownPage() {
  let page!: HTMLElement;
  let picked!: HTMLDialogElement;
  let pickedText!: HTMLParagraphElement;

  // The page says which item was picked, so the keys can be tried here.
  onSettled(() => {
    function pick(event: MouseEvent) {
      const item = (event.target as Element).closest<HTMLElement>('beautiful-example-preview [role="menuitem"]');
      if (!item || item.matches(":disabled")) return;
      event.preventDefault();
      pickedText.textContent = `${itemLabel(item)} was selected.`;
      picked.showModal();
    }
    page.addEventListener("click", pick);
    return () => {
      page.removeEventListener("click", pick);
    };
  });

  return (
    <article ref={page}>
      <p class="eyebrow">Built</p>
      <h1>Dropdown</h1>
      <p class="lede">A menu of actions that opens from a button, for picking one and getting on with it.</p>
      <Example title="Dropdown" hero name="dropdown/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          The menu is <a href="/popover">Popover</a>'s panel with the menu role: a native <code>popover</code>, opened by
          its button with <code>commandfor</code> and <code>command="toggle-popover"</code>. The browser puts it above
          everything, places it against its button, closes it on <kbd>Escape</kbd> or a click outside, and returns
          focus to the button.
        </li>
        <li>
          The Solid component adds what a menu needs and the platform lacks: the arrow keys move between items, typing
          a letter jumps to the item it starts with, the item under the pointer is the one the keys go on from, and
          picking an item or tabbing out of the menu closes it.
        </li>
        <li>
          An item is an action, a <code>&lt;button&gt;</code>, or a link, an <code>&lt;a href&gt;</code>. It may have
          an icon at its start, a shortcut at its end, and a line of description under it. A divider separates groups
          of items, and a section gives a group a heading.
        </li>
        <li>
          An item that destroys something, such as Delete, is in the danger color. An item that can't be used now is
          faded and the keys skip it.
        </li>
        <li>
          It isn't for choosing a value that stays chosen, such as a plan or a country: that is{" "}
          <strong>Select</strong> or <strong>Listbox</strong>. It isn't for a site's navigation either: a marketing
          site's menu of pages is a <a href="/popover">Popover</a> of links, which works with no JS, as APG advises.
        </li>
      </ul>

      <h2>Anatomy</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Renders</th>
              <th>Job</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>Dropdown</code></td>
              <td>nothing</td>
              <td>A Popover: gives the button and menu their ids, and holds the open state.</td>
            </tr>
            <tr>
              <td><code>DropdownButton</code></td>
              <td>
                a <a href="/button">Button</a>, with <code>aria-haspopup="menu"</code>
              </td>
              <td>Opens and closes the menu, and names it.</td>
            </tr>
            <tr>
              <td><code>DropdownMenu</code></td>
              <td>
                <code>&lt;beautiful-menu popover role="menu"&gt;</code>
              </td>
              <td>The menu. It takes focus when the pointer opens it, so it is <code>tabindex="-1"</code>.</td>
            </tr>
            <tr>
              <td><code>DropdownItem</code></td>
              <td>
                <code>&lt;button role="menuitem"&gt;</code>, or <code>&lt;a role="menuitem"&gt;</code> with{" "}
                <code>href</code>
              </td>
              <td>One action or link. Its children are its label, and any icon, shortcut or description.</td>
            </tr>
            <tr>
              <td><code>DropdownShortcut</code></td>
              <td>
                <code>&lt;kbd&gt;</code>
              </td>
              <td>
                An app-wide keyboard shortcut, such as ⌘R, shown at the item's end. The app handles those keys: this
                only shows them.
              </td>
            </tr>
            <tr>
              <td><code>DropdownDescription</code></td>
              <td>
                <code>&lt;small&gt;</code>
              </td>
              <td>
                A line under the item's label. A screen reader reads it after the label, as part of the item's name,
                so what it says matches what's on screen.
              </td>
            </tr>
            <tr>
              <td><code>DropdownDivider</code></td>
              <td>
                <code>&lt;hr&gt;</code>
              </td>
              <td>A line between groups of items.</td>
            </tr>
            <tr>
              <td>
                <code>DropdownSection</code>, <code>DropdownHeading</code>
              </td>
              <td>
                <code>&lt;beautiful-menu-section role="group"&gt;</code>, <code>&lt;header role="presentation"&gt;</code>
              </td>
              <td>A group of items under a heading, which names the group.</td>
            </tr>
            <tr>
              <td>An icon</td>
              <td>
                an <code>&lt;svg&gt;</code>, first in the item
              </td>
              <td>No component, as in Button. It takes the muted color.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Dropdown</h3>
      <PropsTable
        rows={[
          {
            name: "id",
            type: "string",
            default: "made up",
            description: (
              <>
                The menu's id. The button's is the same with <code>-button</code> after it.
              </>
            ),
          },
          {
            name: "open",
            type: "boolean",
            default: "none",
            description: "Opens or closes the menu from the parent, as Popover's open does. Opened this way, the menu takes focus.",
          },
          {
            name: "onToggle",
            type: "(open: boolean) => void",
            default: "none",
            description: "Called whenever the menu opens or closes, however it happens.",
          },
          { name: "children", type: "JSX.Element", description: "The button and the menu." },
        ]}
      />
      <h3>DropdownButton</h3>
      <p>
        Button's props: <code>variant</code>, <code>color</code>, <code>disabled</code>, and the label as its children.
        Add a chevron as an <code>&lt;svg&gt;</code> after the label, or give an icon-only button an{" "}
        <code>aria-label</code>.
      </p>
      <h3>DropdownMenu</h3>
      <PropsTable
        rows={[
          {
            name: "anchor",
            type: "PopoverPanel's anchor",
            default: '"bottom start"',
            description: (
              <>
                The side of the button the menu opens on, then how it lines up, as on{" "}
                <a href="/popover">PopoverPanel</a>. Use <code>"bottom end"</code> for a button at the end of a row.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The items, dividers and sections." },
        ]}
      />
      <h3>DropdownItem</h3>
      <PropsTable
        rows={[
          {
            name: "href",
            type: "string",
            default: "none",
            description: (
              <>
                Makes the item a link, an <code>&lt;a&gt;</code>. Left out, it is a <code>&lt;button&gt;</code>.
              </>
            ),
          },
          {
            name: "onClick",
            type: "(event: MouseEvent) => void",
            default: "none",
            description: "The action. It runs on a click, Enter or Space, and then the menu closes.",
          },
          {
            name: "shortcut",
            type: "string",
            default: "none",
            description: (
              <>
                One letter or digit that picks the item while the menu is open, such as <code>"D"</code>. It is shown at
                the item's end and written as <code>aria-keyshortcuts</code>, so a screen reader announces it. Use it
                in place of <code>DropdownShortcut</code>.
              </>
            ),
          },
          {
            name: "color",
            type: '"danger"',
            default: "none",
            description: (
              <>
                For an action that destroys something. Written as <code>data-color</code>, as on Button.
              </>
            ),
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Fades the item. The keys and the pointer pass over it. A link can't be disabled: leave it out.",
          },
          { name: "children", type: "JSX.Element", description: "The label, and any icon, shortcut or description." },
        ]}
      />
      <p>
        <code>DropdownShortcut</code>, <code>DropdownDescription</code>, <code>DropdownSection</code> and{" "}
        <code>DropdownHeading</code> take their content as children.{" "}
        <code>DropdownDivider</code> takes nothing. Other attributes pass through to each element.
      </p>
      <pre tabindex="0">
        <code>{`import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownMenu, DropdownShortcut } from "beautiful-ui-solid";

<Dropdown>
  <DropdownButton>Actions</DropdownButton>
  <DropdownMenu>
    <DropdownItem onClick={rename}>
      Rename
      <DropdownShortcut>⌘R</DropdownShortcut>
    </DropdownItem>
    <DropdownItem shortcut="D" onClick={duplicate}>Duplicate</DropdownItem>
    <DropdownItem href="/sites/spring-launch/settings">Settings</DropdownItem>
    <DropdownDivider />
    <DropdownItem color="danger" onClick={remove}>Delete</DropdownItem>
  </DropdownMenu>
</Dropdown>`}</code>
      </pre>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/">APG menu button pattern</a> and its{" "}
        <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/">menu keys</a>, with Headless UI's Menu for the
        pointer.
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
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> on the button
              </td>
              <td>Opens the menu with focus on its first item.</td>
            </tr>
            <tr>
              <td>
                <kbd>↑</kbd> on the button
              </td>
              <td>Opens the menu with focus on its last item.</td>
            </tr>
            <tr>
              <td>Click on the button</td>
              <td>
                Opens the menu with focus on the menu itself and no item lit, as a native menu opens under the
                pointer. <kbd>↓</kbd> then goes to the first item. A second click closes it.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>↓</kbd>, <kbd>↑</kbd>
              </td>
              <td>Moves to the next or previous item, wrapping from the last to the first and back.</td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd>, <kbd>End</kbd>
              </td>
              <td>Moves to the first or last item.</td>
            </tr>
            <tr>
              <td>An item's shortcut letter</td>
              <td>
                Picks that item at once, as <kbd>Enter</kbd> on it would. Only items with a <code>shortcut</code> have
                one, and only while the menu is open. Case doesn't matter, and a letter with <kbd>⌘</kbd>,{" "}
                <kbd>Ctrl</kbd> or <kbd>Alt</kbd> is left to the app.
              </td>
            </tr>
            <tr>
              <td>Any other letter</td>
              <td>
                Moves to the next item whose label starts with it. Letters typed within half a second add up, so{" "}
                <kbd>D</kbd> <kbd>E</kbd> finds Delete past Duplicate.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd> on an item, or a click
              </td>
              <td>Does the action or follows the link, closes the menu, and returns focus to the button.</td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>Closes the menu and returns focus to the button.</td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>, <kbd>Shift</kbd> <kbd>Tab</kbd>
              </td>
              <td>
                Moves to the next or previous item, as without JS, skipping disabled ones. Tabbing past the last item,
                or back before the button, closes the menu, and focus goes on as usual, as in Popover. The kit chose this
                over APG's Tab, which closes the menu at once and leaves it.
              </td>
            </tr>
            <tr>
              <td>Pointer over an item</td>
              <td>Lights it and moves focus to it, so the keys go on from there. Leaving the menu puts focus back on it, with no item lit.</td>
            </tr>
            <tr>
              <td>Click outside</td>
              <td>Closes the menu. Focus stays where the click put it.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce the button as a menu button, collapsed or expanded. The menu takes its button's label as its
                name. Each item is read as a menu item with its place, such as 2 of 5. A description is read with its label. A
                section is read as a group named by its heading.
              </td>
            </tr>
            <tr>
              <td>No JS</td>
              <td>
                The button opens and closes the menu, <kbd>Tab</kbd> walks its items, <kbd>Enter</kbd> picks one, and{" "}
                <kbd>Escape</kbd> or a click outside closes it. The arrow keys and letters need JS: the Solid component, or the kit's{" "}
                <code>wireMenu(menu)</code> on static markup.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Closed, opening, closing:</strong> as Popover: grows in from the button's side over 200ms, and
          shrinks back in 120ms. Under reduced motion, a plain fade.
        </li>
        <li>
          <strong>Item lit:</strong> the item the keyboard or the pointer is on takes a quiet tint of the text color,
          9%, and keeps its text, icon and shortcut as they are. A danger item takes a 10% tint of the danger color, and its text deepens a shade to keep its contrast on glass.
          There is no focus ring inside the menu: the tint is where focus is. One item is
          lit at a time: while the keyboard is on an item, the pointer lights nothing, and a clicked item doesn't stay
          lit when the pointer moves on. In forced colors, where the tint drops out, the lit item takes an outline.
        </li>
        <li>
          <strong>Item disabled:</strong> faded to half, never lit.
        </li>
        <li>
          <strong>Danger item:</strong> its label and icon in the danger color.
        </li>
        <li>
          <strong>Size:</strong> at least 12rem wide, or as wide as its button if that's wider, and up to Popover's
          20rem, where a long label wraps. 0.25rem of padding around the items, so each item's 0.5rem corners sit
          inside the menu's 0.75rem ones. Items are 2rem tall with 14px text.
        </li>
        <li>
          <strong>Touch screens:</strong> items are 2.75rem tall, a 44px target, with 16px text, as Button grows. The
          menu stays beside its button and flips where it doesn't fit, as Popover does.
        </li>
        <li>
          <strong>Long menus:</strong> the menu doesn't scroll, so keep it to a dozen items or so. A long list to
          choose from is a Listbox or Combobox.
        </li>
        <li>
          <strong>Themes:</strong> the menu is Popover's panel: classic's raised color with a hairline edge, or glass's
          one frosted pane with the rim and sheen. Glass falls back to classic where the browser lacks{" "}
          <code>backdrop-filter</code> and where the user asks for reduced transparency.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <p>
        Dropdown reads Popover's <code>--popup-*</code> tokens for the menu. It adds three, and sets one on each item.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--item-height</code></td>
              <td>2rem, and 2.75rem on touch screens. New: Listbox's and Combobox's options will use it too.</td>
            </tr>
            <tr>
              <td><code>--text-xs</code></td>
              <td>0.75rem, new: a section's heading and an item's description.</td>
            </tr>
            <tr>
              <td><code>--dropdown-min-width</code></td>
              <td>12rem, set on the menu.</td>
            </tr>
            <tr>
              <td>
                <code>--item-tint</code>
              </td>
              <td>The lit item's tint, set on the item: 9% of the text color, or 10% of danger.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <ul>
        <li>
          As Popover: <code>popover</code> everywhere, <code>commandfor</code> in Chrome 135, Safari 26.2 and Firefox
          144, and anchor positioning in Chrome 125, Safari 26 and Firefox 147.
        </li>
        <li>
          Matching the button's width uses <code>anchor-size()</code>, in the same browsers as anchor positioning.
          Without it, the menu is 12rem at least.
        </li>
      </ul>

      <h2>Left out</h2>
      <ul>
        <li>
          <strong>Submenus, and checkbox or radio items.</strong> Catalyst has neither. A setting that stays on is a
          Switch or a Select, outside the menu.
        </li>
        <li>
          <strong>A context menu</strong> on right-click. The same menu could open from <code>open</code> later.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Catalyst's Dropdown for the name, the parts and the look of an item. Headless UI's Menu for opening with the
        pointer, moving focus with the pointer, and skipping disabled items. APG's menu button pattern for the keys
        and roles. Popover for everything the browser does.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with its code and the markup it renders. Picking an item says which. Switch the theme and mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="Glass over bright content, with shortcut letters" name="dropdown/glass" />
      <Example title="Icons and shortcuts" name="dropdown/actions" />
      <Example title="Sections and descriptions" name="dropdown/sections" />
      <Example title="Links, from a button at the end of a row" name="dropdown/links" />

      <dialog ref={picked} id="dropdown-picked" closedby="any" aria-labelledby="dropdown-picked-text">
        <p ref={pickedText} id="dropdown-picked-text" />
        <footer>
          <button type="button" commandfor="dropdown-picked" command="close" data-variant="primary" autofocus>
            OK
          </button>
        </footer>
      </dialog>
    </article>
  );
}
