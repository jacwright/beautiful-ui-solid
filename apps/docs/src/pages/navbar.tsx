import { Example, PropsTable } from "../spec.tsx";

export default function NavbarPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Navbar</h1>
      <p class="lede">The row of links across the top of an app or a site, with a bar under the page you're on.</p>
      <Example title="Navbar" hero name="navbar/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;nav&gt;</code>, so screen readers list it with the page's landmarks and can jump
          straight to it. Its items are plain links and buttons in the order of the page. It adds no keys of its own.
        </li>
        <li>
          The page you're on has a 2px bar under its words, in the text color, on the Navbar's bottom edge. When an
          app moves to another page without a reload, the bar glides to the new item in 240ms. Screen readers hear
          "current page".
        </li>
        <li>
          Items are quiet: the text color, no underline, and no fill until the pointer is over one. Then a soft tint
          shows its shape, deeper while pressed. An icon in an item is muted until its item is hovered or current.
        </li>
        <li>
          Items gather into sections. A spacer pushes the sections after it to the far end, where an app keeps
          search, its inbox and the account menu. A divider stands between the team switcher and the links.
        </li>
        <li>
          A Dropdown's button in a Navbar takes the item look, so a team switcher or an account menu sits in the row
          like any item and opens its menu below it. A primary or tertiary Button, such as a "Start free", keeps
          Button's look. A secondary Button writes no variant, so in a Navbar it takes the item look.
        </li>
        <li>
          A row too wide for the screen scrolls sideways, and fades at an edge that has more past it. It never
          wraps onto a second line or pushes the page sideways. The Solid component scrolls the current item into
          view, at once on the first page and smoothly after. On a phone, the Stacked layout will move the links into
          its menu instead.
        </li>
        <li>
          It draws no pane of its own, so it sits on whatever the layout puts behind it. On glass, its menus are glass.
          Classic and glass items look the same.
        </li>
        <li>The CSS styles a <code>&lt;nav data-navbar&gt;</code>, so a static site gets it all with no JS.</li>
      </ul>
      <p>
        Use a Navbar for places: other pages of the app or site. Tabs switch panels within one page. A Sidebar holds the
        same links standing in a column, for an app with more places than a row can hold.
      </p>

      <h2>Anatomy</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Part</th>
              <th>Renders</th>
              <th>Job</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>Navbar</code></td>
              <td><code>&lt;nav data-navbar&gt;</code></td>
              <td>The landmark and the row. Its padding is the room for the bar and for a focus ring.</td>
            </tr>
            <tr>
              <td><code>NavbarSection</code></td>
              <td><code>&lt;beautiful-navbar-section&gt;</code></td>
              <td>A group of items, 8px apart. Sections and the other parts are 16px apart.</td>
            </tr>
            <tr>
              <td><code>NavbarItem</code></td>
              <td><code>&lt;a href&gt;</code> or <code>&lt;button&gt;</code></td>
              <td>
                A place, or with no <code>href</code> an action such as opening search. An optional leading icon, then
                its words. <code>aria-current="page"</code> marks the page you're on.
              </td>
            </tr>
            <tr>
              <td><code>NavbarDivider</code></td>
              <td><code>&lt;hr aria-orientation="vertical"&gt;</code></td>
              <td>A hairline standing 24px tall between parts.</td>
            </tr>
            <tr>
              <td><code>NavbarSpacer</code></td>
              <td><code>&lt;beautiful-navbar-spacer&gt;</code></td>
              <td>Takes the free room, so what follows sits at the end.</td>
            </tr>
            <tr>
              <td>Current-page bar</td>
              <td>the nav's <code>::after</code></td>
              <td>
                One bar per Navbar, placed under the current item with CSS anchor positioning, so it can glide. No
                extra element.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Navbar</h3>
      <PropsTable
        rows={[
          {
            name: "aria-label",
            type: "string",
            default: "none",
            description: (
              <>
                The landmark's name, such as <code>"Main"</code>. Give one when the page has more than one{" "}
                <code>&lt;nav&gt;</code>, so a screen reader can tell them apart.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "Sections, items, dividers, spacers and Dropdowns." },
        ]}
      />
      <h3>NavbarItem</h3>
      <PropsTable
        rows={[
          {
            name: "href",
            type: "string",
            default: "none",
            description: (
              <>
                Where it goes. Without one the item is a <code>&lt;button type="button"&gt;</code> for an action, and
                takes <code>onClick</code> and <code>disabled</code>.
              </>
            ),
          },
          {
            name: "current",
            type: "boolean",
            default: "false",
            description: (
              <>
                The page you're on. Writes <code>aria-current="page"</code>, which draws the bar. An app sets it from
                its router, so the bar glides when the page changes, and a row that scrolls brings it into view.
              </>
            ),
          },
          {
            name: "aria-label",
            type: "string",
            default: "none",
            description: "Required on an item with only an icon: it's the item's name.",
          },
          { name: "children", type: "JSX.Element", description: "An optional leading <svg>, then the words." },
        ]}
      />
      <p>
        <code>NavbarSection</code>, <code>NavbarDivider</code> and <code>NavbarSpacer</code> take no props of their
        own. Every part passes other attributes and handlers to its element.
      </p>
      <pre tabindex="0">
        <code>{`import {
  Dropdown, DropdownButton, DropdownItem, DropdownMenu,
  Navbar, NavbarDivider, NavbarItem, NavbarSection, NavbarSpacer,
} from "beautiful-ui-solid";
import { useLocation } from "@solidjs/router";

const location = useLocation();
const at = (path: string) => location.pathname.startsWith(path);

<Navbar aria-label="Main">
  <Dropdown>
    <DropdownButton><SparkIcon /> Spring Studio <ChevronDownIcon /></DropdownButton>
    <DropdownMenu>
      <DropdownItem href="/team">Team settings</DropdownItem>
    </DropdownMenu>
  </Dropdown>
  <NavbarDivider />
  <NavbarSection>
    <NavbarItem href="/" current={location.pathname === "/"}>Home</NavbarItem>
    <NavbarItem href="/sites" current={at("/sites")}>Sites</NavbarItem>
    <NavbarItem href="/forms" current={at("/forms")}>Forms</NavbarItem>
  </NavbarSection>
  <NavbarSpacer />
  <NavbarSection>
    <NavbarItem href="/search" aria-label="Search"><SearchIcon /></NavbarItem>
  </NavbarSection>
</Navbar>`}</code>
      </pre>

      <h2>Keyboard and screen readers</h2>
      <p>
        A Navbar is a navigation landmark holding links, as the APG's landmark guidance describes. There is no APG
        pattern for a row of links because none is needed: the browser's own keys are the right ones. It doesn't use
        arrow keys, a <code>menubar</code> or <code>tablist</code> role: those would hide every link but one from Tab,
        and tell a screen reader to expect an application menu.
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
                <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>
              </td>
              <td>
                Moves through the items in order, and scrolls a row that doesn't fit to show the one with focus. The
                focus ring glides from item to item.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>Follows a link, or presses a button item.</td>
            </tr>
            <tr>
              <td>
                <kbd>Space</kbd>
              </td>
              <td>Presses a button item. On a link it scrolls the page, as on every link.</td>
            </tr>
            <tr>
              <td>A Dropdown in the row</td>
              <td>
                Its button and menu keep Dropdown's keys: <kbd>↓</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> open it,
                the arrows move in it, <kbd>Esc</kbd> closes it and returns focus to the button.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce "navigation" with its <code>aria-label</code>, then each link's words, and "current page" on
                the current one. A button that opens a menu says so. The divider is read as a separator. An icon-only
                item reads its <code>aria-label</code>, and its icon is hidden.
              </td>
            </tr>
            <tr>
              <td>Touch</td>
              <td>
                Where the pointer is a finger, every item is at least 44px tall and wide (<code>--control-height</code>
                ), and the row scrolls with a swipe.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>State</th>
              <th>Look</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rest</td>
              <td>The text color, weight 500, no fill. An icon is muted.</td>
            </tr>
            <tr>
              <td>Hover</td>
              <td>A tint of the text color at 8% fills the item's rounded shape in 120ms, and its icon takes the text color.</td>
            </tr>
            <tr>
              <td>Pressed, or its menu open</td>
              <td>The tint deepens to 14%. Nothing shrinks: an item is a place, not an action.</td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>The kit's 2px accent ring, 2px out, around the item's 8px corners. Keyboard focus only.</td>
            </tr>
            <tr>
              <td>Current page</td>
              <td>
                The bar under its words, and its icon in the text color. It glides between items with{" "}
                <code>--motion-slide</code> and <code>--ease-in-out</code>. Under reduced motion it moves at once.
              </td>
            </tr>
            <tr>
              <td>No current page</td>
              <td>No bar, as on a page the Navbar doesn't list, such as a sign-in page.</td>
            </tr>
            <tr>
              <td>Disabled</td>
              <td>A button item only, faded to 50% as a Button is. A link can't be disabled: leave it out instead.</td>
            </tr>
            <tr>
              <td>Too wide to fit</td>
              <td>
                Scrolls sideways. A 32px fade at each edge that has more past it says there's more, and an item that
                takes focus scrolls clear of the fade. With a mouse, a thin scrollbar shows under the row, since a
                wheel can't scroll sideways. A finger swipes, and sees none.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> Every color comes from the text color, so light and dark mode need nothing of
        their own. The Navbar draws no pane, so classic and glass look the same. Its menus are Dropdown's, and on glass
        they are frosted. The Stacked layout decides what the band behind a Navbar looks like.
      </p>

      <h2>Look tokens</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>--control-height</code></td><td>an item's least height and width: 36px, or 44px for a finger</td></tr>
            <tr><td><code>--control-font-size</code>, <code>--control-icon</code></td><td>its words and its icon</td></tr>
            <tr><td><code>--radius-md</code></td><td>its corners: 8px</td></tr>
            <tr><td><code>--space-1</code>, <code>--space-2</code>, <code>--space-4</code>, <code>--space-6</code>, <code>--space-8</code></td><td>its padding, the gaps, the divider's height, and the edge fade</td></tr>
            <tr><td><code>--color-text</code>, <code>--color-text-muted</code></td><td>the words, the tints and the bar, and an icon at rest</td></tr>
            <tr><td><code>--motion-quick</code>, <code>--ease-out</code></td><td>the tint on hover</td></tr>
            <tr>
              <td><code>--motion-slide</code> (new), <code>--ease-in-out</code></td>
              <td>240ms: the bar's glide to the new current item. 0ms under reduced motion. Tabs' line reads it too.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;nav&gt;</code>, links and buttons work everywhere. The gliding bar uses CSS anchor positioning, in
        Chrome 125 and Safari 26. A browser without it draws the bar under the current item, where it doesn't glide. The
        edge fades use scroll-driven animations, in Chrome 115 and Safari 26. Without them the row still scrolls, with
        no fade.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Navbar for the parts and their names: sections, a divider, a spacer, items with an optional icon, a
        bar under the current item that glides to the next, and a Dropdown as the team switcher and the account menu.
        The APG's landmark regions and its note on not using menu roles for site navigation. WCAG 2.5.8 for the item's
        target size.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component live, then its code, then the markup it renders. Click a link to make it
        the current page and watch the bar glide. Switch the theme and mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="An app's top bar" name="navbar/app" />
      <Example title="With icons" name="navbar/icons" />
      <Example title="A site's header" name="navbar/site" />
      <Example title="Too wide to fit" name="navbar/narrow" />
    </article>
  );
}
