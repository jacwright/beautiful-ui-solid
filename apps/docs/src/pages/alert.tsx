import { Example, PropsTable } from "../spec.tsx";

export default function AlertPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Alert</h1>
      <p class="lede">
        A short interruption that asks for a decision, most often to confirm an action that can't be undone.
      </p>
      <Example title="Alert" hero name="alert/lead" />

      <h2>What it does</h2>
      <p>
        Alert is a <a href="/dialog">Dialog</a> with five differences. It renders the same{" "}
        <code>&lt;dialog&gt;</code>, the same parts, and the same CSS.
      </p>
      <ul>
        <li>
          It has <code>role="alertdialog"</code>, so screen readers announce it as an alert and read its description
          straight away.
        </li>
        <li>
          A click on the backdrop does nothing (<code>closedby="closerequest"</code>). A stray click must not answer
          the question. Escape still closes it, as a cancel.
        </li>
        <li>
          Focus starts on the least destructive action, usually Cancel, as APG advises. Static markup puts{" "}
          <code>autofocus</code> on it. The Solid component focuses the first action as it opens, unless something in
          the alert, such as a field, has <code>autofocus</code>.
        </li>
        <li>It defaults to the small size.</li>
        <li>
          On a screen narrower than 40rem it is a card floating at the bottom, 8px in from the sides and the
          bottom edge, like an iOS sheet, with the actions in reach of a thumb. It rises from below the screen as
          it opens and drops back as it closes, easing out with no bounce. Dialog stays centered.
        </li>
      </ul>
      <p>
        Use a Dialog for a task. Use an Alert for a question with two or three answers.
      </p>

      <h2>Anatomy</h2>
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
              <td><code>Alert</code></td>
              <td><code>&lt;dialog role="alertdialog"&gt;</code></td>
              <td>The panel and its backdrop.</td>
            </tr>
            <tr>
              <td><code>AlertTitle</code></td>
              <td><code>&lt;h2&gt;</code></td>
              <td>The question. Names the alert.</td>
            </tr>
            <tr>
              <td><code>AlertDescription</code></td>
              <td><code>&lt;p&gt;</code></td>
              <td>What happens if the user says yes. Required: screen readers read it on open.</td>
            </tr>
            <tr>
              <td><code>AlertBody</code></td>
              <td><code>&lt;beautiful-dialog-body&gt;</code></td>
              <td>Optional. A field the answer needs, such as typing a name to confirm.</td>
            </tr>
            <tr>
              <td><code>AlertActions</code></td>
              <td><code>&lt;footer&gt;</code></td>
              <td>The answers, Cancel first.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Alert</h3>
      <PropsTable
        rows={[
          { name: "open", type: "boolean", description: "As on Dialog." },
          {
            name: "onClose",
            type: "(returnValue: string) => void",
            description: (
              <>
                As on Dialog. It gets the value of the action that closed it, or <code>""</code> for Escape. Treat{" "}
                <code>""</code> as cancel.
              </>
            ),
          },
          { name: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"sm"', description: "As on Dialog." },
        ]}
      />
      <h3>AlertTitle, AlertDescription, AlertBody, AlertActions</h3>
      <p>As the Dialog parts.</p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/">APG alert dialog pattern</a>. The
        keys are Dialog's.
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
              <td>Opening</td>
              <td>Focus moves to the least destructive action.</td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd>
              </td>
              <td>Move through the actions and any field in the body. The page behind is inert.</td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>
                Closes it with a <code>returnValue</code> of <code>""</code>: a cancel, as in APG and Catalyst.
              </td>
            </tr>
            <tr>
              <td>Backdrop click</td>
              <td>Nothing.</td>
            </tr>
            <tr>
              <td>Closing</td>
              <td>Focus returns to the element that opened it.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>Announce an alert dialog with its title, then read the description.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <p>Dialog's states, with these differences.</p>
      <ul>
        <li>
          <strong>Narrow screen</strong> (under 40rem): a card floating at the bottom, 0.5rem in from the sides
          and the bottom edge, with all four corners rounded. Its text stays left-aligned, like Dialog's. The actions stack, primary on top, so Cancel sits
          nearest the thumb. Its bottom gap also clears the phone's home indicator (
          <code>env(safe-area-inset-bottom)</code>) when the page's viewport meta tag sets{" "}
          <code>viewport-fit=cover</code>. Without it the inset is 0.
        </li>
        <li>
          <strong>Opening on a narrow screen:</strong> it rises from below the screen over 320ms and fades in,
          easing out with no spring. An overshoot would lift it off its place and open a gap under it.
        </li>
        <li>
          <strong>Closing on a narrow screen:</strong> it drops back below the screen in 180ms, easing in.
        </li>
        <li>
          <strong>Reduced motion:</strong> a plain fade on every screen, with no movement.
        </li>
        <li>
          <strong>Themes:</strong> the same panel as Dialog. On glass that is the bezel: a 0.75rem band of very clear
          glass around a nearly opaque inner panel, with the rim and its hotspot on the outer edge. The bottom
          card keeps the bezel and the rim. Classic has an opaque panel.
        </li>
        <li>
          <strong>The destructive action:</strong> a primary <a href="/button">Button</a> with the danger color.
          Cancel is a secondary Button.
        </li>
      </ul>
      <p>Narrow the window to see the bottom card.</p>

      <h2>Look and motion tokens</h2>
      <p>
        Alert reads Dialog's tokens, set by the theme, and adds one. The panel's width is 24rem unless{" "}
        <code>size</code> says otherwise.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Dialog's surface, backdrop and motion tokens</td><td>As on <a href="/dialog">Dialog</a></td></tr>
            <tr><td><code>--ease-sheet</code></td><td>the bottom card's easing: a fast start that settles with no overshoot</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>Dialog's notes apply. Alert adds these:</p>
      <ul>
        <li>
          <code>closedby="closerequest"</code>: a modal <code>&lt;dialog&gt;</code> already closes on Escape and
          ignores backdrop clicks, so a browser without <code>closedby</code> behaves the same. The attribute
          states the intent.
        </li>
        <li>
          <code>role="alertdialog"</code> on <code>&lt;dialog&gt;</code> is allowed by ARIA in HTML. No screen reader was tested yet.
        </li>
        <li>
          <code>env(safe-area-inset-bottom)</code> works in every current browser, and is 0 where there is no
          inset.
        </li>
        <li>
          The bottom card's close animation needs the same <code>overlay</code> transition as Dialog's. Only
          Chromium was tested.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Catalyst's Alert for the name, the parts, the props, a default smaller than Dialog's, and Cancel coming first. APG's alert
        dialog pattern for the role, the description read on open, and focus on the least destructive action. iOS
        sheets for the floating bottom card. Everything else, including the focus and close logic adapted from
        Headless UI, comes from <a href="/dialog">Dialog</a>.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Glass over bright content" name="alert/glass" />
      <Example title="Confirm an action" name="alert/confirm" />
      <Example title="A field in the body" name="alert/with-body" />
    </article>
  );
}
