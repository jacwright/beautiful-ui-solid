import { Example, PropsTable } from "../spec.tsx";

export default function SidebarPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Sidebar</h1>
      <p class="lede">An app's own navigation, down the side of the screen, with the page you're on marked.</p>
      <Example title="Sidebar" hero name="sidebar/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a <code>&lt;nav&gt;</code>, so screen readers list it with the page's landmarks and can jump straight to
          it. Its name is required: an app with a Sidebar and a Navbar has two, and the names tell them apart.
        </li>
        <li>
          Its items are links: a native <code>&lt;a href&gt;</code> for each place, so Cmd-click, a middle click and
          "Copy link" all work. An item that does something, such as opening a search or a menu, is a{" "}
          <code>&lt;button&gt;</code> that looks the same.
        </li>
        <li>
          The item for the page you're on is a raised pane, as a secondary Button is: white on the canvas in classic,
          and a pane of frosted glass with the rim in glass. Its icon turns the accent color, so the eye finds it at a
          glance. Screen readers say "current page".
        </li>
        <li>
          The others are text until the pointer is over them, when they take a tertiary Button's tint: 8% of the text
          color, and 14% pressed. They match a Navbar's items.
        </li>
        <li>
          It has up to three parts. The header and the footer stay put, and the body between them scrolls on its own
          when the items don't fit, so the team switcher and the account are always in reach. On load, the body
          scrolls to show the current item.
        </li>
        <li>
          A section groups items under a small heading, such as "Recent sites". A divider separates items with no
          heading.
        </li>
        <li>
          A Dropdown fits in the header or footer as it is: its button becomes an item, and its menu keeps the
          Dropdown look. A button that names a <code>variant</code>, such as a primary "New site", keeps Button's
          look.
        </li>
        <li>
          It fills the column its layout gives it, in width and height. Sidebar layout, the next component, places
          it beside the page and moves it into a sheet on a phone.
        </li>
        <li>
          The CSS styles <code>&lt;nav data-sidebar&gt;</code> and its parts, so a static page gets the look with no
          JS. Every rule is wrapped in <code>:where()</code>, so its specificity is 0.
        </li>
      </ul>

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
              <td><code>Sidebar</code></td>
              <td><code>&lt;nav data-sidebar aria-label&gt;</code></td>
              <td>The landmark. A column the height of its layout.</td>
            </tr>
            <tr>
              <td><code>SidebarHeader</code></td>
              <td><code>&lt;header&gt;</code></td>
              <td>Pinned at the top, with a line under it: the team or site switcher, a search.</td>
            </tr>
            <tr>
              <td><code>SidebarBody</code></td>
              <td><code>&lt;beautiful-sidebar-body&gt;</code></td>
              <td>The main items. Takes the room between header and footer, and scrolls.</td>
            </tr>
            <tr>
              <td><code>SidebarFooter</code></td>
              <td><code>&lt;footer&gt;</code></td>
              <td>Pinned at the bottom, with a line over it: support, the account.</td>
            </tr>
            <tr>
              <td><code>SidebarSection</code></td>
              <td>
                <code>&lt;beautiful-sidebar-section role="group"&gt;</code>, and a <code>&lt;header&gt;</code> for its heading
              </td>
              <td>
                Items under a small muted heading, with space above. The group is named by its heading, so a screen
                reader says "Recent sites, group".
              </td>
            </tr>
            <tr>
              <td><code>SidebarItem</code></td>
              <td>
                <code>&lt;a href&gt;</code>, or <code>&lt;button&gt;</code> without <code>href</code>
              </td>
              <td>
                One row, at least <code>--control-height</code> tall: a leading icon, the label, and an optional
                trailing icon, such as a menu's chevron. The current one has <code>aria-current="page"</code>.
              </td>
            </tr>
            <tr>
              <td>Current pane</td>
              <td>the item's own fill, and <code>::before</code> for the glass rim</td>
              <td>The control fill, edge, sheen and shadow, as on a secondary Button.</td>
            </tr>
            <tr>
              <td><code>SidebarDivider</code></td>
              <td><code>&lt;hr&gt;</code></td>
              <td>A faint line between items.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        Catalyst's SidebarLabel and SidebarSpacer aren't here. The label is the item's text, and a long one wraps onto
        a second line rather than hiding its end, which is what a site named "Portfolio for the 2026 gallery season"
        needs. The footer is pinned to the bottom, which is the spacer's job. Catalyst's SidebarHeading is Section's{" "}
        <code>heading</code>, so the group is always named by it.
      </p>

      <h2>Props</h2>
      <h3>Sidebar</h3>
      <PropsTable
        rows={[
          {
            name: "aria-label",
            type: "string",
            description: 'What it holds, read with the landmark: "Main", "Site settings". Required.',
          },
          { name: "children", type: "JSX.Element", description: "Its header, body and footer." },
        ]}
      />
      <h3>SidebarSection</h3>
      <PropsTable
        rows={[
          {
            name: "heading",
            type: "string",
            default: "none",
            description: "The small heading over the items, which names the group. Without one, the section is space only.",
          },
          { name: "children", type: "JSX.Element", description: "Its items." },
        ]}
      />
      <h3>SidebarItem</h3>
      <PropsTable
        rows={[
          {
            name: "href",
            type: "string",
            default: "none",
            description: "Where it goes. With one it is a link, and without one a button.",
          },
          {
            name: "current",
            type: "boolean",
            default: "false",
            description: (
              <>
                Marks the page you're on, with <code>aria-current="page"</code>. Mark one item: the place you're in, even
                on a page under it, such as Sites on a site's settings.
              </>
            ),
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "An optional leading <svg>, the label, and an optional trailing <svg>.",
          },
        ]}
      />
      <p>
        <code>SidebarHeader</code>, <code>SidebarBody</code>, <code>SidebarFooter</code> and{" "}
        <code>SidebarDivider</code> take no props of their own. Every part passes other attributes through:{" "}
        <code>id</code>, <code>class</code>, <code>aria-*</code>, and event handlers, such as an item's{" "}
        <code>onClick</code>.
      </p>
      <pre tabindex="0">
        <code>{`import {
  Dropdown, DropdownButton, DropdownItem, DropdownMenu,
  Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarSection,
} from "beautiful-ui-solid";

<Sidebar aria-label="Main">
  <SidebarHeader>
    <Dropdown>
      <DropdownButton><LogoIcon /> Acme <ChevronDownIcon /></DropdownButton>
      <DropdownMenu>
        <DropdownItem>Northwind</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </SidebarHeader>
  <SidebarBody>
    <SidebarItem href="/" current={path() === "/"}><HomeIcon /> Home</SidebarItem>
    <SidebarItem href="/sites" current={path().startsWith("/sites")}><GlobeIcon /> Sites</SidebarItem>
    <SidebarSection heading="Recent sites">
      <For each={recent()}>{(site) => <SidebarItem href={site.url}>{site.name}</SidebarItem>}</For>
    </SidebarSection>
  </SidebarBody>
  <SidebarFooter>
    <SidebarItem href="/support"><HelpIcon /> Support</SidebarItem>
  </SidebarFooter>
</Sidebar>`}</code>
      </pre>
      <p>
        Solid Router follows a plain <code>&lt;a&gt;</code> on its own, so the app's routes decide which item is
        current, and the Sidebar needs no router of its own.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        APG has no sidebar pattern: it is a navigation landmark of links, and native links meet all of it. The arrow
        keys aren't taken. A roving focus would make the sidebar one Tab stop, but people expect Tab to reach every
        link, and APG keeps the arrows for menus and trees.
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
                Move through the items in order: the header, the body, then the footer. The moving focus ring glides
                from one to the next. A body that scrolls brings the focused item into view.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>Follows a link, or presses a button.</td>
            </tr>
            <tr>
              <td>
                <kbd>Space</kbd>
              </td>
              <td>Presses a button. On a link it scrolls the page, as on every link.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> on a Dropdown's button
              </td>
              <td>Opens its menu, with the menu's own keys. Escape closes it and puts focus back on the item.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read "Main, navigation" on entering it, a section's name ("Recent sites, group"), each item as a link
                or button with its words, and "current page" on the current one. Icons are hidden from them.
              </td>
            </tr>
            <tr>
              <td>Touch</td>
              <td>Each row is at least 44px tall where the pointer is a finger, through <code>--control-height</code>.</td>
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
              <td>Text in the text color, weight 500, and a muted icon. No fill.</td>
            </tr>
            <tr>
              <td>Hover</td>
              <td>An 8% tint of the text color in 120ms, and the icon takes the text color. Only with a hovering pointer.</td>
            </tr>
            <tr>
              <td>Pressed</td>
              <td>A 14% tint. Nothing scales, so the column stays still.</td>
            </tr>
            <tr>
              <td>Current</td>
              <td>
                The raised pane, with the icon in the accent. Hovering it changes nothing: it's where you are.
              </td>
            </tr>
            <tr>
              <td>Menu open</td>
              <td>A Dropdown's button stays tinted while its menu is open.</td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>The kit's 2px accent ring, 2px out, following the item's 8px corners. Keyboard focus only.</td>
            </tr>
            <tr>
              <td>Disabled button</td>
              <td>Faded to half, as a disabled Button is, with no hover. A link is never disabled.</td>
            </tr>
            <tr>
              <td>Long label</td>
              <td>Wraps onto a second line, and the row grows. The icon stays centered on it.</td>
            </tr>
            <tr>
              <td>Too many items</td>
              <td>The body scrolls inside itself. The header and footer don't move.</td>
            </tr>
            <tr>
              <td>Forced colors</td>
              <td>The fills drop out, and the current item keeps its edge in the text color.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> The Sidebar has no fill of its own: it sits on whatever its layout puts behind
        it. In classic the current pane is the raised white (or the raised gray in dark mode) with the control edge. In
        glass it is frosted, dense enough that its text keeps 4.5:1 over anything, with the rim, and its sheen and
        glint kept in the upper right corner at a fixed size (Button's, shared), so a wide column doesn't fill the pane with light. The accent deepens a step, as on every glass control.
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
            <tr><td><code>--control-height</code></td><td>a row's least height: 36px, or 44px for a finger</td></tr>
            <tr><td><code>--item-gap</code></td><td>new: 0.125rem (2px) between rows, so a lit row never touches the next</td></tr>
            <tr><td><code>--control-fill</code>, <code>--control-edge</code>, <code>--control-sheen</code>, <code>--control-blur</code>, <code>--control-shadow</code></td><td>the current pane, as a secondary Button's</td></tr>
            <tr><td><code>--control-rim</code>, <code>--control-hotspot</code></td><td>the current pane's rim on glass</td></tr>
            <tr><td><code>--color-accent</code></td><td>the current item's icon</td></tr>
            <tr><td><code>--hairline-width</code>, <code>--color-hairline</code>, <code>--hairline-lit</code></td><td>the lines under the header, over the footer, and of a divider, as a Divider's</td></tr>
            <tr><td><code>--radius-md</code></td><td>an item's corners, and its focus ring's</td></tr>
            <tr><td><code>--space-4</code>, <code>--space-6</code></td><td>the padding of each part, and the space above a section</td></tr>
            <tr><td><code>--motion-quick</code>, <code>--ease-out</code></td><td>the tint on hover</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;nav&gt;</code>, <code>aria-current</code> and the keys work everywhere. The menu-open tint uses{" "}
        <code>:has()</code> and <code>:popover-open</code>, in every current browser. Glass needs{" "}
        <code>backdrop-filter</code>, and falls back to classic's pane without it.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Sidebar for the parts (header, body, footer, section, heading, divider, item) and a Dropdown in the
        header and footer. Catalyst marks the current item with a bar at its edge; ours is a raised pane, which reads
        at a glance in a column of rows, and is glass in glass. The APG Landmarks guidance for one named{" "}
        <code>&lt;nav&gt;</code> per navigation, and <code>aria-current="page"</code> for the item you're on.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode at the top.</p>
      <Example title="An app's sidebar" name="sidebar/app" />
      <Example title="Sections" name="sidebar/sections" />
    </article>
  );
}
