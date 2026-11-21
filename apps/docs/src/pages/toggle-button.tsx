import { Example, PropsTable } from "../spec.tsx";

export default function ToggleButtonPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Toggle button</h1>
      <p class="lede">A button that stays pressed: turns a view, a filter or a setting on, and off again.</p>
      <Example title="Toggle button" hero name="toggle-button/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;button type="button"&gt;</code> with <code>aria-pressed</code>. The browser gives it
          its role, focus, and Enter and Space. The component flips <code>aria-pressed</code> on each click, the one
          thing the platform doesn't do.
        </li>
        <li>
          Its label stays the same when it's pressed, as APG asks: "Show drafts" is pressed or not, never "Hide
          drafts". Screen readers say the state. A button whose words change, such as Follow and Following, is a{" "}
          <a href="/button">Button</a>.
        </li>
        <li>
          Not pressed, it is a Button. Pressed, it sinks into the surface: a well like an{" "}
          <a href="/input">Input</a>'s, with a shade inside its top edge, tinted with its color. Raised or sunk is the
          state, so it doesn't rest on color alone.
        </li>
        <li>
          Two variants of Button's three. <strong>Secondary</strong> is the default, a raised pane.{" "}
          <strong>Tertiary</strong> is text only until it's pressed or hovered, for a row of quiet toggles above an
          editor. A primary toggle would have no pressed look of its own. Two colors: neutral, and accent for a toggle
          that should stand out once it's on, such as Live preview. Danger has no use here.
        </li>
        <li>
          It takes action at once and holds no form value, so it never goes in a form to be submitted. A setting that
          is saved with a form is a Switch or a Checkbox.
        </li>
        <li>
          The CSS styles every <code>&lt;button aria-pressed&gt;</code>, so a static page gets the look with no JS.
          Every rule is wrapped in <code>:where()</code>, so its specificity is 0, and Toggle group restyles its
          buttons with any selector.
        </li>
      </ul>
      <p>
        A row of toggles where one or several are pressed, such as Bold, Italic and Underline, or a segmented control,
        is Toggle group, which gets its own spec and adds the arrow keys. An icon-only toggle takes an{" "}
        <code>aria-label</code> and <code>data-icon-button</code>, which make it square as on{" "}
        <a href="/icon-button">Icon button</a>.
      </p>

      <h2>Anatomy</h2>
      <p>One element, as Button. An icon is an <code>&lt;svg&gt;</code> child before or after the text.</p>
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
              <td><code>ToggleButton</code></td>
              <td>
                <code>&lt;button type="button" aria-pressed="true|false"&gt;</code>
              </td>
              <td>
                The button and its state. <code>data-variant</code> and <code>data-color</code> carry the props, and are
                left out at their defaults, as on Button.
              </td>
            </tr>
            <tr>
              <td>An icon</td>
              <td>
                <code>&lt;svg aria-hidden="true"&gt;</code>
              </td>
              <td>Sized to the text, as on Button.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "pressed",
            type: "boolean",
            default: "none",
            description: (
              <>
                Whether it's pressed, when the page owns the state. With it, a click calls <code>onChange</code> and
                the button shows what <code>pressed</code> says.
              </>
            ),
          },
          {
            name: "defaultPressed",
            type: "boolean",
            default: "false",
            description: (
              <>
                Whether it starts pressed, when the button owns the state. A click flips it, then calls{" "}
                <code>onChange</code>.
              </>
            ),
          },
          {
            name: "onChange",
            type: "(pressed: boolean) => void",
            default: "none",
            description: "Called on each click with the new state.",
          },
          {
            name: "variant",
            type: '"secondary" | "tertiary"',
            default: '"secondary"',
            description: "Secondary is a raised pane. Tertiary is text only until pressed or hovered.",
          },
          {
            name: "color",
            type: '"neutral" | "accent"',
            default: '"neutral"',
            description: "The tint of the well when pressed, and the text's color. Accent is the product's color.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "The native disabled. It keeps its pressed or unpressed look, faded.",
          },
          { name: "children", type: "JSX.Element", description: "The label, with an optional icon. It never changes with the state." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { ToggleButton } from "beautiful-ui-solid";

<ToggleButton defaultPressed onChange={(on) => showDrafts(on)}>Show drafts</ToggleButton>
<ToggleButton pressed={preview()} onChange={setPreview} color="accent">Live preview</ToggleButton>`}</code>
      </pre>
      <p>
        Other attributes pass through to the <code>&lt;button&gt;</code>: <code>onClick</code>,{" "}
        <code>aria-label</code>, <code>aria-controls</code>, <code>title</code>. It has no <code>type</code> and no{" "}
        <code>href</code>: it is always a <code>type="button"</code>, and a link can't be pressed.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/button/">APG button pattern</a>, for a toggle
        button.
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
                <kbd>Enter</kbd>, <kbd>Space</kbd>
              </td>
              <td>Flip the state, as a click does. Space flips it when the key comes up, as on any button.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce a toggle button, named by its text, and whether it's pressed: "Show drafts, toggle button,
                pressed". Each flip announces the new state. The icon is hidden from them.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Not pressed:</strong> a <a href="/button">Button</a> of the same variant and color, with its hover
          and press.
        </li>
        <li>
          <strong>Pressed:</strong> sunk into the surface. The field's fill and edge, a shade inside the top edge, and
          a tint of its color, gray for neutral and blue for accent: 12% in light mode, and 20% in dark mode, where the
          well is darker than the raised pane beside it and needs more to stand clear. No drop shadow, and on glass no rim or hotspot: a
          sunk button is out of the light. Its text stays in its color, a shade further from the tint (deeper in light mode, paler in dark), so it keeps 4.5:1 on the tint, hovered and over bright content. The fill, edge and text ease over 120ms, and the shade inside snaps in with them.
        </li>
        <li>
          <strong>Hover:</strong> not pressed, as Button. Pressed, the tint deepens by 6%. Only where the pointer can
          hover.
        </li>
        <li>
          <strong>Held down:</strong> 98% of its size, as Button, and a pressed one's tint deepens by 12%. With reduced motion
          it only darkens.
        </li>
        <li>
          <strong>Focus:</strong> the kit's ring, 2px of the accent color 2px outside the edge, from the keyboard
          only.
        </li>
        <li>
          <strong>Disabled:</strong> half opacity, with no hover or press. It keeps its state, so a disabled toggle
          still shows whether it's on.
        </li>
        <li>
          <strong>Touch:</strong> 44px tall with 16px text, as Button.
        </li>
        <li>
          <strong>Themes:</strong> classic sinks into an opaque well. On glass a pressed toggle is frosted like an
          Input, and its lower lip catches the light as a hairline, so it reads as pressed into the glass beside the
          raised panes. Glass falls back to classic where the browser lacks <code>backdrop-filter</code> and where
          the user asks for reduced transparency.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
      <p>
        Toggle button reads Button's tokens at rest. Pressed, it reads the <code>--field-*</code> tokens Input reads,
        so a theme draws a well once for both.
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
            <tr><td>Button's <code>--control-*</code> tokens</td><td colspan="2">Not pressed, as on <a href="/button">Button</a></td></tr>
            <tr><td><code>--field-fill</code>, <code>--field-edge</code></td><td>white, or a faint light tint in dark mode, with a gray edge</td><td>frosted like a secondary Button, with a faint edge</td></tr>
            <tr><td><code>--field-shadow</code></td><td>a shade inside the top edge</td><td>a deeper shade inside, and a light hairline on the lower lip</td></tr>
            <tr><td><code>--toggle-tint</code>, <code>--toggle-tint-dark</code></td><td colspan="2">12% of the color in the well in light mode, 20% in dark (modern: 12%). Root tokens a theme sets.</td></tr>
            <tr><td><code>--toggle-tint-extra</code></td><td colspan="2">Added to the tint: 6% on hover, 12% held down</td></tr>
            <tr><td><code>--motion-quick</code></td><td colspan="2">120ms, for the press and the change of state</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;button&gt;</code> and <code>aria-pressed</code> work everywhere, and every current screen reader
        announces the state. The CSS is Button's, plus <code>color-mix()</code> for the tint. Glass needs{" "}
        <code>backdrop-filter</code> and falls back to classic without it.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's ToggleButton for the component and a tint of the primary color when pressed. It wraps a hidden
        checkbox in a <code>&lt;label&gt;</code>, which works with no JS and submits in a form, but it's two elements
        and a screen reader calls it a checkbox. Here it's one <code>&lt;button&gt;</code>, as APG specifies, and a
        form's setting is a Switch or Checkbox. Catalyst and Headless UI have no toggle button: Headless UI's Switch
        gives the <code>pressed</code>, <code>defaultPressed</code> and <code>onChange</code> shape (its{" "}
        <code>checked</code>, <code>defaultChecked</code> and <code>onChange</code>). APG for the role, the keys, and
        the label that stays the same.
      </p>

      <h2>Other examples</h2>
      <p>
        Each is the Solid component, live. Click one to flip it. Switch the theme and mode at the top.
      </p>
      <Example title="Glass over bright content" name="toggle-button/glass" />
      <Example title="Secondary, the default" name="toggle-button/secondary" />
      <Example title="Accent" name="toggle-button/accent" />
      <Example title="Tertiary, in a row above an editor" name="toggle-button/tertiary" />
      <Example title="With an icon" name="toggle-button/icons" />
      <Example title="Disabled, pressed and not" name="toggle-button/disabled" />
    </article>
  );
}
