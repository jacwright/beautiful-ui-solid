import { Example, PropsTable } from "../spec.tsx";

export default function HeadingPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Heading</h1>
      <p class="lede">The title of a page or a section, at the level its place in the page calls for.</p>
      <Example title="Heading" hero name="heading/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>. It adds no behavior: a heading isn't
          focusable, and screen readers list it in the page's outline and jump between headings with one key.
        </li>
        <li>
          <code>level</code> picks the element, and it is the outline: 1 for the page's title, 2 for its sections, 3
          for a section inside one. It defaults to 1, as Catalyst's does.
        </li>
        <li>
          Each level has a size of its own: <strong>h1</strong> is 24px, <strong>h2</strong> 20px, and{" "}
          <strong>h3 to h6</strong> 16px, all in weight 600. So most headings need no <code>size</code> at all.
        </li>
        <li>
          <code>size</code> sets the look without touching the level, so the outline never bends to fit a design. A
          landing page's headline is still its <code>h1</code>, at <strong>display</strong>. A section title in a
          dense card is still an <code>h2</code>, at <strong>sm</strong>. Five sizes: <strong>sm</strong>,{" "}
          <strong>md</strong>, <strong>lg</strong>, <strong>xl</strong> and <strong>display</strong>.
        </li>
        <li>
          Display is for marketing pages, and is the one size that scales with the screen: 36px on a phone, up to
          48px on a wide one, in weight 700. A 48px headline on a phone would break every second word. The other
          sizes stay put on a phone, as Text's do.
        </li>
        <li>
          From 24px up, the letters are drawn a little tighter, so large type reads as words rather than spaced-out
          letters. A heading that wraps evens out its lines, so it doesn't leave one word on its own.
        </li>
        <li>
          The CSS styles every <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>, so a static page gets the look
          with no JS. Every rule is in <code>:where()</code>, so its specificity is 0, as with Text. A component
          that owns its heading, such as Dialog's title, keeps its own look.
        </li>
        <li>
          Heading sets no margin. The space around it belongs to what holds it. A dialog's body now leaves 20px
          above a heading and 12px under it, so a heading sits with the section it starts.
        </li>
      </ul>
      <p>
        Catalyst also has Subheading, an <code>h2</code> at 16px. Here that is{" "}
        <code>&lt;Heading level={"{2}"} size="sm"&gt;</code>, so the kit has one component for one element, as with
        Link. The line under a page's title is Text at <code>size="lg"</code>.
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
              <td>
                <code>Heading</code>
              </td>
              <td>
                <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>
              </td>
              <td>
                The heading, at its <code>level</code>. <code>data-size</code> carries <code>size</code>, and is left
                out when the prop is, so the markup matches a hand-written heading.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "level",
            type: "1 | 2 | 3 | 4 | 5 | 6",
            default: "1",
            description: "The element, h1 to h6, and the heading's place in the page's outline.",
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg" | "xl" | "display"',
            default: "the level's",
            description: (
              <>
                sm is 16px on 24px lines, md 20px on 28px, lg 24px on 32px, xl 30px on 36px, and display 36px to 48px
                on lines 1.1 times its size. Left out, h1 is lg, h2 is md, and h3 to h6 are sm.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The heading's words." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Heading } from "beautiful-ui-solid";

<Heading>Spring launch</Heading>
<Heading level={2}>Domains</Heading>
<Heading size="display">Launch the spring collection</Heading>`}</code>
      </pre>
      <p>
        Other attributes pass through to the heading: <code>id</code>, <code>class</code>, <code>aria-*</code>. An{" "}
        <code>id</code> lets a section or a dialog name itself with <code>aria-labelledby</code>, and lets a link
        jump to the heading.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>There is no APG pattern for a heading. The browser's semantics do it all.</p>
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
              <td>Passes over a heading. A link inside one takes focus as usual.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce the heading with its level, "Domains, heading level 2", and list every heading in the page's
                outline. <kbd>H</kbd> in NVDA and JAWS, and the rotor in VoiceOver, move from one heading to the next,
                and <kbd>1</kbd> to <kbd>6</kbd> to the next at that level. That outline is why level and size are
                apart: skipping from h1 to h3 for a smaller look leaves a gap in it.
              </td>
            </tr>
            <tr>
              <td>Zoom and text size</td>
              <td>
                The sizes are in rem, so they follow the browser's text size. A long heading wraps at 400% zoom with
                no sideways scroll, and a long word breaks rather than overflowing.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <p>Heading has no interactive states. What changes it:</p>
      <ul>
        <li>
          <strong>Mode:</strong> a heading takes the color of the text around it: near-black on light and near-white
          on dark, well over 7:1 on the canvas in both.
        </li>
        <li>
          <strong>Theme:</strong> classic and glass look the same: a heading is text. On a glass surface, such as a
          Dialog, it keeps the full text color, which reads over anything showing through.
        </li>
        <li>
          <strong>Long headings:</strong> lines even out where the browser supports{" "}
          <code>text-wrap: balance</code>. A long word or URL breaks rather than overflowing.
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
                <code>--text-base</code>, <code>--leading</code>
              </td>
              <td>sm: 1rem, 1.5</td>
            </tr>
            <tr>
              <td>
                <code>--text-xl</code>, <code>--leading-xl</code>
              </td>
              <td>md: 1.25rem, 1.75rem. New.</td>
            </tr>
            <tr>
              <td>
                <code>--text-2xl</code>, <code>--leading-2xl</code>
              </td>
              <td>lg: 1.5rem, 2rem. New.</td>
            </tr>
            <tr>
              <td>
                <code>--text-3xl</code>, <code>--leading-3xl</code>
              </td>
              <td>xl: 1.875rem, 2.25rem. New.</td>
            </tr>
            <tr>
              <td>
                <code>--text-display</code>, <code>--leading-display</code>
              </td>
              <td>display: 2.25rem to 3rem with the screen's width, 1.1. New.</td>
            </tr>
            <tr>
              <td>
                <code>--tracking-tight</code>, <code>--tracking-tighter</code>
              </td>
              <td>-0.01em for lg and xl, -0.02em for display. New.</td>
            </tr>
            <tr>
              <td>
                <code>--color-text</code>
              </td>
              <td>the page's text color, which a heading inherits rather than sets</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> work everywhere. The CSS uses <code>:where()</code> and{" "}
        <code>clamp()</code>, in every current browser. <code>text-wrap: balance</code>{" "}
        is in every current browser too; an older one wraps as usual.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Heading for a <code>level</code> prop that defaults to 1 and a 600 weight at the text color, and
        its Subheading for a smaller section title. The size steps and their line heights follow the type scale
        Catalyst is drawn in, so a screen built on this kit and a Catalyst one set side by side line up.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Page title" name="heading/page" />
      <Example title="Levels" name="heading/levels" />
      <Example title="Sizes" name="heading/sizes" />
      <Example title="Landing page" name="heading/glass" />
      <Example title="In a dialog" name="heading/dialog" />
    </article>
  );
}
