import { Example, PropsTable } from "../spec.tsx";

export default function ButtonPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Button</h1>
      <p class="lede">Starts an action: saves, publishes, opens a dialog, or confirms one.</p>
      <Example title="Button" hero name="button/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;button&gt;</code>. The browser gives it its role, focus, and Enter and Space. The
          component adds no JS behavior.
        </li>
        <li>
          Its <code>type</code> defaults to <code>"button"</code>, as in Headless UI. The browser's default is{" "}
          <code>"submit"</code>, so a button dropped into a form would submit it by surprise. A submit button says{" "}
          <code>type="submit"</code>.
        </li>
        <li>
          With <code>href</code> it renders <code>&lt;a data-button&gt;</code> instead: a link that looks like a
          button, for an action that goes to another page. Screen readers call it a link, which is what it is.
        </li>
        <li>
          Three variants, named for the button's role rather than its look, so a theme can change the look:{" "}
          <strong>primary</strong> for the one main action on a screen or in a dialog, <strong>secondary</strong>{" "}
          for every other action, and <strong>tertiary</strong> for quiet ones, such as Cancel in a toolbar.
          Secondary is the default, so a bare <code>&lt;button&gt;</code> is never louder than it should be. Three
          colors: neutral, accent, and danger for an action that destroys something.
        </li>
        <li>
          One size. Where the pointer is a finger, it is 44px tall with 16px text. Where it is a mouse, it is 36px
          with 14px text.
        </li>
        <li>
          The CSS styles every <code>&lt;button&gt;</code>, so a static page gets the look with no JS. Every rule is
          wrapped in <code>:where()</code>, so its specificity is 0. A component built from a{" "}
          <code>&lt;button&gt;</code>, such as a tab or a menu item, restyles it with any selector.
        </li>
      </ul>
      <p>
        A button with only an icon is Icon button, which gets its own spec. A button that
        stays pressed is Toggle button.
      </p>

      <h2>Anatomy</h2>
      <p>One element. An icon is an <code>&lt;svg&gt;</code> child before or after the text.</p>
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
              <td><code>Button</code></td>
              <td>
                <code>&lt;button type="button"&gt;</code>, or <code>&lt;a data-button&gt;</code> with{" "}
                <code>href</code>
              </td>
              <td>
                The button. <code>data-variant</code>, <code>data-color</code> and <code>data-shape</code> carry the props, and are left out
                at their defaults.
              </td>
            </tr>
            <tr>
              <td>An icon</td>
              <td>
                <code>&lt;svg aria-hidden="true"&gt;</code>
              </td>
              <td>Sized to the text: 16px, or 20px for a finger. It takes the text's color.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "variant",
            type: '"primary" | "secondary" | "tertiary"',
            default: '"secondary"',
            description:
              "Primary fills with the color, for the main action. Secondary is a raised pane with the text in the color, for the others. Tertiary is text only until hovered, for quiet actions.",
          },
          {
            name: "color",
            type: '"neutral" | "accent" | "danger"',
            default: '"neutral"',
            description: (
              <>
                Neutral is near-black in light mode and gray in dark mode. Accent is the app's brand color. Danger is
                red, for an action that deletes or can't be undone.
              </>
            ),
          },
          {
            name: "shape",
            type: '"rounded" | "pill"',
            default: '"rounded"',
            description:
              "Rounded corners, or a pill with round ends, for a row of light actions such as suggested prompts. An Icon button that is a pill is a circle. The glass rim and its glint follow the shape. In a Button group the group sets the corners, so a pill there keeps the group's.",
          },
          {
            name: "type",
            type: '"button" | "submit" | "reset"',
            default: '"button"',
            description: (
              <>
                As on <code>&lt;button&gt;</code>, with a safer default. Not allowed with <code>href</code>.
              </>
            ),
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: (
              <>
                The native <code>disabled</code>. Not allowed with <code>href</code>: a link can't be disabled, so
                leave it out or render a button.
              </>
            ),
          },
          {
            name: "href",
            type: "string",
            default: "none",
            description: (
              <>
                Renders <code>&lt;a href data-button&gt;</code>. The types allow <code>href</code> or{" "}
                <code>type</code> and <code>disabled</code>, never both.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The label, with an optional icon." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Button } from "beautiful-ui-solid";

<Button variant="primary" color="accent" onClick={publish}>Publish</Button>
<Button href="/pricing">See pricing</Button>`}</code>
      </pre>
      <p>
        Other attributes pass through to the element: <code>onClick</code>, <code>value</code>,{" "}
        <code>commandfor</code>, <code>autofocus</code>, <code>aria-*</code>.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/button/">APG button pattern</a>. The browser does
        all of it for a <code>&lt;button&gt;</code> and an <code>&lt;a href&gt;</code>.
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
                <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd>
              </td>
              <td>Move focus to and from the button. A disabled button is skipped.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>Activates the button, or follows the link.</td>
            </tr>
            <tr>
              <td>
                <kbd>Space</kbd>
              </td>
              <td>
                Activates a button when the key comes up. On a link it scrolls the page, as on any link: APG gives
                links Enter only.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce a button, or a link with <code>href</code>, named by its text. The icon is hidden from them.
                A disabled button is announced as dimmed or unavailable when reached by reading, though Tab skips
                it.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Rest:</strong> as the variant and color set it.
        </li>
        <li>
          <strong>Hover:</strong> primary darkens by 8%, so its white text keeps its contrast; secondary and tertiary take a tint of their color. Only where the
          pointer can hover, so a tap on a phone doesn't leave a button lit.
        </li>
        <li>
          <strong>Pressed:</strong> a shade darker, and 98% of its size, as if pushed in, over 120ms. With reduced
          motion it only darkens.
        </li>
        <li>
          <strong>Focus:</strong> the kit's ring, 2px of the accent color 2px outside the edge, from the keyboard
          only.
        </li>
        <li>
          <strong>Disabled:</strong> half opacity, the default cursor, and no hover or press.
        </li>
        <li>
          <strong>Touch:</strong> where the main pointer is coarse, 44px tall with 16px text and 20px icons, the
          size Apple and WCAG's enhanced target size ask for.
        </li>
        <li>
          <strong>Themes:</strong> classic is flat: an opaque fill, a 1px edge a shade darker than a primary fill, and a
          small shadow. Glass catches the light the Dialog panel does, from the upper right: a sheen across the
          fill, a hairline rim brightest along the top, and a hotspot toward the right of the top edge. A faint dark
          halo with no offset surrounds a pane in light mode, so the glint stands out, and a button's rim is 1px there, as thick
          as its border, because a hairline of white is lost on a light page. Dark mode keeps a hairline of one device pixel. The glint and the sheen stay in
          the corner of a wide button: their size is capped in rem, and they sit a capped distance from its right edge. A primary
          button is tinted glass: the full-strength color at 85%, blurred like the secondary pane, so it is a
          little lighter on a light page and a little darker on a dark one. Accent starts a shade deeper in both
          modes, and danger in light mode, and a primary has no sheen, so white text keeps 4.5:1 over a white page
          and over bright content. Both share a soft shadow, lighter than a Card's, cast down and to the left, away from the light. A secondary button is a pane of frosted glass
          (12px blur over 70% white in light mode, 75% near-black in dark), and its accent and danger text is a
          step further from the glass than classic's, so it keeps 4.5:1 over bright content. Tertiary has no glass until hovered. Glass falls back to
          classic where the browser lacks <code>backdrop-filter</code> and where the user asks for reduced
          transparency.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
      <p>
        Button reads these. A theme sets the <code>--control-*</code> tokens, which the form fields will read too.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Classic</th>
              <th>Glass</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>--control-height</code></td><td colspan="2">2.25rem, or 2.75rem for a coarse pointer</td></tr>
            <tr><td><code>--control-pad-x</code></td><td colspan="2"><code>--space-3</code>, or <code>--space-4</code> for a coarse pointer</td></tr>
            <tr><td><code>--control-font-size</code>, <code>--control-icon</code></td><td colspan="2">0.875rem and 1rem, or 1rem and 1.25rem for a coarse pointer</td></tr>
            <tr><td><code>--color-neutral-fill</code>, <code>--color-accent-fill</code>, <code>--color-danger-fill</code></td><td>the primary fills, with accent and danger a little muted so they don't glare</td><td>full-strength accent and danger, a shade deeper: accent in both modes, danger in light mode</td></tr>
            <tr><td><code>--control-primary-opacity</code></td><td>100%</td><td>85%. With the fills, white text keeps 4.5:1 over a white page and bright content in both modes.</td></tr>
            <tr><td><code>--color-text</code>, <code>--color-accent</code>, <code>--color-danger</code></td><td>the text of secondary and tertiary</td><td>the same, with accent and danger deeper in light mode and paler in dark</td></tr>
            <tr><td><code>--control-fill</code>, <code>--control-pane-edge</code></td><td>the raised color, a gray edge (<code>--control-edge</code>)</td><td>70% white or 75% near-black, a card's clear edge</td></tr>
            <tr><td><code>--control-primary-border-opacity</code>, <code>--control-primary-clip</code></td><td>100%, border-box: the border draws a primary's edge</td><td>the same in dark mode. In light mode 0% and padding-box: the rim paints the edge color under its light, so no colored fringe shows past the glint</td></tr>
            <tr><td><code>--control-blur</code>, <code>--control-saturate</code></td><td>0, 100%</td><td>12px, 180%</td></tr>
            <tr><td><code>--control-sheen</code></td><td>none</td><td>a glow from the upper right, on secondary only</td></tr>
            <tr><td><code>--control-rim</code>, <code>--control-hotspot</code></td><td>none</td><td>Dialog's rim and hotspot, at a button's size</td></tr>
            <tr><td><code>--control-rim-scale</code></td><td>one device pixel</td><td>the same in dark mode, and 1 in light mode: a rim as thick as the border</td></tr>
            <tr><td><code>--control-shadow</code></td><td>a 1px shadow</td><td>depth 1, <code>--shadow-1</code>, in both themes (<a href="/shadows">Shadows</a>)</td></tr>
            <tr><td><code>--button-radius</code></td><td colspan="2"><code>--radius-md</code>, 0.5rem, or <code>--radius-full</code> for <code>data-shape="pill"</code>. For any other corner set it, not <code>border-radius</code>: the rim and its glint follow it.</td></tr>
            <tr><td><code>--motion-quick</code></td><td colspan="2">120ms, for hover and press</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;button&gt;</code> works everywhere. The CSS uses <code>:where()</code>, <code>color-mix()</code>,{" "}
        <code>light-dark()</code>, and the <code>pointer</code> and <code>hover</code> media queries, all in every
        current browser. The rim's mask needs <code>mask-composite: exclude</code>, which every current browser has.
        Glass needs <code>backdrop-filter</code> and falls back to classic without it.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Button for three levels of emphasis (its solid, outline and plain), a color prop, rendering a link with{" "}
        <code>href</code>, one size that grows to 44px on touch screens, and icons beside the text. Headless UI's
        Button for <code>type="button"</code> by default and the native <code>disabled</code>; its hover, focus and
        active data attributes are CSS pseudo-classes here. Open Props UI's Button for zero-specificity rules and
        hover and press colors mixed from the button's color. APG for the keys and the role.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Glass over bright content" name="button/glass" />
      <Example title="Primary, in each color" name="button/primary" />
      <Example title="Secondary, the default" name="button/secondary" />
      <Example title="Tertiary" name="button/tertiary" />
      <Example title="With an icon" name="button/icons" />
      <Example title="A link that looks like a button" name="button/link" />
      <Example title="Disabled" name="button/disabled" />
      <Example title="A pill" name="button/pill" />
    </article>
  );
}
