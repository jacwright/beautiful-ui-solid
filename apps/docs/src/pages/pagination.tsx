import { Example, PropsTable } from "../spec.tsx";

export default function PaginationPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Pagination</h1>
      <p class="lede">Moves through a long list a page at a time: Previous, the pages around this one, and Next.</p>
      <Example title="Pagination" hero name="pagination/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a <code>&lt;nav&gt;</code> labelled "Pages", so screen readers list it with the page's landmarks and a
          person can jump straight to it. Its links are Links: native <code>&lt;a href&gt;</code>s, so Enter, Cmd-click
          and "copy link" all work, each page has an address to share, and Solid Router follows them with no reload.
        </li>
        <li>
          Previous sits at the start of the row and Next at the end, each with an arrow. The page links sit centered
          between them, so they stay put as you move through the list.
        </li>
        <li>
          The current page is drawn as a secondary Button: a raised pane, frosted on glass. The other pages are quiet
          text, tinted when the pointer is over them, as a tertiary Button is.
        </li>
        <li>
          It shows the first page, the last, the current one and one on each side of it. A gap (…) stands for the
          pages left out. A gap never hides a single page: that page shows instead. So from seven pages on, the row
          always holds seven slots, and it never changes width as you go.
        </li>
        <li>
          On the first page, Previous is still there but faded, and it can't be focused or followed. Next is the same on
          the last page. Neither ever disappears, so the row doesn't shift.
        </li>
        <li>
          Where it is too narrow for every page, such as on a phone or in a sidebar, it shows the current page and the
          last one with "of" between: Previous, 6 of 12, Next. Narrower still, as on a phone, Previous and Next keep
          their arrows and drop their words from sight: ← 6 of 12 →. It measures the space it sits in, not the
          window, so it folds up in a narrow column on a wide screen too.
        </li>
        <li>
          A list with no count, such as a log read with a cursor, uses Previous and Next alone, with words of its own:
          Newer and Older.
        </li>
        <li>
          The CSS styles the markup on its own, so a static page gets the look with no JS. The Solid component writes
          the markup, works out which pages to show, and labels each link.
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
              <td><code>Pagination</code></td>
              <td><code>&lt;nav data-pagination aria-label="Pages"&gt;</code></td>
              <td>The landmark, and the row. Given a page, a count and an href, it writes every part below itself.</td>
            </tr>
            <tr>
              <td><code>PaginationPrevious</code></td>
              <td><code>&lt;a href rel="prev"&gt;</code></td>
              <td>
                The first thing in the row, with an arrow drawn by <code>::before</code>. With no href it is{" "}
                <code>&lt;a role="link" aria-disabled="true"&gt;</code>: faded, and out of the tab order.
              </td>
            </tr>
            <tr>
              <td><code>PaginationList</code></td>
              <td><code>&lt;beautiful-pagination-list&gt;</code></td>
              <td>The pages, in a row. Holds the links and gaps with no list item around each.</td>
            </tr>
            <tr>
              <td><code>PaginationPage</code></td>
              <td><code>&lt;a href aria-label="Page 6"&gt;</code></td>
              <td>
                One page. The current one has <code>aria-current="page"</code>, which draws its pane.
              </td>
            </tr>
            <tr>
              <td><code>PaginationGap</code></td>
              <td><code>&lt;beautiful-pagination-gap&gt;…</code></td>
              <td>Pages left out. As wide as a page, in the muted text color.</td>
            </tr>
            <tr>
              <td><code>PaginationNext</code></td>
              <td><code>&lt;a href rel="next"&gt;</code></td>
              <td>The last thing in the row, with an arrow drawn by <code>::after</code>. Without an href, as Previous.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Pagination</h3>
      <PropsTable
        rows={[
          {
            name: "page",
            type: "number",
            default: "none",
            description: "The current page, counting from 1. With count and href, Pagination writes its own parts.",
          },
          {
            name: "count",
            type: "number",
            default: "none",
            description: "How many pages there are. Under 2, Pagination renders nothing: there's nowhere to go.",
          },
          {
            name: "href",
            type: "(page: number) => string",
            default: "none",
            description: (
              <>
                Each page's address, such as <code>{"(page) => `/sites?page=${page}`"}</code>. Previous and Next use
                it too.
              </>
            ),
          },
          {
            name: "aria-label",
            type: "string",
            default: '"Pages"',
            description: 'Names the landmark. Give a page with two lists their own, such as "Site pages" and "Form entry pages".',
          },
          {
            name: "children",
            type: "JSX.Element",
            default: "none",
            description: "The parts, for a row that isn't page numbers, such as Newer and Older. Used instead of page, count and href.",
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Pagination } from "beautiful-ui-solid";

<Pagination page={6} count={12} href={(page) => \`/sites?page=\${page}\`} />`}</code>
      </pre>

      <h3>The parts</h3>
      <PropsTable
        rows={[
          {
            name: "PaginationPrevious href",
            type: "string | null",
            default: "null",
            description: "Where the previous page is. Left out on the first page, which fades it.",
          },
          {
            name: "PaginationPrevious children",
            type: "JSX.Element",
            default: '"Previous"',
            description: "Its words, such as Newer.",
          },
          {
            name: "PaginationNext href, children",
            type: "string | null, JSX.Element",
            default: 'null, "Next"',
            description: "As Previous, for the next page.",
          },
          {
            name: "PaginationPage href",
            type: "string",
            description: "Where the page is.",
          },
          {
            name: "PaginationPage current",
            type: "boolean",
            default: "false",
            description: "Marks the page you're on.",
          },
          {
            name: "PaginationPage children",
            type: "number",
            description: 'The page\'s number. It names the link "Page 6", so a screen reader doesn\'t just say "6".',
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Pagination, PaginationNext, PaginationPrevious } from "beautiful-ui-solid";

<Pagination aria-label="Log pages">
  <PaginationPrevious href={newer()}>Newer</PaginationPrevious>
  <PaginationNext href={older()}>Older</PaginationNext>
</Pagination>`}</code>
      </pre>
      <p>
        Other attributes pass through to the element each part renders: <code>id</code>, <code>class</code>,{" "}
        <code>aria-*</code>, and event handlers, such as an <code>onClick</code> that loads the next page in place.
      </p>

      <h2>Which pages show</h2>
      <p>
        The first, the last, the current page, and one on each side of it. A gap replaces two or more pages left out.
        With twelve pages:
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>On page</th>
              <th>The row</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>1 2 3 4 5 … 12</td></tr>
            <tr><td>4</td><td>1 2 3 4 5 … 12</td></tr>
            <tr><td>5</td><td>1 … 4 5 6 … 12</td></tr>
            <tr><td>6</td><td>1 … 5 6 7 … 12</td></tr>
            <tr><td>9</td><td>1 … 8 9 10 11 12</td></tr>
            <tr><td>12</td><td>1 … 8 9 10 11 12</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>Seven pages or fewer show every one.</p>

      <h2>Keyboard and screen readers</h2>
      <p>
        The APG has no Pagination pattern. This is its Landmark Regions guidance for the <code>&lt;nav&gt;</code>, its
        Link pattern for each link, and <code>aria-current</code> for the page you're on. It needs no script.
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
                Moves through Previous, each page, and Next, and skips a faded Previous or Next and the gaps. The focus
                ring shows. No arrow keys: each link is its own stop, as links in a nav are.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>Follows the link. Space scrolls the page, as on every link.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read "Pages, navigation". Each page is "link, Page 6", and the current one adds
                "current page". A gap reads as an ellipsis. A faded Previous is "Previous, link, dimmed" (or
                "unavailable"), and it can't be activated. The "of" on a narrow row is drawn by CSS and not read: the
                links already say "Page 6" and "Page 12".
              </td>
            </tr>
            <tr>
              <td>Touch</td>
              <td>
                Each page and arrow is a full control: 36px, and 44px where the pointer is a finger.
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
              <td>The text color, no underline. Numbers in tabular figures, so 11 is as wide as 88.</td>
            </tr>
            <tr>
              <td>Hover and press</td>
              <td>A tint of the text color, 8% and 14%, fading in 120ms, as on a tertiary Button.</td>
            </tr>
            <tr>
              <td>Current page</td>
              <td>A secondary Button's pane and edge, in semibold. It stays a link, so it can be focused and copied.</td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>The kit's 2px accent ring, 2px out, around the control's corners.</td>
            </tr>
            <tr>
              <td>No previous or next page</td>
              <td>Half opacity, as a disabled Button. No hover, no focus.</td>
            </tr>
            <tr>
              <td>Narrow</td>
              <td>
                Under the width seven pages need (511px with a mouse, 608px on touch), the current page and the last, with "of"
                between. On the last page, the last page alone, with Next faded.
              </td>
            </tr>
            <tr>
              <td>Narrower</td>
              <td>
                Under 350px (400px on touch), Previous and Next show only their arrows, each a square
                control. Their words are still there for screen readers. A row with no pages keeps its words.
              </td>
            </tr>
            <tr>
              <td>Right to left</td>
              <td>Previous sits on the right, and both arrows turn to point the way they go.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> The current page's pane is the control fill: white on light, raised gray on
        dark, and frosted glass on glass, with the glass's sheen. Everything else is text, and looks the same in both
        themes.
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
            <tr><td><code>--control-height</code></td><td>each page's least width and height, and the arrows'</td></tr>
            <tr><td><code>--control-pad-x</code>, <code>--control-font-size</code>, <code>--control-icon</code></td><td>Previous and Next, as a Button</td></tr>
            <tr><td><code>--control-fill</code>, <code>--control-edge</code>, <code>--control-sheen</code>, <code>--control-blur</code>, <code>--control-shadow</code></td><td>the current page's pane</td></tr>
            <tr><td><code>--radius-md</code></td><td>each control's corners</td></tr>
            <tr><td><code>--space-1</code>, <code>--space-2</code></td><td>between the pages, and around the list</td></tr>
            <tr><td><code>--color-text</code>, <code>--color-text-muted</code></td><td>the links, and the gaps and "of"</td></tr>
            <tr><td><code>--motion-quick</code>, <code>--ease-out</code></td><td>the tint on hover</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>No new tokens. The narrow width is written in the CSS: a container query can't read a token.</p>

      <h2>Platform support</h2>
      <p>
        Container queries, <code>:has()</code>, <code>:dir()</code> and CSS masks are in every current browser. Where{" "}
        <code>:dir()</code> is missing (Safari before 16.4), the arrows don't turn for right-to-left.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Pagination for the parts and their names, Previous and Next at each end with arrows, and the current
        page as a quiet pane. GOV.UK's and USWDS's pagination for the labelled nav, "Page 6" as each link's name, and
        the gaps. They put the pages in a list; ours are links in a row, as Catalyst's are, so the kit's markup has no
        wrapper that says nothing. Their mobile rows drop pages too; "6 of 12" is ours.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component live, then its code, then the markup it renders. Switch the theme and mode
        at the top.
      </p>
      <Example title="In the middle" name="pagination/middle" />
      <Example title="On the first page" name="pagination/first" />
      <Example title="A few pages" name="pagination/few" />
      <Example title="Narrow" name="pagination/narrow" />
      <Example title="Newer and older" name="pagination/newer-older" />
      <Example title="In a dialog" name="pagination/glass" />
    </article>
  );
}
