import { Example, PropsTable } from "../spec.tsx";

export default function DescriptionListPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Description list</h1>
      <p class="lede">Terms and their details, such as a site's settings or a deploy's summary, read as label and value.</p>
      <Example title="Description list" hero name="description-list/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;dl&gt;</code>, with a <code>&lt;dt&gt;</code> for each term and a{" "}
          <code>&lt;dd&gt;</code> for each detail. It adds no behavior: nothing in it takes focus but the links and
          buttons inside the details.
        </li>
        <li>
          The term is the quiet label, in the muted text color. The detail is the value, in the full text color,
          since it's what a reader came for.
        </li>
        <li>
          When the list is wide enough, each term sits in a column beside its details, with a hairline between
          rows. The term column is half the list, up to 20rem. On a narrow list the details stack under their term,
          and the hairline runs above each term.
        </li>
        <li>
          The list measures its own width, not the screen's. At 24rem or wider it shows two columns, so a list in a
          desktop dialog gets them, and a list on a phone or in a sidebar stacks. That's the one thing that differs
          from Catalyst, which switches at a screen width, so its list in a narrow sidebar on a wide screen would
          squeeze its terms.
        </li>
        <li>
          A term may have more than one detail, such as two domains. They sit close together, as one value. Several
          terms may share their details too, each under the last in the term column, with the details beside the
          last term. A detail left empty shows a quiet dash, which screen readers read as "None", so the row doesn't
          look broken.
        </li>
        <li>
          The terms and details sit straight in the list, with nothing around each pair. HTML allows only a{" "}
          <code>&lt;div&gt;</code> there, and the kit never writes one, so the list has no row element and a
          wrapped pair isn't styled. A row with an <code>id</code> puts it on the term.
        </li>
        <li>
          Long values, such as a URL or a version id, break across lines rather than overflowing their column.
        </li>
        <li>
          Left without a <code>size</code>, the list takes the size of where it sits, as Text does: 16px on the
          page, 14px in a dialog's body. <strong>sm</strong> sets 14px for a dense panel.
        </li>
        <li>
          The list sets no margin, and its first and last rows are flush with its edges, so it lines up with a
          heading above it. The space around it belongs to what holds it.
        </li>
        <li>
          The CSS styles every <code>&lt;dl&gt;</code>, so a static page gets the look with no JS. Every rule is
          wrapped in <code>:where()</code>, so its specificity is 0, as with Text.
        </li>
      </ul>
      <p>
        A form to edit the values is Fieldset with its controls. A list that sorts, filters or selects rows is
        Table.
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
              <td><code>DescriptionList</code></td>
              <td><code>&lt;dl&gt;</code></td>
              <td>
                The list. Its own width picks the layout. <code>data-size</code> carries the prop, and is left out
                when the prop is.
              </td>
            </tr>
            <tr>
              <td><code>DescriptionTerm</code></td>
              <td><code>&lt;dt&gt;</code></td>
              <td>A term: the label of a row, muted. The hairline is drawn above it.</td>
            </tr>
            <tr>
              <td><code>DescriptionDetails</code></td>
              <td><code>&lt;dd&gt;</code></td>
              <td>A detail: the value, which may hold a link, code or a button. One term may have several.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>DescriptionList</h3>
      <PropsTable
        rows={[
          {
            name: "size",
            type: '"sm" | "base"',
            default: "none",
            description: (
              <>
                sm is 14px on 20px lines, base 16px on 24px, as with Text. Left out, the list inherits the size and
                line height of where it sits.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The terms and details, in order." },
        ]}
      />
      <h3>DescriptionTerm and DescriptionDetails</h3>
      <PropsTable
        rows={[{ name: "children", type: "JSX.Element", description: "The term's words, or the detail's value." }]}
      />
      <pre tabindex="0">
        <code>{`import { DescriptionDetails, DescriptionList, DescriptionTerm } from "beautiful-ui-solid";

<DescriptionList>
  <DescriptionTerm>Plan</DescriptionTerm>
  <DescriptionDetails>$29 a month, renews on December 3</DescriptionDetails>
  <DescriptionTerm>Domains</DescriptionTerm>
  <DescriptionDetails>springlaunch.com</DescriptionDetails>
  <DescriptionDetails>www.springlaunch.com</DescriptionDetails>
</DescriptionList>`}</code>
      </pre>
      <p>
        Other attributes pass through to each element: <code>id</code>, <code>class</code>, <code>aria-*</code>.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>There is no APG pattern for a description list. The browser's semantics do it all.</p>
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
              <td>Passes over the list. A link or button in a detail takes focus as usual, in reading order.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce a list and how many items it holds, then read each term and its details in order. Chrome
                and Safari give a term the role <code>term</code> and a detail <code>definition</code>; VoiceOver
                calls it a description list, NVDA and JAWS a definition list. The columns are only the look: the reading order is the markup's.
              </td>
            </tr>
            <tr>
              <td>Zoom and text size</td>
              <td>
                Sizes and spacing are in rem. At 400% zoom the list is narrower than 24rem, so it stacks, with no
                sideways scroll.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <p>A description list has no interactive states. What changes it:</p>
      <ul>
        <li>
          <strong>Width:</strong> two columns at 24rem or wider, stacked below that.
        </li>
        <li>
          <strong>Mode:</strong> terms are muted text and details full text, each a light and dark pair. The
          hairline is a Divider's, the text color at 10%, so it shows on light and dark alike. On glass it is a groove
          with a lit edge, dark in dark mode.
        </li>
        <li>
          <strong>Theme:</strong> on glass the hairline is a Divider's groove, as the Mode line says. On a glass
          surface, such as a Dialog, the terms take the surface's stronger muted shade, so they keep their contrast
          whatever shows through.
        </li>
        <li>
          <strong>Empty detail:</strong> a muted dash, read as "None".
        </li>
        <li>
          <strong>Long values:</strong> break across lines inside their column.
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
            <tr><td><code>--term-width</code></td><td><code>min(50%, 20rem)</code>, new: the term column's width</td></tr>
            <tr><td><code>--hairline-width</code>, <code>--color-hairline</code>, <code>--hairline-lit</code></td><td>the line between rows, as a Divider's: 10% of the text color, a groove with a lit edge on glass</td></tr>
            <tr><td><code>--color-text</code>, <code>--color-text-muted</code></td><td>the detail and the term</td></tr>
            <tr><td><code>--space-3</code>, <code>--space-1</code></td><td>a row's top and bottom padding, and the gap from a term to its detail when stacked</td></tr>
            <tr><td><code>--space-2</code></td><td>with <code>--space-1</code>, a detail's top padding beside its term</td></tr>
            <tr><td><code>--space-4</code></td><td>the space between the term column and the details</td></tr>
            <tr><td><code>--text-sm</code>, <code>--leading-sm</code>, <code>--text-base</code>, <code>--leading</code></td><td>the sizes</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        The 24rem where the columns start is written in the CSS, as a measure of the list's own width. It isn't a
        container query: one would need <code>container-type</code> on the list, which shrinks a list sized by its
        content, such as one in a Popover, to nothing.
      </p>

      <h2>Platform support</h2>
      <p>
        <code>&lt;dl&gt;</code> works everywhere. The layout is a wrapping flex row sized with <code>clamp()</code> and{" "}
        <code>calc()</code>, and the rows use <code>:has()</code>, in every current browser. The dash's "None" uses{" "}
        <code>content</code>'s alt text; a browser without it shows the dash and reads nothing.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Description list for the names, the muted term beside a full-color detail, the term column of
        half the list up to 20rem, and a hairline between rows. Open Props UI's DescriptionList for laying out by
        the list's own width rather than the screen's.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Site details" name="description-list/site" />
      <Example title="Several details, an empty one, and a long one" name="description-list/several" />
      <Example title="In a sidebar" name="description-list/narrow" />
      <Example title="In a dialog" name="description-list/dialog" />
    </article>
  );
}
