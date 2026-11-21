import { Example, PropsTable } from "../spec.tsx";

export default function StackedLayoutPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Stacked layout</h1>
      <p class="lede">
        An app's page with its navigation across the top: a Navbar, and the page's content under it. For an app with
        a few places to go, where a sidebar would take room the content needs.
      </p>
      <Example title="Stacked layout" hero name="stacked-layout/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It fills the screen. The Navbar sits in the page's <code>&lt;header&gt;</code> at the top, and the content
          is the page's <code>&lt;main&gt;</code> under it.
        </li>
        <li>
          On a wide screen the content is a pane, drawn as a Card is: raised and edged in classic, and in glass one
          pane of frosted glass with the rim, catching the light from the upper right. The pane is inset 8px from the
          screen's sides and bottom, has 32px of padding, and centers its content at up to 72rem (1152px), so a line
          stays readable on a big screen.
        </li>
        <li>
          Glass needs something behind it to bend, so in glass the page glows from its corners, the same backdrop as
          Auth layout's. The two layouts share it as the theme's <code>--layout-backdrop</code>, and{" "}
          <code>--stacked-backdrop</code> sets this layout's own. Classic shows the plain canvas.
        </li>
        <li>
          Under 40rem (640px) of the layout's width, as on a phone, the pane drops its frame and the content sits on
          the page with 16px margins. The Navbar keeps what fits, such as the team switcher and the account, and hides
          each section marked <code>data-collapse</code>. A menu button at the start of the header opens the rest as
          a Sidebar, in a drawer that slides in from the left.
        </li>
        <li>
          The drawer is a modal <code>&lt;dialog&gt;</code> on Dialog's surface, the screen's height and 20rem wide,
          over Dialog's backdrop. Its close button is at the top. Escape, a click on the backdrop, or the close button
          closes it, and focus goes back to the menu button. The Solid component also closes it when a link in it is
          followed, and when the layout grows wide enough to show the whole Navbar.
        </li>
        <li>
          The first thing on the page is a "Skip to content" link, out of sight until it has focus, so a keyboard
          user can pass the Navbar in one step.
        </li>
        <li>
          It is CSS on native elements. The menu button opens the drawer with <code>commandfor</code>, so a page
          rendered on the server works with no JS. A layout without a drawer, for an app whose Navbar always fits,
          leaves the menu button and the dialog out.
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
              <td>
                <code>StackedLayout</code>
              </td>
              <td>
                <code>&lt;beautiful-stacked-layout&gt;</code>
              </td>
              <td>The whole screen, on its backdrop. No semantic element fits the screen itself.</td>
            </tr>
            <tr>
              <td>skip link</td>
              <td>
                <code>&lt;a data-skip href="#…"&gt;</code>
              </td>
              <td>"Skip to content", first in the page. Shown at the top left while it has focus.</td>
            </tr>
            <tr>
              <td>
                <code>navbar</code>
              </td>
              <td>
                <code>&lt;header&gt;</code>
              </td>
              <td>
                The page's banner. Holds the menu button, an Icon button, and the Navbar. A Navbar section with{" "}
                <code>data-collapse</code> hides on a narrow screen, as do the dividers beside it.
              </td>
            </tr>
            <tr>
              <td>
                <code>sidebar</code>
              </td>
              <td>
                <code>&lt;dialog data-drawer="start"&gt;</code>
              </td>
              <td>
                The drawer, a modal dialog named "Navigation", holding its close button and the Sidebar. Left out when
                the prop is, with the menu button.
              </td>
            </tr>
            <tr>
              <td>
                <code>children</code>
              </td>
              <td>
                <code>&lt;main&gt;</code>
              </td>
              <td>The page's content, and its main landmark. The skip link points at it.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "navbar", type: "JSX.Element", description: "The Navbar for the top of the page." },
          {
            name: "sidebar",
            type: "JSX.Element",
            default: "none",
            description:
              "The Sidebar the menu button opens on a narrow screen. Usually the Navbar's links, and anything more that fits a column. Left out, there is no menu button.",
          },
          { name: "children", type: "JSX.Element", description: "The page's content." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Navbar, NavbarItem, NavbarSection, NavbarSpacer, Sidebar, SidebarBody, SidebarItem, StackedLayout } from "beautiful-ui-solid";

<StackedLayout
  navbar={
    <Navbar aria-label="Main">
      <TeamDropdown />
      <NavbarSection data-collapse>
        <NavbarItem href="/" current>Home</NavbarItem>
        <NavbarItem href="/sites">Sites</NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <AccountDropdown />
    </Navbar>
  }
  sidebar={
    <Sidebar aria-label="Main">
      <SidebarBody>
        <SidebarItem href="/" current>Home</SidebarItem>
        <SidebarItem href="/sites">Sites</SidebarItem>
      </SidebarBody>
    </Sidebar>
  }
>
  <Heading>Sites</Heading>
  …
</StackedLayout>`}</code>
      </pre>
      <p>
        Other attributes pass through to <code>&lt;beautiful-stacked-layout&gt;</code>: <code>class</code>,{" "}
        <code>style</code>, <code>data-*</code>. The drawer's id and the content's id are the layout's{" "}
        <code>id</code> with <code>-drawer</code> and <code>-main</code> after it, or made unique when it has none.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        There is no APG pattern for a page layout. It follows APG's guidance on landmarks: everything sits in a
        landmark, with one <code>banner</code> and one <code>main</code>. The drawer follows APG's modal dialog
        pattern, as Dialog does.
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
                <kbd>Tab</kbd>
              </td>
              <td>
                First the skip link, then the menu button where it shows, the Navbar's items, and the content. The
                layout itself is never a stop.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd> on the skip link
              </td>
              <td>Moves to the content, so the next Tab is the content's first control.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd> or <kbd>Space</kbd> on the menu button
              </td>
              <td>
                Opens the drawer and focuses its close button, the first thing in it. The page behind is inert, and
                its scroll is held.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>Closes the drawer, and focus goes back to the menu button.</td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd> in the drawer
              </td>
              <td>Moves through the close button and the Sidebar's items, and stays in the drawer.</td>
            </tr>
            <tr>
              <td>Landmarks</td>
              <td>
                The header is the <code>banner</code> and holds the Navbar's <code>navigation</code>. The content is{" "}
                <code>main</code>. The drawer is a <code>dialog</code> named "Navigation", with the Sidebar's{" "}
                <code>navigation</code> in it. While closed it is hidden, so the page has one navigation landmark at a
                time.
              </td>
            </tr>
            <tr>
              <td>Names</td>
              <td>
                The menu button is "Open navigation" and the close button "Close navigation". Each is drawn as an Icon button, with no tip,
                so its name is its <code>aria-label</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Wide</strong> (40rem of the layout's width and up): the whole Navbar, and the content on a pane. No
          menu button.
        </li>
        <li>
          <strong>Narrow:</strong> the menu button, the Navbar without its collapsed sections, and the content on the
          page.
        </li>
        <li>
          <strong>Drawer open:</strong> the drawer slides in from the left over Dialog's backdrop, slower in than
          out. Under reduced motion it fades, with no slide.
        </li>
        <li>
          <strong>Mode:</strong> the pane, the drawer and the backdrop take the mode's surfaces and colors.
        </li>
        <li>
          <strong>Reduced transparency:</strong> glass falls back to classic's pane, drawer and plain canvas.
        </li>
      </ul>

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
            <tr>
              <td>
                <code>--layout-backdrop</code>
              </td>
              <td>
                What a layout's page shows behind its panes. Classic: the canvas. Glass: three soft glows. Auth
                layout's <code>--auth-backdrop</code> reads it.
              </td>
            </tr>
            <tr>
              <td>
                <code>--stacked-backdrop</code>
              </td>
              <td>This layout's backdrop, the theme's by default. Set it for a product's own color or a photo.</td>
            </tr>
            <tr>
              <td>
                <code>--stacked-width</code>
              </td>
              <td>The widest the content runs, 72rem.</td>
            </tr>
            <tr>
              <td>
                <code>--drawer-width</code>
              </td>
              <td>The drawer's width, 20rem, and never more than the screen less 4rem, so the page shows beside it.</td>
            </tr>
            <tr>
              <td>
                <code>--card-*</code>, <code>--shadow-card</code>
              </td>
              <td>The content's pane on a wide screen: Card's fill, edge, light and lift.</td>
            </tr>
            <tr>
              <td>
                <code>--surface-*</code>, <code>--ease-sheet</code>
              </td>
              <td>The drawer: Dialog's panel, with the easing of Alert's sheet.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        Container queries, <code>dvh</code> and <code>:has()</code> are in every current browser. The menu button
        opens the drawer with <code>commandfor</code>, in Chromium, Firefox and Safari since 2025; the Solid
        component opens it in older ones. A click on the backdrop closes it by <code>closedby="any"</code>, and the
        Solid component does it where that is missing. Glass needs <code>backdrop-filter</code>, and falls back to
        classic without it.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Stacked layout, for the Navbar at the top, the content on a raised pane on a wide screen, a
        drawer from the left holding the Sidebar on a narrow one, and closing it when a link is followed. Catalyst
        switches at 64rem; this switches at 40rem, as Alert does, because the kit's Navbar scrolls a row that doesn't
        fit rather than overflowing. The skip link and <code>data-collapse</code> are the kit's own: Catalyst leaves
        hiding the links to a utility class.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with the markup it renders for a static page. Each is a whole page, in
        a frame. Switch the theme and mode at the top, and narrow the window to see the phone layout.
      </p>
      <Example title="An app" name="stacked-layout/app" />
      <Example title="On a phone" name="stacked-layout/phone" />
      <Example title="No drawer" name="stacked-layout/no-drawer" />
    </article>
  );
}
