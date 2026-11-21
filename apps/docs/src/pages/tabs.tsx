import { Example, PropsTable } from "../spec.tsx";

export default function TabsPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Tabs</h1>
      <p class="lede">A row of tabs that each show their own panel in the same place, for moving between views of one thing.</p>
      <Example title="Tabs" hero name="tabs/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          A tab list over a set of panels, one panel for each tab. Selecting a tab shows its panel and hides the
          others. One tab is always selected.
        </li>
        <li>
          The markup is the APG tabs pattern's roles on the kit's own elements: <code>role="tablist"</code> on{" "}
          <code>&lt;beautiful-tab-list&gt;</code>, <code>role="tab"</code> on a <code>&lt;button&gt;</code>, and{" "}
          <code>role="tabpanel"</code> on <code>&lt;beautiful-tab-panel&gt;</code>, with no wrapper inside the list.
          The selected tab is marked <code>aria-selected="true"</code>, and the other panels are <code>hidden</code>.
        </li>
        <li>
          The selected tab has a line under it in the accent color, standing on a faint line under the whole row. When
          another tab is selected, the line glides over to it. CSS draws and moves the line, with anchor positioning,
          so it adds no element and no script.
        </li>
        <li>
          The Solid component adds what tabs need and the platform lacks: the arrow keys move between tabs, only the
          selected tab is in the <kbd>Tab</kbd> order, and selecting a tab shows its panel.
        </li>
        <li>
          Tabs sit in a row by default, and scroll sideways when they don't fit, as on a phone. A column of tabs stands
          beside its panels, for settings with many sections.
        </li>
        <li>
          A panel stays in the page while it is hidden, so a half-filled form in one tab keeps what was typed when you
          look at another.
        </li>
        <li>
          It isn't for going to another page: a row of links to pages is a <strong>Navbar</strong>, whose links say
          which page you're on. It isn't for picking a value or a filter either, such as a chart's range: that is a{" "}
          <strong>Toggle group</strong>.
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
              <td><code>Tabs</code></td>
              <td>
                <code>&lt;beautiful-tabs&gt;</code>
              </td>
              <td>
                Holds the selected tab, gives each tab and panel its ids, and lays out the list and the panels: a column,
                or side by side when the tabs stand in a column.
              </td>
            </tr>
            <tr>
              <td><code>TabList</code></td>
              <td>
                <code>&lt;beautiful-tab-list role="tablist"&gt;</code>
              </td>
              <td>The row of tabs, and the line under them. Name it with an <code>aria-label</code>.</td>
            </tr>
            <tr>
              <td><code>Tab</code></td>
              <td>
                <code>&lt;button role="tab"&gt;</code>
              </td>
              <td>One tab. Its children are its label, and an optional icon first.</td>
            </tr>
            <tr>
              <td><code>TabPanel</code></td>
              <td>
                <code>&lt;beautiful-tab-panel role="tabpanel"&gt;</code>
              </td>
              <td>One tab's content. Panels pair with tabs in order: the first panel is the first tab's.</td>
            </tr>
            <tr>
              <td>An icon</td>
              <td>
                an <code>&lt;svg&gt;</code>, first in the tab
              </td>
              <td>No component, as in Button. It takes the tab's color.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Tabs</h3>
      <PropsTable
        rows={[
          {
            name: "id",
            type: "string",
            default: "made up",
            description: (
              <>
                The start of each tab's and panel's id: a tab is <code>&lt;id&gt;-tab-&lt;index&gt;</code> and its panel{" "}
                <code>&lt;id&gt;-panel-&lt;index&gt;</code>, counting from 0, so static markup can write the same.
              </>
            ),
          },
          {
            name: "defaultIndex",
            type: "number",
            default: "0",
            description: "The tab selected at first, when the parent doesn't hold the selection. A disabled tab is passed over for the next one.",
          },
          {
            name: "selectedIndex",
            type: "number",
            default: "none",
            description: (
              <>
                The selected tab, held by the parent. Set it with <code>onChange</code>, as for a controlled input.
              </>
            ),
          },
          {
            name: "onChange",
            type: "(index: number) => void",
            default: "none",
            description: "Called when a tab is selected by a click or the keys.",
          },
          {
            name: "vertical",
            type: "boolean",
            default: "false",
            description: (
              <>
                Stands the tabs in a column beside the panels, with the line at their end. Written as{" "}
                <code>aria-orientation="vertical"</code> on the list, and the keys become <kbd>↓</kbd> and <kbd>↑</kbd>.
              </>
            ),
          },
          {
            name: "manual",
            type: "boolean",
            default: "false",
            description: (
              <>
                The arrow keys only move focus, and <kbd>Enter</kbd> or <kbd>Space</kbd> selects. For panels that take a
                moment to show, such as ones that load data. Written as <code>data-activation="manual"</code>.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The tab list, then the panels." },
        ]}
      />
      <h3>Tab</h3>
      <PropsTable
        rows={[
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Fades the tab. The keys and the pointer pass over it, and its panel can't be shown.",
          },
          { name: "children", type: "JSX.Element", description: "The label, and an optional icon first." },
        ]}
      />
      <p>
        <code>TabList</code> and <code>TabPanel</code> take their content as children. Other attributes pass through to
        each element, such as the list's <code>aria-label</code>.
      </p>
      <pre tabindex="0">
        <code>{`import { Tab, TabList, TabPanel, Tabs } from "beautiful-ui-solid";

<Tabs>
  <TabList aria-label="Site settings">
    <Tab>General</Tab>
    <Tab>Domains</Tab>
    <Tab>Forms</Tab>
  </TabList>
  <TabPanel>…</TabPanel>
  <TabPanel>…</TabPanel>
  <TabPanel>…</TabPanel>
</Tabs>`}</code>
      </pre>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/">APG tabs pattern</a>, with Headless UI's Tabs
        for disabled tabs and manual selection.
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
                <kbd>Tab</kbd> into the list
              </td>
              <td>Focuses the selected tab. The other tabs are out of the <kbd>Tab</kbd> order.</td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd> from a tab
              </td>
              <td>
                Goes to the selected panel. A panel is focusable, so a screen reader user lands in its content even when
                it starts with text.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd>, <kbd>←</kbd>
              </td>
              <td>
                Moves to the next or previous tab and selects it, wrapping from the last to the first and back, and
                passing over disabled tabs. In a right-to-left page, <kbd>←</kbd> is the next tab. In a column, it's{" "}
                <kbd>↓</kbd> and <kbd>↑</kbd>.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd>, <kbd>End</kbd>
              </td>
              <td>Moves to the first or last tab and selects it.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>, or a click
              </td>
              <td>
                Selects the tab. With <code>manual</code>, this is the only way to select: the arrows move focus alone,
                and leave the selection where it was.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce the list by its label, then each tab as a tab with its place and whether it's selected, such as
                "Domains, tab, 2 of 4". A panel is named by its tab. A disabled tab is read as unavailable.
              </td>
            </tr>
            <tr>
              <td>No JS</td>
              <td>
                The tabs and the selected panel show, but the other tabs can't be selected. A static page wires its tabs
                with the kit's <code>wireTabs(tabs)</code>, which adds the keys and the selection.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Selected:</strong> the label in the text color, and the accent line under it, 2px tall with rounded
          ends. In a column, the line runs down the tab's end edge, between the tabs and the panel.
        </li>
        <li>
          <strong>Not selected:</strong> the label in the muted color. In a glass dialog, that's the surface's stronger
          muted shade, as with other muted text.
        </li>
        <li>
          <strong>Changing tabs:</strong> the line glides from the old tab to the new one over 240ms, speeding up then
          settling, and its width changes to the new label's on the way. The panel swaps at once, with no fade, so
          what you asked for is there the moment you ask. Under reduced motion, the line jumps.
        </li>
        <li>
          <strong>Hover:</strong> where there is a hovering pointer, another tab's label takes the text color, and a
          fainter line shows under it, square to the tab's edge like the selected line.
        </li>
        <li>
          <strong>Focus:</strong> the kit's focus ring around the tab, rounded at <code>--radius-sm</code>. It glides
          between tabs with the arrow keys, as between any controls. A focused panel takes the same ring.
        </li>
        <li>
          <strong>Disabled:</strong> faded to half, as a disabled Button is, and never selected.
        </li>
        <li>
          <strong>Size:</strong> a tab is as tall as a Button, 2.25rem, with 14px text at weight 500, and the same weight
          selected or not, so the row never shifts. Tabs in a row are 1rem apart, and the panel starts 1rem below. On
          touch screens, tabs grow to 2.75rem with 16px text, as Button does.
        </li>
        <li>
          <strong>Too many to fit:</strong> the row scrolls sideways, with no scrollbar showing, and the faint line runs
          its whole length. The arrow keys scroll the focused tab into view.
        </li>
        <li>
          <strong>Themes:</strong> the same in both, with no glow on glass. The faint line is a tint of the text color,
          so it shows over whatever is behind.
        </li>
        <li>
          <strong>Forced colors:</strong> the line and the selected label take the system's highlight color.
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
              <td><code>--motion-slide</code></td>
              <td>
                240ms, and 0 under reduced motion. New: for a line that glides from one item to another, here and in
                Navbar.
              </td>
            </tr>
            <tr>
              <td><code>--tab-line</code></td>
              <td>The selected line's thickness, 2px, set on <code>&lt;beautiful-tabs&gt;</code>.</td>
            </tr>
            <tr>
              <td>
                <code>--tab-track</code>, <code>--tab-hover-line</code>
              </td>
              <td>The faint line under the row, 12% of the text color, and a hovered tab's line, 24%.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <ul>
        <li>The roles and keys work in every current browser.</li>
        <li>
          The gliding line uses anchor positioning, in Chrome 125, Safari 26 and Firefox 147. Without it, the selected
          tab draws its own line, and it moves at once. The glide was tested only in Chromium.
        </li>
      </ul>

      <h2>Left out</h2>
      <ul>
        <li>
          <strong>Tabs that work with no JS.</strong> <code>&lt;details name&gt;</code> can be drawn as tabs, but a
          screen reader hears a stack of disclosures, and the open one can be closed, leaving no panel. A static page
          adds <code>wireTabs</code> instead.
        </li>
        <li>
          <strong>Closing or reordering tabs</strong>, as in a browser's tab strip. APG's <kbd>Delete</kbd> to close is
          optional, and nothing of ours needs it yet.
        </li>
        <li>
          <strong>A pill or segmented look.</strong> A boxed row of options is Toggle group. Tabs keep one look so they
          read as tabs in every app.
        </li>
        <li>
          <strong>Fading or sliding the panels.</strong> A panel that animates in holds up the content you asked for.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Headless UI's Tabs for the parts, the props (<code>defaultIndex</code>, <code>selectedIndex</code>,{" "}
        <code>onChange</code>, <code>vertical</code>, <code>manual</code>), and passing over disabled tabs. Open Props
        UI's Tabs for the underline look. APG's tabs pattern for the keys and roles.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with the markup it renders for a static page. Switch the theme and mode
        with T and M, or the toggles at the bottom right.
      </p>
      <Example title="Glass, in a dialog over bright content" name="tabs/glass" />
      <Example title="Site settings" name="tabs/settings" />
      <Example title="Icons, and a disabled tab" name="tabs/icons" />
      <Example title="A column of tabs" name="tabs/vertical" />
      <Example title="More tabs than fit, selected with Enter" name="tabs/scrolling" />
    </article>
  );
}
