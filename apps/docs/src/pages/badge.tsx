import { Example, PropsTable } from "../spec.tsx";

export default function BadgePage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Badge</h1>
      <p class="lede">A short label on something: its status, its category, or a count.</p>
      <Example title="Badge" hero name="badge/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It labels the thing beside it: <em>Paid</em> on an invoice, <em>Live</em> on a site, <em>Beta</em> on a
          feature, <em>12 new</em> on a list. One to three words, or a number.
        </li>
        <li>
          It is text, not a control. It can't be focused or pressed, so a reader never wonders whether to click it. A
          label you can press, remove or pick is a Chip.
        </li>
        <li>
          It comes in ten colors, named for their hue as in Catalyst: neutral (the default), accent, red, orange,
          yellow, green, teal, blue, purple and pink. The colors are the kit's tints, which Chip shares, so a filter
          chip and the badge it filters for match.
        </li>
        <li>
          The soft look is a wash of the hue with its words in a deep shade of it, and a hairline of the hue around
          it. The strong look is the hue at full strength, for the one label on a screen that should stand out, such
          as a plan.
        </li>
        <li>
          A dot before the words marks a status that changes, such as a site's <em>Live</em> or <em>Building</em>.
        </li>
        <li>
          It comes in one size, the height of a line of small text (20px), with 4px corners, so it sits in a
          sentence, a table row or a heading without stretching the line, and lines up on the words' baseline.
        </li>
        <li>
          Its words carry the meaning, so color is never the only signal. Numbers are tabular, so a count that ticks
          from 9 to 10 doesn't jiggle its neighbors.
        </li>
        <li>
          The CSS styles every <code>&lt;beautiful-badge&gt;</code>, so a static page gets the look with no JS. Every
          rule is wrapped in <code>:where()</code>, so its specificity is 0.
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
              <td><code>Badge</code></td>
              <td><code>&lt;beautiful-badge&gt;</code></td>
              <td>
                The label. No element means "label", so it is the kit's own, with no shadow DOM.{" "}
                <code>data-color</code>, <code>data-variant</code> and <code>data-dot</code> carry the props, and each
                is left out at its default.
              </td>
            </tr>
            <tr>
              <td>Dot</td>
              <td><code>::before</code></td>
              <td>Only with <code>dot</code>. A circle half the text's size, in the hue at full strength.</td>
            </tr>
            <tr>
              <td>Icon</td>
              <td>an <code>&lt;svg&gt;</code> child</td>
              <td>Optional. Sized to the words (12px) and drawn in their color.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "color",
            type: '"neutral" | "accent" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"',
            default: '"neutral"',
            description: "The hue. Accent follows the theme's accent color, so it changes with an app's brand.",
          },
          {
            name: "variant",
            type: '"soft" | "strong"',
            default: '"soft"',
            description: "Strong is the hue at full strength. Use it for the one label on a screen that should stand out.",
          },
          {
            name: "dot",
            type: "boolean",
            default: "false",
            description: "A dot of the hue before the words, for a status.",
          },
          { name: "children", type: "JSX.Element", description: "The words, a number, or an icon and words." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Badge } from "beautiful-ui-solid";

<Badge color="green">Paid</Badge>
<Badge color="green" dot>Live</Badge>
<Badge color="green" variant="strong">Pro</Badge>`}</code>
      </pre>
      <p>
        Other attributes pass through to the <code>&lt;beautiful-badge&gt;</code>: <code>id</code>,{" "}
        <code>class</code>, <code>title</code>, <code>data-*</code>, and event handlers.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        No APG pattern covers a badge: it is text, and it reads as text. It takes no focus, so Tab passes over it.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Case</th>
              <th>Behavior</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Reading order</td>
              <td>
                Read with the text around it, with no role: "Spring launch, Live". Put it after the thing it labels,
                so the name comes first.
              </td>
            </tr>
            <tr>
              <td>A count on its own</td>
              <td>
                "12" alone means nothing out loud, so write "12 new". An <code>aria-label</code> doesn't help: a badge has
                no role, and screen readers ignore a label on an element with none.
              </td>
            </tr>
            <tr>
              <td>A status that changes while you look</td>
              <td>
                A badge doesn't announce itself. When a site goes from <em>Building</em> to <em>Live</em> on screen,
                the page puts the badge in a <code>role="status"</code> region, or shows a Toast.
              </td>
            </tr>
            <tr>
              <td>Color and the dot</td>
              <td>
                Neither is read out. The words say it all, so a reader who can't tell red from green loses nothing.
              </td>
            </tr>
            <tr>
              <td>Forced colors</td>
              <td>The fill and the hairline drop out, and a 1px outline in the text color keeps its shape.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <p>
        A badge has no hover, press, focus or disabled state: it is never a control. A label that responds to the
        pointer is a Chip.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Look</th>
              <th>Light</th>
              <th>Dark</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Soft</td>
              <td>The hue's 500 at 12%, its words in the 800, a hairline of the 500 at 20%.</td>
              <td>The 500 at 15%, words in the 300, hairline at 24%.</td>
            </tr>
            <tr>
              <td>Strong</td>
              <td colspan={2}>
                The same in both modes. Red, blue, purple, pink, neutral and accent are deep, with white words. Orange,
                yellow, green and teal are bright, the 400 with the hue's 950 on it, so a strong yellow stays yellow rather than turning brown.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        Every pair holds 4.5:1 on the canvas, on a raised surface, and on a glass panel in either mode.{" "}
        <strong>Glass.</strong> A badge has no blur of its own: the wash is already see-through. It catches the light
        along its top edge as a faint hairline, as a control's rim does. With reduced transparency, or in classic, the
        hairline is gone.
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
            <tr>
              <td>
                <code>--tint-fill</code>, <code>--tint-ink</code>, <code>--tint-edge</code>
              </td>
              <td>
                the soft look, set on each badge by <code>data-color</code> (<code>styles/tints.css</code>). Chip reads
                the same ones.
              </td>
            </tr>
            <tr>
              <td>
                <code>--tint-solid</code>, <code>--tint-on-solid</code>
              </td>
              <td>the strong look. Neutral, accent and red reuse the kit's fills, as a primary Button does.</td>
            </tr>
            <tr><td><code>--tint</code></td><td>the hue itself: the dot</td></tr>
            <tr><td><code>--badge-highlight</code></td><td>the light along the top edge. Glass only.</td></tr>
            <tr><td><code>--text-xs</code>, <code>--leading-sm</code></td><td>12px words on a 20px line</td></tr>
            <tr><td><code>--space-2</code>, <code>--space-1</code></td><td>8px each side, 4px between an icon or dot and the words</td></tr>
            <tr><td><code>--radius-sm</code></td><td>0.25rem (4px)</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>light-dark()</code>, <code>color-mix()</code> and custom elements without a definition work in every
        current browser.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Badge for the hue names, a soft wash with deep words, and one small size that lines up with text.
        Open Props UI's Badge for a strong, filled look next to the soft one. WCAG 1.4.1 for never leaning on color
        alone, and 1.4.3 for every pair's 4.5:1.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Colors" name="badge/colors" />
      <Example title="Strong" name="badge/strong" />
      <Example title="Status, with a dot" name="badge/status" />
      <Example title="In a table" name="badge/table" />
      <Example title="In text and headings" name="badge/text" />
      <Example title="In a dialog, on glass" name="badge/dialog" />
    </article>
  );
}
