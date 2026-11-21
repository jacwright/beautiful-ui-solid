import { Example, PropsTable } from "../spec.tsx";

export default function TablePage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Table</h1>
      <p class="lede">Rows of data with a header for each column: sites, deploys, top pages, plans side by side.</p>
      <Example title="Table" hero name="table/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;table&gt;</code>, so screen readers read each cell with its column's header, and
          their table keys move cell by cell. It isn't a grid: arrow keys don't move between cells, and Tab stops only
          on the links and buttons inside it.
        </li>
        <li>
          The table sits on a pane, <code>&lt;beautiful-table&gt;</code>. Classic draws it as a raised card with a
          hairline edge. Glass frosts it as densely as a Popover, so its rows keep 4.5:1 over a bright page, and the
          page's color still shows through. In a Dialog, a Popover or a Card it draws no pane, because that surface already
          holds the rows, and its first and last columns line up with the text around them.
        </li>
        <li>
          A wide table scrolls sideways inside its pane, so it never widens the page on a phone. The header keeps to
          one line, and a body cell wraps.
        </li>
        <li>
          Rows are 44px tall, with 14px text. <strong>Dense</strong> rows are 32px, the height of a menu's item, for
          a screen of many rows such as an analytics app's top pages. On a touch screen a dense row grows to 44px, a finger's
          height.
        </li>
        <li>
          Lines run between rows, in the text's own color at low strength, so they read on any pane, theme and mode.
          The line under the header is stronger. <strong>Striped</strong> tints every other row, for following a long
          row across. <strong>Grid</strong> adds lines between columns, for comparing plans side by side.
        </li>
        <li>
          Numbers use figures of one width, so a column's digits line up. <code>align="end"</code> sets a column of
          numbers on its right edge, header included.
        </li>
        <li>
          <strong>A row can be a link.</strong> Give the row an <code>href</code>: its first cell becomes a real link,
          the row lights under the pointer, and a click anywhere in it follows the link. A Cmd or Ctrl click and a
          middle click open a new tab, as on any link. A click on another link or button in the row is that
          control's.
        </li>
        <li>
          <strong>A column can be sorted.</strong> Its header holds a button with an arrow. The column the rows are
          sorted by shows its arrow, up or down, in the text color, and its header carries <code>aria-sort</code>. The
          other sortable columns show a faint arrow. The table doesn't sort the rows itself: it says which column was
          picked, and the app sorts its data, as it fetches it.
        </li>
        <li>
          An empty table keeps its header, and one cell across every column says why it's empty and what fills it.
        </li>
        <li>
          The CSS styles every <code>&lt;table&gt;</code>, so a static page, or a table written in Markdown, gets the
          rows with no JS. Every rule is in <code>:where()</code>, so its specificity is 0. A DatePicker's calendar is
          a grid of days, not a table of data, so none of it reaches the calendar.
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
                <code>Table</code>
              </td>
              <td>
                <code>&lt;beautiful-table&gt;</code> around <code>&lt;table&gt;</code>
              </td>
              <td>
                The pane, and the table. <code>data-dense</code>, <code>data-striped</code>, <code>data-grid</code>{" "}
                and <code>data-plain</code> on the pane carry the props. Other attributes go to the{" "}
                <code>&lt;table&gt;</code>.
              </td>
            </tr>
            <tr>
              <td>
                <code>TableHead</code>, <code>TableBody</code>
              </td>
              <td>
                <code>&lt;thead&gt;</code>, <code>&lt;tbody&gt;</code>
              </td>
              <td>The header row, and the rows of data.</td>
            </tr>
            <tr>
              <td>
                <code>TableRow</code>
              </td>
              <td>
                <code>&lt;tr&gt;</code>
              </td>
              <td>
                A row. With <code>href</code>, its first cell's content is an{" "}
                <code>&lt;a data-row-link&gt;</code>.
              </td>
            </tr>
            <tr>
              <td>
                <code>TableHeader</code>
              </td>
              <td>
                <code>&lt;th scope="col"&gt;</code> in the head, <code>&lt;th scope="row"&gt;</code> in the body
              </td>
              <td>
                A column's header, or a row's. With <code>sort</code>, its content is a <code>&lt;button data-sort&gt;</code>,
                and the column it's sorted by has <code>aria-sort</code>.
              </td>
            </tr>
            <tr>
              <td>
                <code>TableCell</code>
              </td>
              <td>
                <code>&lt;td&gt;</code>
              </td>
              <td>
                A cell. <code>data-align="end"</code> carries <code>align</code>. An empty table's one cell has{" "}
                <code>data-empty</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Table</h3>
      <PropsTable
        rows={[
          { name: "dense", type: "boolean", default: "false", description: "32px rows, 44px on a touch screen." },
          { name: "striped", type: "boolean", default: "false", description: "Tints every other row in the body." },
          { name: "grid", type: "boolean", default: "false", description: "Lines between the columns as well as the rows." },
          {
            name: "plain",
            type: "boolean",
            default: "false",
            description: (
              <>
                No pane: the rows sit on what holds the table, and line up with the text around it. For a table on a
                card or a panel of the app's own. A table in a Dialog, a Popover or a Card is plain already. On glass, use it
                only on a surface: bare rows over a bright page lose their contrast.
              </>
            ),
          },
          {
            name: "caption",
            type: "JSX.Element",
            default: "none",
            description: (
              <>
                A visible title above the rows, in a <code>&lt;caption&gt;</code>, which names the table too. Without
                it, name the table with <code>aria-label</code>, or with <code>aria-labelledby</code> pointing at the
                heading above it.
              </>
            ),
          },
          {
            name: "children",
            type: "JSX.Element",
            description: (
              <>
                <code>TableHead</code> and <code>TableBody</code>.
              </>
            ),
          },
        ]}
      />
      <h3>TableRow</h3>
      <PropsTable
        rows={[
          {
            name: "href",
            type: "string",
            default: "none",
            description: "Makes the row a link: the first cell's content links to it, and a click anywhere in the row follows it.",
          },
          {
            name: "target",
            type: "string",
            default: "none",
            description: (
              <>
                The link's <code>target</code>, such as <code>_blank</code>.
              </>
            ),
          },
        ]}
      />
      <h3>TableHeader</h3>
      <PropsTable
        rows={[
          {
            name: "align",
            type: '"start" | "end"',
            default: '"start"',
            description: "end sets a column of numbers on its right edge. Set it on the column's cells too.",
          },
          {
            name: "sort",
            type: '"ascending" | "descending" | "none"',
            default: "none",
            description: (
              <>
                Makes the column sortable, and says whether the rows are sorted by it. <code>"none"</code> is
                sortable but not sorted. Left out, the column can't be sorted.
              </>
            ),
          },
          {
            name: "onSort",
            type: '(next: "ascending" | "descending") => void',
            default: "none",
            description: (
              <>
                Called when the header's button is pressed, with the direction to sort by next: descending if the rows
                are ascending by this column, otherwise ascending. The app sorts its rows and sets <code>sort</code>{" "}
                on this column, and <code>"none"</code> on the others.
              </>
            ),
          },
        ]}
      />
      <h3>TableCell</h3>
      <PropsTable
        rows={[
          { name: "align", type: '"start" | "end"', default: '"start"', description: "As on TableHeader." },
          { name: "colspan", type: "number", default: "1", description: "The columns the cell spans." },
          {
            name: "empty",
            type: "boolean",
            default: "false",
            description: "The one cell of an empty table, across every column, saying why it's empty and what fills it.",
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";

const [sort, setSort] = createSignal<"ascending" | "descending">("descending");

<Table aria-label="Sites">
  <TableHead>
    <TableRow>
      <TableHeader>Site</TableHeader>
      <TableHeader>Domain</TableHeader>
      <TableHeader align="end" sort={sort()} onSort={setSort}>Visits</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <For each={sortedSites()}>
      {(site) => (
        <TableRow href={\`/sites/\${site.id}\`}>
          <TableCell>{site.name}</TableCell>
          <TableCell>{site.domain}</TableCell>
          <TableCell align="end">{site.visits.toLocaleString()}</TableCell>
        </TableRow>
      )}
    </For>
  </TableBody>
</Table>`}</code>
      </pre>
      <p>
        Other attributes pass through to the element each part renders: <code>id</code>, <code>class</code>,{" "}
        and <code>aria-*</code>.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From APG's Table pattern and its Sortable Table example. A table has no keys of its own: it is read, not
        operated.
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
                Moves through the row links, sort buttons and other controls in the table, in reading order. A table
                with none takes no focus. When the table is wider than its pane, the pane takes focus once, as a region
                named as the table is, so <kbd>←</kbd> and <kbd>→</kbd> can scroll it.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd> on a row link
              </td>
              <td>Follows the link, as a click on the row does.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd> or <kbd>Space</kbd> on a sort button
              </td>
              <td>
                Sorts by that column, ascending first, and the other way on the next press. Focus stays on the button.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce the table by its name, with its count of rows and columns. Their table keys (Ctrl+Alt+arrows
                in NVDA and VoiceOver) move cell by cell, and read the column's header with each cell, and the row's
                header too where a row has one. A sorted column's header is read with its direction, "Visits, sorted
                descending". A row link is read by the first cell's text, so that cell should name the row.
              </td>
            </tr>
            <tr>
              <td>Zoom and text size</td>
              <td>
                The sizes are in rem, so they follow the browser's text size. At 400% zoom the table scrolls sideways
                in its pane, and the page doesn't.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Hover on a linked row:</strong> the row takes a faint tint of the text color. Only where there is a
          hovering pointer, so a tap doesn't leave a row lit. The pointer is a hand over the link itself, so a static
          page with no JS promises no more than it does.
        </li>
        <li>
          <strong>Focus:</strong> the row link, or a sort button, takes the kit's focus ring. The ring glides from one
          row to the next as Tab moves down the table.
        </li>
        <li>
          <strong>Sorted:</strong> the sorted column's header is in the text color with a solid arrow. The others are
          muted, with a faint two-way arrow that turns to the text color under the pointer.
        </li>
        <li>
          <strong>Empty:</strong> the header, then one muted cell across every column, twice a row's height.
        </li>
        <li>
          <strong>Wider than the screen:</strong> the pane scrolls sideways. Its rounded edge stays put, and the rows
          slide under it.
        </li>
        <li>
          <strong>Mode:</strong> the text and lines are near-black on light and near-white on dark. The header's muted
          text keeps 4.5:1 on the pane in both.
        </li>
        <li>
          <strong>Theme:</strong> classic is an opaque card. Glass is frosted, with the faint sheen from the upper
          right that every glass surface has, and no shadow, because a table lies in the page rather than floating
          over it. Where the user asks for reduced transparency, glass falls back to classic's card.
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
                <code>--table-row-height</code>, <code>--table-row-height-dense</code>
              </td>
              <td>2.75rem, and --item-height: 2rem, 2.75rem on a touch screen. New.</td>
            </tr>
            <tr>
              <td>
                <code>--table-fill</code>, <code>--table-blur</code>, <code>--table-edge</code>
              </td>
              <td>
                The pane. Classic: --color-raised, no blur, --color-border. Glass: --popup-fill and --popup-blur,
                and --surface-edge. New.
              </td>
            </tr>
            <tr>
              <td>
                <code>--table-rule-strong</code>, <code>--table-rule</code>
              </td>
              <td>The line under the header and the lines between rows and columns: the text color at 16% and 8%. New.</td>
            </tr>
            <tr>
              <td>
                <code>--table-stripe</code>, <code>--table-hover</code>
              </td>
              <td>A striped row, and a linked row under the pointer: the text color at 3% and 6%. New.</td>
            </tr>
            <tr>
              <td>
                <code>--space-4</code>, <code>--space-3</code>
              </td>
              <td>A cell's side padding, and a dense cell's.</td>
            </tr>
            <tr>
              <td>
                <code>--radius-lg</code>
              </td>
              <td>The pane's corners, as a Popover's.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;table&gt;</code> works everywhere. The CSS uses <code>:where()</code>, <code>:has()</code> and{" "}
        <code>color-mix()</code>, in every current browser. A whole row as a link is a click handler in the Solid
        component rather than a link stretched over the row in CSS: Safari only learned to hold a stretched link
        inside its row in April 2026, and before that, every row's link would cover the whole table. Without JS, the
        first cell's link still works.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Table for the parts and their names, its <code>dense</code>, <code>striped</code> and{" "}
        <code>grid</code> props, and a row's <code>href</code>. Its <code>bleed</code> is <code>plain</code> here,
        because the pane is ours. Open Props UI's Table for styling a bare <code>&lt;table&gt;</code>, and figures of
        one width. APG's Table pattern and Sortable Table example for <code>aria-sort</code> on the header and a
        button inside it.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with the markup it renders for a static page. The sortable one sorts its
        rows as the page would. Switch the theme and mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="Sites" name="table/sites" />
      <Example title="Dense and striped" name="table/dense" />
      <Example title="Rows as links" name="table/links" />
      <Example title="Sortable columns" name="table/sortable" />
      <Example title="Grid" name="table/grid" />
      <Example title="Empty" name="table/empty" />
      <Example title="On glass" name="table/glass" />
      <Example title="In a dialog" name="table/dialog" />

    </article>
  );
}
