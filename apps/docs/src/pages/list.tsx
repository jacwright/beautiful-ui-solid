import { Example, PropsTable } from "../spec.tsx";

export default function ListPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>List</h1>
      <p class="lede">
        A native <code>&lt;ul&gt;</code> or <code>&lt;ol&gt;</code>, in two looks: bullets for prose, and rows for a
        list of things.
      </p>
      <Example title="List" hero name="list/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          <strong>Bullets</strong> are for prose: what a plan includes, the steps to move a site. Every{" "}
          <code>&lt;ul&gt;</code> and <code>&lt;ol&gt;</code> gets this look with no attribute, so a static page
          and a page rendered from Markdown get it with no JS, as every <code>&lt;p&gt;</code> gets Text's. The dots and
          numbers are muted, hang outside the text, and take the size of the text around them. A list inside a list
          takes rings.
        </li>
        <li>
          <code>marker="check"</code> draws a check in the accent color in place of each dot, for what a plan or a
          feature includes. Only on a <code>&lt;ul&gt;</code>: an <code>&lt;ol&gt;</code> keeps its numbers.
        </li>
        <li>
          <strong>Rows</strong> (<code>variant="rows"</code>) are for a list of things: sites, pages, people,
          settings. Each row has an optional icon, Avatar or image at its start, a title with an optional description
          under it, and an optional end: a status, a time, or a Button. A hairline divides the rows. Rows are
          14px, the size of app UI, and set no outer margin, as Text doesn't.
        </li>
        <li>
          A row can be one target: a link (<code>href</code>) to the thing's page, or a button that opens it in
          place. The whole row is then clickable, lit with the same quiet tint as a Dropdown's item on hover, and
          takes the focus ring. The tint reaches a little past the text on each side, so the words of every row
          line up whether it's a target or not.
        </li>
        <li>
          A row that isn't a target can hold its own controls: a Button at its end, such as Remove. A row never holds
          a target inside a target.
        </li>
        <li>
          It is still a list. There is no arrow-key movement, no selection and no roving focus: Tab moves through
          the links and buttons in it like any others. Picking one row from many is Listbox, and a menu of actions
          is Dropdown.
        </li>
      </ul>
      <p>
        A list of terms with their meanings is Description list, a grid of things with columns is Table, and a
        site's own menu is Navbar or Sidebar. Each gets its own spec.
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
              <td><code>List</code></td>
              <td>
                <code>&lt;ul&gt;</code>, or <code>&lt;ol&gt;</code> with <code>ordered</code>
              </td>
              <td>
                The list. <code>data-variant</code> and <code>data-marker</code> carry the props, and are left out
                when the props are. Rows and checks also say <code>role="list"</code>: Safari drops a list's role
                when its markers are hidden, and screen readers then stop saying "list, 3 items".
              </td>
            </tr>
            <tr>
              <td><code>ListItem</code></td>
              <td><code>&lt;li&gt;</code></td>
              <td>
                One item. In bullets, only its children. In rows, its parts in this order, each left out when it
                isn't given.
              </td>
            </tr>
            <tr>
              <td>Start</td>
              <td>
                <code>&lt;svg&gt;</code>, Avatar, <code>&lt;img&gt;</code> or <code>&lt;input&gt;</code>, first
              </td>
              <td>
                An icon, 16px in the muted color. An Avatar, for a person, at its lg size. An image, 40px with
                rounded corners: a site's thumbnail. A checkbox or radio, once Checkbox and Radio are.
              </td>
            </tr>
            <tr>
              <td>Body</td>
              <td>
                <code>&lt;beautiful-list-body&gt;</code>
              </td>
              <td>
                After the start. Its text is the title, at weight 500. It takes the row's spare
                width, and a long word breaks rather than pushing the end off the row.
              </td>
            </tr>
            <tr>
              <td>Description</td>
              <td>
                <code>&lt;small&gt;</code> in the body
              </td>
              <td>A line under the title in the muted color, read with it.</td>
            </tr>
            <tr>
              <td>End</td>
              <td>
                anything after the body: <code>&lt;beautiful-list-end&gt;</code> for text
              </td>
              <td>
                A status or a time, muted and on one line, an icon such as a chevron, or a Button, which keeps its
                own look. The kit's markup has no <code>&lt;div&gt;</code> or <code>&lt;span&gt;</code>: a part with
                no native element is a <code>beautiful-*</code> one.
              </td>
            </tr>
            <tr>
              <td>Target</td>
              <td>
                <code>&lt;a href&gt;</code> or <code>&lt;button&gt;</code>, the <code>&lt;li&gt;</code>'s only child
              </td>
              <td>
                Holds the row's parts and makes it one control. A <code>&lt;label&gt;</code> around a checkbox does
                the same, once Checkbox is built.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>List</h3>
      <PropsTable
        rows={[
          {
            name: "variant",
            type: '"bullets" | "rows"',
            default: '"bullets"',
            description: "Bullets for prose, rows for a list of things.",
          },
          {
            name: "ordered",
            type: "boolean",
            default: "false",
            description: (
              <>
                Renders an <code>&lt;ol&gt;</code>, for steps or a ranking where the order means something. In
                bullets it shows numbers. Rows look the same either way, and screen readers say the order.
              </>
            ),
          },
          {
            name: "marker",
            type: '"check"',
            default: "none",
            description: "Checks in place of dots. Bullets only, and only unordered: the types don't allow it with rows or ordered.",
          },
          { name: "children", type: "JSX.Element", description: <>The <code>ListItem</code>s.</> },
        ]}
      />
      <h3>ListItem</h3>
      <PropsTable
        rows={[
          { name: "children", type: "JSX.Element", description: "The item's text. In rows, the title." },
          {
            name: "description",
            type: "JSX.Element",
            default: "none",
            description: "Rows: the line under the title.",
          },
          {
            name: "start",
            type: "JSX.Element",
            default: "none",
            description: (
              <>
                Rows: an <code>&lt;svg&gt;</code> icon, an Avatar or an <code>&lt;img&gt;</code> at the row's
                start. Give the icon <code>aria-hidden="true"</code>, the Avatar <code>decorative</code>, and an image{" "}
                <code>alt=""</code> when the title already names it.
              </>
            ),
          },
          {
            name: "end",
            type: "JSX.Element",
            default: "none",
            description: "Rows: a status, a time, an icon or a Button at the row's end.",
          },
          {
            name: "href",
            type: "string",
            default: "none",
            description: (
              <>
                Rows: makes the whole row a link. The other link attributes, such as <code>target</code>, go on
                the <code>&lt;a&gt;</code>.
              </>
            ),
          },
          {
            name: "onClick",
            type: "(event: MouseEvent) => void",
            default: "none",
            description: (
              <>
                Rows, without <code>href</code>: makes the whole row a <code>&lt;button&gt;</code>, as does{" "}
                <code>commandfor</code> with <code>command</code>. <code>disabled</code> fades it, as it does a
                Button. The types don't allow a row to be both a link and a button. Don't give a target row an
                end Button: a button can't sit inside a link or another button.
              </>
            ),
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { List, ListItem } from "beautiful-ui-solid";

<List marker="check">
  <ListItem>Unlimited pages, previews and forms</ListItem>
  <ListItem>A database for each site</ListItem>
</List>

<List variant="rows">
  <ListItem href="/sites/spring-launch" start={<GlobeIcon />} description="springlaunch.com" end="Live">
    Spring launch
  </ListItem>
</List>`}</code>
      </pre>
      <p>
        Other attributes pass through: to the target in a target row, and to the <code>&lt;li&gt;</code> or the
        list otherwise. An <code>aria-label</code> names a list when nothing above it does, and a list of links
        that is a site's navigation goes inside a <code>&lt;nav&gt;</code>.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        There is no APG pattern for a list: it is document structure, not a widget, and the browser's semantics do
        it all.
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
                Passes over the list itself and every row that isn't a target. Stops on each target row and on each
                Button at a row's end, in order, and the focus ring glides to it.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>Follows a link row. Presses a button row.</td>
            </tr>
            <tr>
              <td>
                <kbd>Space</kbd>
              </td>
              <td>Presses a button row. On a link row it scrolls the page, as on any link.</td>
            </tr>
            <tr>
              <td>Arrow keys</td>
              <td>Scroll the page. A list doesn't move focus between its rows.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Say "list, 3 items" on the way in, and each item's place in it. A target row is read as one link or
                button, named by its title, description and end, in that order. A start icon is hidden from them.
                Most let people jump from list to list with their own keys.
              </td>
            </tr>
            <tr>
              <td>Zoom and text size</td>
              <td>
                The sizes are in rem and the indent in em, so they follow the browser's text size. A row reflows at
                400% zoom: the title and description wrap, and the end keeps its place.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Hover</strong>, on a target row where the pointer can hover: the quiet tint, 9% of the text color,
          the same as a lit Dropdown item. Under a finger, the tint shows while the row is pressed.
        </li>
        <li>
          <strong>Focus:</strong> the kit's 2px accent ring around the target, following its rounded corners. No
          tint, so a row that is focused and one that is hovered never look the same.
        </li>
        <li>
          <strong>Disabled</strong>, a button row: half opacity, no tint, and skipped by Tab, as a disabled Button
          is. A link row can't be disabled: leave the <code>href</code> out and it is a plain row.
        </li>
        <li>
          <strong>Mode:</strong> the text and muted colors are light and dark pairs, and the line between rows is a
          Divider's hairline, mixed from the text color, so the list follows the mode with no rules of its own.
        </li>
        <li>
          <strong>Theme:</strong> a list draws no surface. On glass the line between rows is a Divider's groove, with
          a lit edge under it, and in dark mode the groove is a shadow. In a glass Dialog, muted text takes the
          surface's stronger shade, and the tint is mixed from the text color, so it reads over whatever shows
          through.
        </li>
        <li>
          <strong>Long text:</strong> in bullets it wraps under itself, never under the dot. In rows the title and
          description wrap, and the end stays on one line.
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
            <tr><td><code>--list-indent</code></td><td>1.5em, new: where the text starts after a dot or number. In em, so it grows with the text.</td></tr>
            <tr><td><code>--list-image</code></td><td>2.5rem, new: a start image's width and height</td></tr>
            <tr><td><code>--hairline-width</code>, <code>--color-hairline</code>, <code>--hairline-lit</code></td><td>the line between rows, as a Divider's: 10% of the text color, a groove with a lit edge on glass</td></tr>
            <tr><td><code>--space-1</code></td><td>between bullets, and a target row's inset from the lines</td></tr>
            <tr><td><code>--space-3</code></td><td>a row's padding, the gap between its parts, and how far a target's tint reaches past the text</td></tr>
            <tr><td><code>--text-sm</code>, <code>--leading-sm</code></td><td>a row's size</td></tr>
            <tr><td><code>--control-icon</code></td><td>an icon's size: 16px, 20px under a finger</td></tr>
            <tr><td><code>--radius-md</code></td><td>a target's corners, and a start image's</td></tr>
            <tr><td><code>--color-text-muted</code>, <code>--color-accent</code></td><td>markers, descriptions and ends; the check</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;ul&gt;</code>, <code>&lt;ol&gt;</code> and <code>::marker</code> work everywhere. The CSS uses{" "}
        <code>:where()</code>, <code>:has()</code>, <code>color-mix()</code>,
        a CSS mask and the <code>lh</code> unit, in every current browser.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's List and ListItem for a row with a start, a headline and description, and an end; a whole
        row that is one link, button or label; and borders between rows. Its filled and tonal backgrounds are left
        out, since a Card or a Dialog holds a list here, and so are its dense and inset variants, until a screen
        needs them. Catalyst has no list, and its tables and description lists are their own components here.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid components live, then their code, then the markup they render. Switch the theme and
        mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="Bullets and numbers" name="list/bullets" />
      <Example title="Checks" name="list/checks" />
      <Example title="Rows" name="list/rows" />
      <Example title="Rows that are links" name="list/links" />
      <Example title="Rows with a Button at the end" name="list/people" />
      <Example title="In a dialog" name="list/dialog" />
    </article>
  );
}
