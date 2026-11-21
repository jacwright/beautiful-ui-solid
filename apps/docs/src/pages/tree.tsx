import { Example, PropsTable } from "../spec.tsx";

export default function TreePage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Tree</h1>
      <p class="lede">
        Nested items a person opens and closes, picks one of, and acts on: a site's pages in its admin,
        a folder of files, the sections of a long document.
      </p>

      <Example title="Tree" hero name="tree/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          Each item is one row: a chevron when it has children, an optional icon, its name, and an optional end. The
          end holds what a person scans for: a Badge such as Draft, a count such as "3 posts", a status. A long name
          is cut short with an ellipsis, so every row stays one line and the ends line up.
        </li>
        <li>
          Children sit one step in, so a child's chevron lines up under its parent's icon. A row's tint and its
          selected tint reach the tree's full width at every depth, so the rows read as one column.
        </li>
        <li>
          A click selects an item, and the app shows it. A click on the chevron, or a double click on the row, opens
          or closes it without selecting. Opening pushes the rows below down and fades the children in. Closing is
          quicker, as the kit's exits are.
        </li>
        <li>
          The selected item takes the hover tint, stronger, with its icon in the text's color: a tint rather than
          Sidebar's raised pane, so a long tree stays flat and calm. One item is selected at a
          time.
        </li>
        <li>
          An item can have actions. A "..." button at the row's end opens them, and right-clicking the row opens the
          very same menu, from one list of actions given once to the tree. The button shows on the row under the
          pointer, the focused row and the selected row, so a long tree stays quiet; under a finger, which can't
          hover, it always shows. The actions are the kit's shared action model (Context menu's page), so a tree
          row, an editor and a toolbar all describe actions the same way, with their keys bound for the focused
          row.
        </li>
        <li>
          The Solid component takes data: an array of nodes, each with an id, a label and its children. It works
          out the levels, the sizes and the hidden rows, and reveals the selected item on first show by opening its
          parents and scrolling it into view.
        </li>
      </ul>
      <p>
        Not in this spec: picking several items at once, renaming in place, and loading children as an item
        opens. Each fits the structure here and can be added when a screen needs it. A
        flat list of things is List, and an app's own navigation is Sidebar.
      </p>

      <h2>Anatomy</h2>
      <p>
        The items are flat in the DOM, each a direct child of the tree with its depth in <code>aria-level</code>, as
        APG allows. That keeps one element per row, lets a row's tint reach the full width, and keeps a row's name
        to its own words for screen readers.
      </p>
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
              <td>Tree</td>
              <td>
                <code>&lt;beautiful-tree role="tree"&gt;</code>
              </td>
              <td>
                Holds every item, named by <code>aria-label</code> or <code>aria-labelledby</code>. It draws no surface
                and doesn't scroll: the panel it sits in does.
              </td>
            </tr>
            <tr>
              <td>Item</td>
              <td>
                <code>&lt;beautiful-tree-item role="treeitem"&gt;</code>
              </td>
              <td>
                One row, with <code>aria-level</code>, <code>aria-setsize</code> and <code>aria-posinset</code>.{" "}
                <code>aria-expanded</code> on an item with children, <code>aria-selected="true"</code> on the selected
                one, <code>aria-disabled</code> on one that can't be picked, and <code>hidden</code> on the children of
                a closed item. <code>aria-haspopup="menu"</code> when it has actions.
              </td>
            </tr>
            <tr>
              <td>Chevron</td>
              <td>
                the item's <code>::before</code>
              </td>
              <td>Points right while closed and down while open. Blank space on a leaf, so the icons line up.</td>
            </tr>
            <tr>
              <td>Icon</td>
              <td>
                <code>&lt;svg aria-hidden="true"&gt;</code>
              </td>
              <td>16px, 20px under a finger, in the muted color; the text's color on the selected and hovered item.</td>
            </tr>
            <tr>
              <td>Label</td>
              <td>
                <code>&lt;beautiful-tree-label&gt;</code>
              </td>
              <td>The name, at weight 500, on one line. Typing a letter finds an item by it.</td>
            </tr>
            <tr>
              <td>End</td>
              <td>
                after the label: <code>&lt;beautiful-tree-end&gt;</code> for text, or a Badge
              </td>
              <td>A count or a status in the muted color at 12px, or a Badge, which keeps its own look.</td>
            </tr>
            <tr>
              <td>Actions</td>
              <td>
                <code>&lt;button data-icon-button data-tree-actions tabindex="-1" aria-hidden="true"&gt;</code>, last
              </td>
              <td>
                A tertiary Icon button, sized to the row, that opens the item's menu. It's for the pointer: the
                keyboard opens the same menu from the row, so a screen reader hears one item, not an item and a
                button, and Tab stays one stop.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Tree</h3>
      <PropsTable
        rows={[
          {
            name: "items",
            type: "T[]",
            description: (
              <>
                The top level. <code>T</code> is any type with <code>id: string</code>, <code>label: string</code> and
                an optional <code>children?: T[]</code>, so an app's own page objects go in as they are and come
                back out in every callback.
              </>
            ),
          },
          { name: "label", type: "string", description: <>The tree's name for screen readers, such as "Pages".</> },
          {
            name: "icon",
            type: "(node: T) => JSX.Element",
            default: "none",
            description: "An item's icon. A function, so one rule covers every node: a house for the home page, a page for the rest.",
          },
          {
            name: "end",
            type: "(node: T) => JSX.Element",
            default: "none",
            description: "What goes at an item's end, before the \"...\" button: a Badge, a count, a status.",
          },
          {
            name: "selected",
            type: "string",
            default: "none",
            description: (
              <>
                The selected item's id. Leave it out and the tree keeps its own, starting with{" "}
                <code>defaultSelected</code>.
              </>
            ),
          },
          {
            name: "defaultSelected",
            type: "string",
            default: "none",
            description: "The item selected at first, when the parent doesn't hold the selection.",
          },
          {
            name: "onSelect",
            type: "(node: T) => void",
            default: "none",
            description: "A click, Enter or Space picked an item. The app shows it.",
          },
          {
            name: "onHighlight",
            type: "(node: T) => void",
            default: "none",
            description: "The pointer came onto an item, or the keyboard's focus did: a likely next pick. The app can start loading it.",
          },
          {
            name: "expanded",
            type: "string[]",
            default: "none",
            description: (
              <>
                The ids of the open items. Leave it out and the tree keeps its own, starting with{" "}
                <code>defaultExpanded</code>, and with the selected item's parents open.
              </>
            ),
          },
          {
            name: "defaultExpanded",
            type: "string[]",
            default: "[]",
            description: "The items open at first, when the parent doesn't hold them. The selected item's parents open too.",
          },
          {
            name: "onExpandedChange",
            type: "(ids: string[], node: T, open: boolean) => void",
            default: "none",
            description: "An item opened or closed, with the open ids after it.",
          },
          {
            name: "actions",
            type: "ActionList<T>",
            default: "none",
            description: (
              <>
                The items' actions, from the kit's shared action model: one list for every item, given the item's node
                when it shows, so <code>hidden</code> and <code>enabled</code> can depend on it ("Delete" is hidden on
                the home page). Each item then gets the "..." button and the right-click menu, and an action's{" "}
                <code>keys</code>, such as F2 for Rename, work on the focused item.
              </>
            ),
          },
          {
            name: "disabled",
            type: "(node: T) => boolean",
            default: "none",
            description: "Items that can be reached and read but not selected, faded to half opacity.",
          },
          {
            name: "onMove",
            type: '(node: T, target: T, place: "before" | "after" | "inside") => void',
            default: "none",
            description: (
              <>
                Turns on moving: rows drag, and every row's menu gets Move. Called with the item, the row it goes
                against, and where. The tree doesn't change the items: the app moves it in its data, so the app can check
                the move and save it. <code>moveTreeItem(items, id, target.id, place)</code> does it for plain nodes.
                The tree opens the target of an <code>"inside"</code>, so the item shows where it went.
              </>
            ),
          },
          {
            name: "canMove",
            type: '(node: T, target: T, place: "before" | "after" | "inside") => boolean',
            default: "any spot",
            description: (
              <>
                Whether an item may go to a spot. Refused spots get no line and no drop, and the keyboard skips them.
                An item that can go nowhere, such as a home page, has no Move. An item never goes inside itself or
                its own children, whatever this says.
              </>
            ),
          },
          {
            name: "chevron",
            type: '"column" | "icon"',
            default: '"column"',
            description: (
              <>
                Where the chevron goes. <code>"column"</code> gives it a column before the icon, so items that open
                stand out. <code>"icon"</code> puts it in the icon's place, shown under the pointer and on keyboard
                focus, for trees where any item can hold others, such as pages: each row is a
                column narrower, so deep trees stay narrow. An item with no children never shows one. It needs an
                icon on every item; a row without one keeps the column. It needs hover, so on a touchscreen the tree keeps
                the column.
              </>
            ),
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Badge, Tree, type ActionList } from "beautiful-ui-solid";

type Page = { id: string; label: string; path: string; draft: boolean; children?: Page[] };

const pageActions: ActionList<Page> = [
  { id: "preview", label: "Preview", icon: () => <EyeIcon />, run: (page) => preview(page) },
  { id: "rename", label: "Rename", keys: "F2", icon: () => <PencilIcon />, run: (page) => rename(page) },
  { id: "add", label: "Add a page inside", icon: () => <PlusIcon />, run: (page) => addPage(page) },
  { actions: [
    { id: "delete", label: "Delete", color: "danger", icon: () => <TrashIcon />,
      hidden: (page) => page.path === "/", run: (page) => remove(page) },
  ] },
];

<Tree
  label="Pages"
  items={site.pages}
  icon={(page) => (page.path === "/" ? <HomeIcon /> : <PageIcon />)}
  end={(page) => page.draft && <Badge>Draft</Badge>}
  selected={current()?.id}
  onSelect={(page) => navigate(page.path)}
  actions={pageActions}
/>`}</code>
      </pre>
      <p>
        <code>wireTree(element, options)</code> adds the keys and pointer to static markup, as{" "}
        <code>wireMenu</code> does for a Dropdown. The Solid component calls it. Other attributes pass through to{" "}
        <code>&lt;beautiful-tree&gt;</code>.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From APG's Tree View pattern, for a tree where one item is selected at a time and moving focus doesn't select:
        selecting loads a page, so it waits for Enter, Space or a click.
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
                The tree is one stop: Tab lands on the selected item, or the first item if none is, and the next Tab
                leaves the tree. The "..." buttons are not stops.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>↓</kbd> <kbd>↑</kbd>
              </td>
              <td>The next or previous shown item, without wrapping. The children of a closed item are skipped.</td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd>
              </td>
              <td>Opens a closed item. On an open item, moves to its first child. On a leaf, nothing.</td>
            </tr>
            <tr>
              <td>
                <kbd>←</kbd>
              </td>
              <td>Closes an open item. On a closed item or a leaf, moves to its parent.</td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd> <kbd>End</kbd>
              </td>
              <td>The first item, and the last shown one.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd> <kbd>Space</kbd>
              </td>
              <td>Select the focused item. A disabled item can't be selected.</td>
            </tr>
            <tr>
              <td>
                <kbd>*</kbd>
              </td>
              <td>Opens every item at the focused item's level under the same parent.</td>
            </tr>
            <tr>
              <td>A letter</td>
              <td>
                The next shown item whose label starts with it. Letters typed quickly add up, so "sp" finds Spring launch
                notes.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Shift</kbd> <kbd>F10</kbd>, <kbd>ContextMenu</kbd>
              </td>
              <td>
                Opens the focused item's menu on its first action. Escape closes it and focus goes back to the item.
                The menu's own keys are Dropdown's.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Alt</kbd> <kbd>M</kbd>
              </td>
              <td>With onMove: Move, the keyboard's drag. "Moving items" below has its keys.</td>
            </tr>
            <tr>
              <td>An action's keys</td>
              <td>
                Run that action on the focused item, such as <kbd>F2</kbd> for Rename, when the action is shown and
                enabled for it.
              </td>
            </tr>
            <tr>
              <td>Pointer</td>
              <td>
                A click selects and focuses. A click on the chevron, or a double click, opens or closes. A right-click
                opens the item's menu at the pointer; Shift and right-click gives the browser's own menu. The "..."
                button opens the same menu beside itself.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Say "Pages, tree", then each item's name, its end ("Careers, Draft"), whether it's open or closed,
                selected, and its place: "level 2, 2 of 2". An item with actions says it has a menu.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Hover:</strong> a quiet tint, 8% of the text color, as on a Sidebar item, and the icon takes the
          text color. The "..." button shows.
        </li>
        <li>
          <strong>Focus:</strong> the kit's 2px accent ring around the row, inside the gap between rows so it never
          covers a neighbor. It glides from row to row as the arrows move it.
        </li>
        <li>
          <strong>Selected:</strong> a stronger tint, 12% of the text color, and the icon takes the text's color, no
          hue. Hover leaves it as it is. On a lit row a Badge drops glass's white top highlight, so its edge shows
          all round.
        </li>
        <li>
          <strong>Menu open:</strong> the row stays lit, as under the pointer, until its menu closes.
        </li>
        <li>
          <strong>Moving:</strong> the moved item at half opacity; a line in the gap for a before or after drop, from
          the target's depth; the accent tint on the target of an inside drop.
        </li>
        <li>
          <strong>Disabled:</strong> half opacity, no tint, and not selectable. It can still be reached and opened, so
          a person can see what's in it.
        </li>
        <li>
          <strong>Open and closed:</strong> the chevron turns, in Disclosure's timing. Opening, the children grow
          from no height to a row's, pushing the rows below down together, then fade in. Closing, they fade out, then
          shrink away. The rows stay siblings, each one height, so a long tree can later render only the rows in
          view. Under reduced motion they only fade. Rows on the page as it loads don't animate.
        </li>
        <li>
          <strong>Mode and theme:</strong> the tree draws no surface, so it takes the panel it's on. The tint is mixed
          from the text color, for hover and selection alike, so it follows light and dark, glass and classic,
          with no rules of their own.
        </li>
        <li>
          <strong>Deep trees:</strong> each level steps in by a chevron and a gap. Past twelve levels, items sit at the
          twelfth. A narrow panel cuts names short before it cuts the end.
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
            <tr><td><code>--tree-indent</code></td><td>new: one level's step, a chevron and <code>--space-2</code></td></tr>
            <tr><td><code>--tree-drop-line</code></td><td>new: the drop line's thickness, 2px, as the focus ring's</td></tr>
            <tr><td><code>--color-accent</code></td><td>the drop line, and the inside drop's tint at 18%</td></tr>
            <tr><td><code>--color-raised</code></td><td>behind the row in the browser's drag image</td></tr>
            <tr><td><code>--item-height</code></td><td>a row's height: 32px, 44px under a finger</td></tr>
            <tr><td><code>--item-gap</code></td><td>the space between rows, as a Sidebar's</td></tr>
            <tr><td><code>--control-icon</code></td><td>the chevron's and an icon's size</td></tr>
            <tr><td><code>--space-1</code>, <code>--space-2</code></td><td>a row's inset, and the gap between its parts</td></tr>
            <tr><td><code>--radius-md</code></td><td>a row's corners</td></tr>
            <tr><td><code>--color-text</code></td><td>the tints are mixed from it: 8% on hover, 12% selected</td></tr>
            <tr><td><code>--motion-expand</code>, <code>--motion-collapse</code></td><td>the chevron's turn, as Disclosure's</td></tr>
            <tr><td><code>--motion-quick</code></td><td>the children's grow and fade: 120ms each, the fade starting partway through the grow</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Moving items</h2>
      <p class="eyebrow">Built</p>
      <p>
        With <code>onMove</code>, a person reorders items and puts one inside another, as a site's page tree needs:
        drag a row onto another, or use Move from the keyboard. Try it on the site's pages example below.
      </p>
      <ul>
        <li>
          <strong>Dragging.</strong> A row drags with the browser's own drag and drop, so the pointer carries the row
          and Escape cancels. Where the pointer is on the row under it says where the item lands: the top quarter
          puts it before that row, the bottom quarter after, and the middle inside it, as its last child. Below an
          open item, the bottom quarter means before its first child, which is where the line shows. Below the
          last of a set of siblings, the pointer's indent picks the level: out in an outer level's indent, the item
          goes after that level's item, and the line starts at that depth.
        </li>
        <li>
          <strong>Where it goes.</strong> A before or after drop shows a 2px line in the gap between rows, in the
          focus ring's color, starting at the target row's depth, so the line says which level the item lands at.
          An inside drop tints the target row with the accent, apart from the selected row's gray tint. The item
          being moved fades to half. A spot the item can't go to, inside itself or one <code>canMove</code> refuses,
          shows nothing, and the pointer shows it can't drop.
        </li>
        <li>
          <strong>Long trees.</strong> The dragged row stays rendered while the panel scrolls. Near the top or bottom
          edge of the panel, a row's height from it, the panel scrolls itself, faster nearer the edge. Resting on a
          closed item for half a second opens it, so a drag reaches its children.
        </li>
        <li>
          <strong>The keyboard.</strong> Move is in every row's menu, before the last group (where Delete goes), and
          on <kbd>Alt</kbd> <kbd>M</kbd> (<kbd>⌥</kbd> <kbd>M</kbd> on a Mac). A tree with no actions of its own gets
          no "..." buttons for Move alone: right-click and <kbd>Shift</kbd> <kbd>F10</kbd> open a menu of just Move. The item stays focused and fades, and
          the arrows step through the spots it can go to, in reading order: before each row, inside it, and after
          the last of each set of siblings. An open item has no "inside" spot: after its last child is the same
          place. Each shows as a drag would, scrolls into view, and is said by a live
          region: "Before Blog, at the top level", "Inside Blog", "After Careers, in About". Enter moves it there,
          and Escape, Tab or a click leaves it where it was.
        </li>
        <li>
          <strong>Touch.</strong> A finger scrolls and long-presses for the menu, so it doesn't drag, and its menu has
          no Move. A touch app moves an item with a picker such as the dialog example below.
        </li>
        <li>
          After a move, focus is on the moved item, wherever it went, and the tree opens the item it went inside.
        </li>
      </ul>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Key, while moving</th>
              <th>Behavior</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <kbd>↓</kbd> <kbd>↑</kbd>
              </td>
              <td>The next or previous spot. The first ↓ is the spot just after where the item is now.</td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd> <kbd>End</kbd>
              </td>
              <td>The first and last spot.</td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd> <kbd>←</kbd>
              </td>
              <td>
                → on "inside" a closed item opens it and goes to the first spot among its children. ← closes the
                item the spot is in, and picks inside it.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>Moves the item to the spot, and says so: "Moved Contact after Careers, in About."</td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>, <kbd>Tab</kbd>, a click
              </td>
              <td>Leaves it where it was. No other key, such as an action's, runs while moving.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        The spots, the drop place and <code>moveTreeItem</code> are data functions in <code>tree-move.ts</code>,
        exported from the kit, so an app or a test can use them without a tree.
      </p>

      <h2>Thousands of items</h2>
      <p>
        A tree renders only the rows in view in whatever scrolls it, a panel or the page, plus eight past each edge.
        The rows before, between and after them are spacers as tall as the rows they stand for, so the scrollbar keeps
        its size. A closed item's children aren't rendered at all. A site of 5,000 pages scrolls as one of ten, and
        every row reached by scrolling is the real row, with its icon, end and "..." button.
      </p>
      <ul>
        <li>
          The keys move through the shown items' data, not the rendered rows, so ↓ at the bottom of the view, End,
          a letter and <kbd>*</kbd> reach items that aren't on the page yet. The row focus lands on is rendered first,
          and focusing it scrolls it into view.
        </li>
        <li>
          The row with the Tab stop and the row whose menu is open stay rendered wherever they are, so Tab comes back
          to the same row and the menu keeps its anchor.
        </li>
        <li>
          Opening and closing animate as before. Opening marks the rows it shows, and only those grow in, not the
          rows that scrolling brings on. Closing keeps its rows that were on the page, hidden, until they've faded
          and shrunk away, and then takes them off.
        </li>
        <li>
          Each row keeps <code>aria-level</code>, <code>aria-setsize</code> and <code>aria-posinset</code>, so a
          screen reader says "3 of 50" for a row whose siblings aren't rendered.
        </li>
      </ul>
      <p>
        Every row is one height, <code>--item-height</code>, which is what lets the tree skip rows without measuring
        them. The windowing is the kit's shared virtual list, <code>createVirtualList</code> in{" "}
        <code>virtual.ts</code>, which any list of one-height rows can use: it takes the row count and a key per row,
        and gives the slots to render, rows by index and spacers by height. Listbox, Combobox, Tag field and Table
        come next.
      </p>

      <h2>Platform support</h2>
      <p>
        The tree and treeitem roles are read by every current screen reader. The grow and fade use{" "}
        <code>@starting-style</code> and <code>transition-behavior: allow-discrete</code>, in every current browser;
        where they're missing, children appear and go at once. The
        chevron is a CSS mask, and the "..." button's visibility uses <code>(hover: none)</code> for touch.
      </p>

      <h2>References</h2>
      <p>
        APG's Tree View pattern and its file directory example for the roles, keys and the flat, leveled DOM. No
        reference in components.md has a tree: Catalyst, Headless UI and Open Props UI don't ship one, so the name is
        ours. The row's look comes from the kit's Sidebar, and its menu from Dropdown and Context menu.
      </p>

      <h2>Other examples</h2>
      <p>
        Live Solid trees. In a site's pages, press Shift+F10 on a row, or try "Add a page inside" to see a folder
        open. Switch the theme and mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="A site's pages: click, use the arrow keys, right-click, drag a page" name="tree/pages" />
      <Example title="Without actions, holding its own state" name="tree/docs" />
      <Example title="In a dialog: pick where a page goes" name="tree/move" />
      <Example title={`chevron="icon": every page can hold pages, so the chevron shows in the icon's place on hover`} name="tree/compact" />
      <Example title="5,510 pages in a panel that scrolls: open a folder and press * to open all fifty, or drag a page to an edge" name="tree/large" />
    </article>
  );
}
