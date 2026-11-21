import { Example, PropsTable } from "../spec.tsx";

export default function SidebarLayoutPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Sidebar layout</h1>
      <p class="lede">
        An app's page with its navigation down the left: a Sidebar, and the page's content beside it. For an app
        with more places to go than fit across a Navbar, or sections with headings, such as recent sites.
      </p>
      <Example title="Sidebar layout" hero name="sidebar-layout/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          On a wide screen the Sidebar runs down the left, 16rem (256px) wide, on the page itself. Its header and
          footer stay put and its body scrolls, as Sidebar's do, and it stays where it is while the content scrolls.
        </li>
        <li>
          The content is the page's <code>&lt;main&gt;</code>, a pane beside the Sidebar drawn as Stacked layout's
          is, and as a Card is: raised and edged in classic, and in glass one pane of frosted glass with the rim,
          catching the light from the upper right. The pane is inset 8px from the screen's top, right and bottom, has
          32px of padding, and centers its content at up to 72rem (1152px).
        </li>
        <li>
          In glass the page glows from its corners, the theme's <code>--layout-backdrop</code>, shared with Auth and
          Stacked layouts. <code>--sidebar-layout-backdrop</code> sets this layout's own. Classic shows the plain
          canvas.
        </li>
        <li>
          Under 40rem (640px) of the layout's width, as on a phone, the Sidebar hides and a header appears across the
          top. It holds a menu button at the start and, optionally, a Navbar, such as the account. The content drops
          its frame and sits on the page with 16px margins. This is Stacked layout's breakpoint and narrow look, so
          the two layouts are one app on a phone.
        </li>
        <li>
          The menu button opens the Sidebar in a Drawer from the left: a modal <code>&lt;dialog&gt;</code> on
          Dialog's surface, the screen's height and 20rem wide, leaving 3rem of backdrop beside it to tap. As every
          Drawer, it has no close button: Escape or a tap on the backdrop closes it, and focus goes back to the menu
          button. The Solid component also closes it when a link in it is followed, and when the layout grows wide
          enough to show the Sidebar.
        </li>
        <li>
          The Sidebar is in the page twice, once beside the content and once in the drawer, as Catalyst's is. One is
          always hidden, so there is one Sidebar landmark at a time. The Solid component renders both from the one{" "}
          <code>sidebar</code> prop.
        </li>
        <li>
          The first thing on the page is a "Skip to content" link, out of sight until it has focus, so a keyboard
          user can pass the Sidebar in one step.
        </li>
        <li>
          It is CSS on native elements. The menu button opens the drawer with <code>commandfor</code>, so a page
          rendered on the server works with no JS.
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
                <code>SidebarLayout</code>
              </td>
              <td>
                <code>&lt;beautiful-sidebar-layout&gt;</code>
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
                <code>sidebar</code>
              </td>
              <td>
                <code>&lt;nav data-sidebar&gt;</code>
              </td>
              <td>The Sidebar down the left, on a wide screen. Hidden on a narrow one.</td>
            </tr>
            <tr>
              <td>
                <code>navbar</code>
              </td>
              <td>
                <code>&lt;header&gt;</code>
              </td>
              <td>
                The page's banner, on a narrow screen only. Holds the menu button, an Icon button, and the Navbar
                when there is one.
              </td>
            </tr>
            <tr>
              <td>drawer</td>
              <td>
                <code>&lt;dialog data-drawer="start"&gt;</code>
              </td>
              <td>A small Drawer from the start edge, named "Navigation", holding the Sidebar again.</td>
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
          {
            name: "sidebar",
            type: "JSX.Element | (copy) => JSX.Element",
            description:
              "The Sidebar: down the left on a wide screen, in the drawer on a narrow one. It is built twice, so write it inline. Ids in it must differ between the copies: leave them to the kit's components, as Dropdown makes its own, or pass a function, called with \"page\" or \"drawer\".",
          },
          {
            name: "navbar",
            type: "JSX.Element",
            default: "none",
            description: "A Navbar for the header on a narrow screen, after the menu button. Usually the account.",
          },
          { name: "children", type: "JSX.Element", description: "The page's content." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Navbar, NavbarSpacer, Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLayout } from "beautiful-ui-solid";

<SidebarLayout
  sidebar={
    <Sidebar aria-label="Main">
      <SidebarHeader><TeamDropdown /></SidebarHeader>
      <SidebarBody>
        <SidebarItem href="/" current>Home</SidebarItem>
        <SidebarItem href="/sites">Sites</SidebarItem>
      </SidebarBody>
      <SidebarFooter><AccountDropdown /></SidebarFooter>
    </Sidebar>
  }
  navbar={
    <Navbar aria-label="Account">
      <NavbarSpacer />
      <AccountDropdown />
    </Navbar>
  }
>
  <Heading>Sites</Heading>
  …
</SidebarLayout>`}</code>
      </pre>
      <p>
        Other attributes pass through to <code>&lt;beautiful-sidebar-layout&gt;</code>: <code>class</code>,{" "}
        <code>style</code>, <code>data-*</code>. The drawer's id and the content's id are the layout's{" "}
        <code>id</code> with <code>-drawer</code> and <code>-main</code> after it, or made unique when it has none.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        There is no APG pattern for a page layout. It follows APG's guidance on landmarks: everything sits in a
        landmark, with one <code>main</code>. The drawer follows APG's modal dialog pattern, as Drawer does.
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
                First the skip link. Then, wide, the Sidebar's items and the content. Narrow, the menu button, the
                Navbar's items and the content. The layout itself is never a stop.
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
                Opens the drawer. The Solid component focuses the drawer itself, as Dialog does, and the next Tab is
                the Sidebar's first item; static markup focuses that item at once. The page behind is inert, and its
                scroll is held.
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
              <td>Moves through the Sidebar's items, and stays in the drawer.</td>
            </tr>
            <tr>
              <td>Landmarks</td>
              <td>
                Wide: the Sidebar's <code>navigation</code> and <code>main</code>, with no <code>banner</code>, since
                the header is hidden. Narrow: the header is the <code>banner</code>, with the Navbar's{" "}
                <code>navigation</code> in it, and <code>main</code>. The drawer is a <code>dialog</code> named
                "Navigation" with the Sidebar's <code>navigation</code> in it, and is hidden while closed.
              </td>
            </tr>
            <tr>
              <td>Names</td>
              <td>
                The menu button is "Open navigation", an Icon button named by its <code>aria-label</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Wide</strong> (40rem of the layout's width and up): the Sidebar down the left and the content on a
          pane. No header.
        </li>
        <li>
          <strong>Narrow:</strong> the header with the menu button and the Navbar, and the content on the page.
        </li>
        <li>
          <strong>Drawer open:</strong> the drawer slides in from the left over Dialog's backdrop, slower in than
          out. Under reduced motion it fades, with no slide.
        </li>
        <li>
          <strong>Long content:</strong> the page scrolls, and the Sidebar stays put beside it.
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
                <code>--sidebar-width</code>
              </td>
              <td>The Sidebar's column on a wide screen, 16rem.</td>
            </tr>
            <tr>
              <td>
                <code>--sidebar-layout-width</code>
              </td>
              <td>The widest the content runs, 72rem, as Stacked layout's.</td>
            </tr>
            <tr>
              <td>
                <code>--sidebar-layout-height</code>
              </td>
              <td>
                The screen's height, <code>100dvh</code>: the Sidebar's height and the content's least. Set it when the
                layout sits in a frame, as these examples do.
              </td>
            </tr>
            <tr>
              <td>
                <code>--sidebar-layout-backdrop</code>
              </td>
              <td>This layout's backdrop, the theme's <code>--layout-backdrop</code> by default.</td>
            </tr>
            <tr>
              <td>
                <code>--card-*</code>, <code>--shadow-card</code>
              </td>
              <td>The content's pane on a wide screen: Card's fill, edge, light and lift.</td>
            </tr>
            <tr>
              <td>
                <code>--drawer-*</code>, <code>--surface-*</code>
              </td>
              <td>The drawer: Drawer's small size from the start edge, on Dialog's panel.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        Container queries, <code>dvh</code>, <code>position: sticky</code> and <code>:has()</code> are in every
        current browser. The menu button opens the drawer with <code>commandfor</code>, in Chromium, Firefox and
        Safari since 2025; the Solid component opens it in older ones. A tap on the backdrop closes it by{" "}
        <code>closedby="any"</code>, and Dialog does it where that is missing. Glass needs{" "}
        <code>backdrop-filter</code>, and falls back to classic without it.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Sidebar layout, for the Sidebar on the page and the content on a raised pane beside it, a header
        with a menu button and a Navbar on a narrow screen, the Sidebar rendered a second time in a drawer from the
        left, and closing it when a link is followed. Catalyst switches at 64rem; this switches at 40rem, as Stacked
        layout does, so a phone and a small tablet in portrait get the drawer and anything wider gets the Sidebar.
        Catalyst's drawer has a close button; this one is a Drawer, which has none. The skip link is the kit's own.
      </p>

      <h2>Examples</h2>
      <p>
        Each example is the Solid component, with its code and the markup it renders. Each is a whole page, in a frame that scrolls as
        the screen would. Switch the theme and mode at the top, and narrow the window to see the phone layout.
      </p>
      <Example title="An app" name="sidebar-layout/app" />
      <Example title="On a phone" name="sidebar-layout/phone" />
      <Example title="A short sidebar, no Navbar" name="sidebar-layout/short" />
    </article>
  );
}
