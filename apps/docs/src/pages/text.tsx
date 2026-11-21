import { Example, PropsTable } from "../spec.tsx";

export default function TextPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Text</h1>
      <p class="lede">A paragraph of body copy, with bold words and inline code inside it.</p>
      <Example title="Text" hero name="text/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;p&gt;</code>. It adds no behavior: a paragraph isn't focusable, and screen readers
          read it as a paragraph.
        </li>
        <li>
          Left without a <code>size</code>, it takes the size of where it sits: 16px on the page, 14px in a dialog's
          body. So a <code>Text</code> dropped into a dialog matches the dialog without being told. Three sizes set
          it outright: <strong>sm</strong> for dense app UI, <strong>base</strong> for body copy, and{" "}
          <strong>lg</strong> for the lede under a page's heading.
        </li>
        <li>
          <code>tone="muted"</code> is for secondary copy: a hint, an empty state, a timestamp. On a glass surface,
          such as a Dialog, muted text turns a shade stronger, so it keeps its contrast whatever shows through.
        </li>
        <li>
          Bold words are <code>&lt;strong&gt;</code>, and code is <code>&lt;code&gt;</code>. The kit styles both
          native elements, so there is nothing to import for them. In muted text, a bold word takes the full text
          color, so it stands out as well as being heavier.
        </li>
        <li>
          The CSS styles every <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code> and inline{" "}
          <code>&lt;code&gt;</code>, so a static page gets the look with no JS. Every rule is wrapped in{" "}
          <code>:where()</code>, so its specificity is 0, as with Button.
        </li>
        <li>
          Text sets no margin. Space between paragraphs belongs to what holds them, such as a dialog's body.
        </li>
        <li>
          A size stays put on a phone. Catalyst's Text grows from 14px to 16px on small screens; here only controls
          grow for a finger, and an app screen sets sm where it's dense.
        </li>
      </ul>
      <p>
        A link inside text is Link, which gets its own spec. Catalyst's TextLink and Open Props UI's Anchor are
        the same thing: one underlined <code>&lt;a&gt;</code>, so the kit has one. Headings are Heading.
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
              <td><code>Text</code></td>
              <td><code>&lt;p&gt;</code></td>
              <td>
                The paragraph. <code>data-size</code> and <code>data-tone</code> carry the props, and are left out
                when the props are.
              </td>
            </tr>
            <tr>
              <td>Strong</td>
              <td><code>&lt;strong&gt;</code></td>
              <td>Weight 600. Full text color inside muted text.</td>
            </tr>
            <tr>
              <td>Code</td>
              <td><code>&lt;code&gt;</code></td>
              <td>
                Mono at 87.5% of the text around it, on a faint tint and hairline edge mixed from the text's own color.
                A long path breaks across lines rather than overflowing. A code block, <code>&lt;pre&gt;</code>, is
                left alone.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "size",
            type: '"sm" | "base" | "lg"',
            default: "none",
            description: (
              <>
                sm is 14px on 20px lines, base 16px on 24px, lg 18px on 28px. Left out, the paragraph inherits the size
                and line height of where it sits.
              </>
            ),
          },
          {
            name: "tone",
            type: '"default" | "muted"',
            default: '"default"',
            description: "Muted is the secondary text color, for copy that supports something else on the screen.",
          },
          { name: "children", type: "JSX.Element", description: "The text, with any strong, code or link inside it." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Text } from "beautiful-ui-solid";

<Text size="lg">Publish a whole site from one API call.</Text>
<Text tone="muted">Last published <strong>2 hours ago</strong>.</Text>`}</code>
      </pre>
      <p>
        Other attributes pass through to the <code>&lt;p&gt;</code>: <code>id</code>, <code>class</code>,{" "}
        <code>aria-*</code>. An <code>id</code> lets a dialog or a field point its <code>aria-describedby</code> at a
        Text.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        There is no APG pattern for text. The browser's semantics do it all.
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
              <td>Passes over a paragraph. A link inside one takes focus as usual.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read a paragraph as a paragraph, and move by paragraph with their own keys. Most don't announce bold
                or code by default, so neither may carry meaning the words don't: write "can't be undone", not just
                bold.
              </td>
            </tr>
            <tr>
              <td>Zoom and text size</td>
              <td>
                The sizes are in rem, so they follow the browser's text size. Text reflows at 400% zoom with no
                sideways scroll.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <p>Text has no interactive states. What changes it:</p>
      <ul>
        <li>
          <strong>Mode:</strong> the text colors are light and dark pairs. Default text is near-black on light and
          near-white on dark. Muted is zinc 600 on light and zinc 400 on dark, at least 7:1 on the canvas in both.
        </li>
        <li>
          <strong>Theme:</strong> on the page, classic and glass look the same: text is text. On a glass surface,
          muted text uses the surface's stronger shade (zinc 700 on light, zinc 200 on dark), as Dialog's
          description already does. Code's tint is mixed from the text color, so it reads on any surface.
        </li>
        <li>
          <strong>Long lines:</strong> the browser avoids a lone word on the last line where it supports{" "}
          <code>text-wrap: pretty</code>. A long word or URL breaks rather than overflowing.
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
            <tr><td><code>--text-sm</code>, <code>--text-base</code>, <code>--text-lg</code></td><td>0.875rem, 1rem, 1.125rem</td></tr>
            <tr><td><code>--leading-sm</code>, <code>--leading</code>, <code>--leading-lg</code></td><td>1.25rem, 1.5, 1.75rem. <code>--leading-sm</code> and <code>--leading-lg</code> are new.</td></tr>
            <tr><td><code>--color-text</code>, <code>--color-text-muted</code></td><td>the default and muted colors. A glass surface sets <code>--color-text-muted</code> to <code>--surface-text-muted</code> inside it.</td></tr>
            <tr><td><code>--font-mono</code></td><td>the system's mono font, for code</td></tr>
            <tr><td><code>--radius-sm</code></td><td>0.25rem, new, for code's corners</td></tr>
            <tr><td><code>--space-1</code></td><td>code's side padding</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code> and <code>&lt;code&gt;</code> work everywhere. The CSS uses{" "}
        <code>:where()</code>, <code>color-mix()</code> and <code>light-dark()</code>, in every current browser.{" "}
        <code>text-wrap: pretty</code> is in Chrome and Safari; Firefox wraps as usual without it.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Text for a paragraph component with no variants of its own, and its Strong and Code for bold
        words at the full text color and code on a faint tint with a hairline edge. Open Props UI's typography for
        small and large paragraph sizes, <code>text-wrap: pretty</code>, and zero-specificity rules.
      </p>

      <h2>Other examples</h2>
      <p>Static markup, the same markup the Solid component renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Body text" name="text/paragraph" />
      <Example title="Sizes" name="text/sizes" />
      <Example title="Muted" name="text/muted" />
      <Example title="In a dialog" name="text/glass" />

    </article>
  );
}
