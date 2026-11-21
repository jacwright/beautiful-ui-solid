import { Example, PropsTable } from "../spec.tsx";

export default function DividerPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Divider</h1>
      <p class="lede">A hairline that sets one section apart from the next.</p>
      <Example title="Divider" hero name="divider/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;hr&gt;</code>: a 1px line across the width of what holds it. It adds no behavior.
        </li>
        <li>
          The line is a tint of the text around it, 10% of its color, so it reads on the canvas, in a dialog and on a
          pane of glass, in light and dark mode, with no color to pick.
        </li>
        <li>
          <code>soft</code> halves the tint to 5%, for a line inside a section, such as between the rows of a short
          list. A section and the next take the full line.
        </li>
        <li>
          On glass, the line is a groove cut in the pane: a second hairline under it catches the light, as a field's
          lower lip does. In dark mode the groove is a shadow, darker than the glass, since a tint of the light text
          would read as a ridge. Classic draws the one line.
        </li>
        <li>
          <code>orientation="vertical"</code> stands the line up between things side by side, such as two groups of
          buttons in a toolbar. It fills the height of its row, and is at least a line tall.
        </li>
        <li>
          Divider sets no margin, as Heading doesn't: the space around it belongs to what holds it, usually a{" "}
          <code>gap</code>. A dialog's body gives a Divider 20px above and below, the room it gives a heading that
          starts a section.
        </li>
        <li>
          The CSS styles every <code>&lt;hr&gt;</code>, so a static page gets the look with no JS. Every rule is in{" "}
          <code>:where()</code>, so its specificity is 0. A Dropdown's line between its groups is a Divider too, set
          in to its items' text.
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
                <code>Divider</code>
              </td>
              <td>
                <code>&lt;hr&gt;</code>
              </td>
              <td>
                The line. <code>data-soft</code> carries <code>soft</code>, and <code>aria-orientation</code> a vertical
                line. Both are left out by default, so the markup matches a hand-written <code>&lt;hr&gt;</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "soft",
            type: "boolean",
            default: "false",
            description: "A fainter line, 5% of the text color instead of 10%, for inside a section.",
          },
          {
            name: "orientation",
            type: '"horizontal" | "vertical"',
            default: '"horizontal"',
            description: (
              <>
                vertical stands the line up between things side by side, and tells screen readers so with{" "}
                <code>aria-orientation</code>.
              </>
            ),
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Divider } from "beautiful-ui-solid";

<Divider />
<Divider soft />
<Divider orientation="vertical" />`}</code>
      </pre>
      <p>
        Other attributes pass through to the <code>&lt;hr&gt;</code>: <code>id</code>, <code>class</code>,{" "}
        <code>role</code>. A line that is only decoration, where headings already mark each section, can take{" "}
        <code>role="presentation"</code> so screen readers pass over it, as Catalyst's does by default.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        APG's separator role, in its static form: a Divider is never focused and has no keys. The browser gives{" "}
        <code>&lt;hr&gt;</code> the role.
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
              <td>Passes over a Divider.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce "separator" where the line is, so a listener hears the break a reader sees. A vertical one has{" "}
                <code>aria-orientation="vertical"</code>, so it is read as one in a toolbar.
              </td>
            </tr>
            <tr>
              <td>Forced colors</td>
              <td>
                Windows High Contrast draws the line in its own border color, so it still shows. The lit edge on glass
                drops out with every other shadow.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <p>Divider has no interactive states. What changes it:</p>
      <ul>
        <li>
          <strong>Mode:</strong> the tint follows the text, so the line is a light gray on a light page and a dark gray
          on a dark one.
        </li>
        <li>
          <strong>Theme:</strong> glass adds the lit edge under the line, or beside a vertical one, and in dark mode
          draws the line as a shadow. Glass falls back to classic's single line where the user asks for reduced
          transparency.
        </li>
        <li>
          <strong>Surface:</strong> the line takes the text color of the surface it sits on, a dialog's or a popup's,
          so it holds on whatever shows through the glass.
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
                <code>--hairline-width</code>
              </td>
              <td>1px. New.</td>
            </tr>
            <tr>
              <td>
                <code>--color-hairline</code>
              </td>
              <td>10% of the text color. Glass's dark mode: black at 50%. New.</td>
            </tr>
            <tr>
              <td>
                <code>--color-hairline-soft</code>
              </td>
              <td>5% of the text color. Glass's dark mode: black at 30%. New.</td>
            </tr>
            <tr>
              <td>
                <code>--hairline-lit</code>
              </td>
              <td>
                The lit edge: none in classic, white at 70% in glass's light mode and 8% in its dark mode. New, set by
                the theme.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;hr&gt;</code> works everywhere. The tint uses <code>color-mix()</code>, in every current browser.
      </p>

      <h2>Not in this spec</h2>
      <ul>
        <li>
          <strong>A label on the line</strong>, such as "or" between two ways to sign in. An <code>&lt;hr&gt;</code>{" "}
          can't hold words, so it would be another element. Add it when a screen needs one.
        </li>
        <li>
          <strong>Colors</strong>, as Open Props UI's primary and tonal lines. A line in the accent color competes
          with the buttons for attention.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Catalyst's Divider for a full-width <code>&lt;hr&gt;</code> at 10% of the text color, and its{" "}
        <code>soft</code> prop at 5%. Open Props UI's Divider, also a plain <code>&lt;hr&gt;</code>, for styling
        every one the page has.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Between sections" name="divider/sections" />
      <Example title="Soft, between rows" name="divider/soft" />
      <Example title="Vertical, between groups of buttons" name="divider/vertical" />
      <Example title="In a dialog" name="divider/dialog" />
    </article>
  );
}
