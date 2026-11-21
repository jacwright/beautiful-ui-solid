import { Example, PropsTable } from "../spec.tsx";

export default function DisclosurePage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Disclosure</h1>
      <p class="lede">A line you press to show more under it, and press again to hide it.</p>
      <Example title="Disclosure" hero name="disclosure/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;details&gt;</code>. Its <code>&lt;summary&gt;</code> is the button, and everything
          after it is the panel. The browser does the rest: Enter and Space open and close it, screen readers hear a
          button that says whether it's expanded, and it works with no JS.
        </li>
        <li>
          It keeps a screen calm. Settings most people never change, the log behind an error, and the answer to a
          question stay out of the way until someone asks for them.
        </li>
        <li>
          The summary is a quiet control: its words at a control's size and weight 500, with a chevron after them. The
          chevron points down while it's closed and turns to point up as it opens. Hover tints the line.
        </li>
        <li>
          The summary hugs its words. It reaches out 8px on each side for its tint, so its words line up with the text
          above and below it, and with the panel's.
        </li>
        <li>
          The panel grows to its height and fades in over 240ms, and shrinks and fades out over 160ms. The page below
          moves with it, so nothing jumps.
        </li>
        <li>
          The browser opens a closed panel when someone searches the page for words in it, or follows a link to
          something inside it, in Chrome and Edge. Hidden settings stay findable.
        </li>
        <li>
          The CSS styles every <code>&lt;details&gt;</code>, so a static page gets the look with no JS. Every rule is in{" "}
          <code>:where()</code>, so its specificity is 0, and Accordion and a Sidebar's sections restyle it with any
          selector.
        </li>
      </ul>
      <p>
        Disclosures that open one at a time are Accordion: the same element with a shared <code>name</code>. A panel
        that floats over the page is Popover. A choice between views is Tabs.
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
              <td><code>Disclosure</code></td>
              <td><code>&lt;details&gt;</code></td>
              <td>
                Holds the summary and the panel. <code>open</code> is on it while the panel shows.
              </td>
            </tr>
            <tr>
              <td>Summary</td>
              <td><code>&lt;summary&gt;</code></td>
              <td>The button. Its words say what's inside: "Build settings", "Show the build log".</td>
            </tr>
            <tr>
              <td>Chevron</td>
              <td><code>summary::after</code></td>
              <td>
                Drawn with a CSS mask in the muted text color, the size of a control's icon. The browser's own triangle
                is hidden.
              </td>
            </tr>
            <tr>
              <td>Panel</td>
              <td>
                <code>::details-content</code>
              </td>
              <td>
                The browser's own box around everything after the summary, so there's no wrapper element. It animates
                its height and fade, and its clip leaves room for a focus ring inside it.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "summary",
            type: "JSX.Element",
            description: "The words on the button. Usually text. Keep anything you can press out of it.",
          },
          {
            name: "open",
            type: "boolean",
            default: "false",
            description: (
              <>
                Opens the panel at first, and opens or closes it when it changes. The person can still open and close
                it, and <code>onToggle</code> says when.
              </>
            ),
          },
          {
            name: "onToggle",
            type: "(open: boolean) => void",
            default: "none",
            description: "Called whenever the panel opens or closes, however it happens: a press, find in page, or open.",
          },
          {
            name: "name",
            type: "string",
            default: "none",
            description: (
              <>
                Disclosures with the same name open one at a time. Use Accordion for that: it adds the look of a
                group.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", default: "none", description: "The panel: anything at all, fields included." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Disclosure, Text } from "beautiful-ui-solid";

<Text>The deploy failed: one page didn't build.</Text>
<Disclosure summary="Show the build log">
  <pre tabindex="0"><code>{log}</code></pre>
</Disclosure>

<Disclosure summary="Build settings" open={hasBuildError()} onToggle={setShowingBuild}>
  <Field>…</Field>
</Disclosure>`}</code>
      </pre>
      <p>
        Other attributes pass through to the <code>&lt;details&gt;</code>: <code>id</code>, <code>class</code>,{" "}
        <code>aria-*</code>, and event handlers.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the APG Disclosure pattern. The native <code>&lt;details&gt;</code> meets all of it, so Disclosure adds no
        script for it.
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
                Moves focus to the summary, then into the panel if it's open. A closed panel's contents are skipped.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>
              </td>
              <td>Opens or closes the panel. Focus stays on the summary.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read the summary as a button, with "collapsed" or "expanded". VoiceOver calls it a disclosure triangle.
                A closed panel's contents aren't read.
              </td>
            </tr>
            <tr>
              <td>Find in page, a link to inside it</td>
              <td>Open the panel, in Chrome and Edge, and fire onToggle.</td>
            </tr>
            <tr>
              <td>Touch</td>
              <td>The summary is a control's height: 36px, and 44px where the pointer is a finger.</td>
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
              <td>Closed</td>
              <td>The summary alone, with its chevron pointing down.</td>
            </tr>
            <tr>
              <td>Open</td>
              <td>The chevron points up, and the panel shows under the summary.</td>
            </tr>
            <tr>
              <td>Opening and closing</td>
              <td>
                The panel grows and fades in over 240ms, and shrinks and fades out over 160ms. The chevron turns with it.
              </td>
            </tr>
            <tr>
              <td>Hover</td>
              <td>A 6% tint of the text color behind the summary, and the chevron darkens to the text color.</td>
            </tr>
            <tr>
              <td>Press</td>
              <td>A 9% tint.</td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>The kit's 2px accent ring, 2px out, around the summary and its tint's rounded corners.</td>
            </tr>
            <tr>
              <td>Reduced motion</td>
              <td>The panel opens at once and fades in. The chevron flips without turning.</td>
            </tr>
            <tr>
              <td>Disabled</td>
              <td>
                There is none. A panel nobody can open shouldn't be on the screen. Show what's in it, or leave it out.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> Classic and glass look the same: a disclosure is text on whatever it sits on.
        The tint is a share of the text color, so it suits light and dark and lets glass show through.
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
            <tr><td><code>--control-height</code></td><td>the summary's least height</td></tr>
            <tr><td><code>--control-font-size</code>, <code>--control-icon</code></td><td>the summary's words and chevron</td></tr>
            <tr><td><code>--space-2</code></td><td>how far the summary reaches out on each side for its tint</td></tr>
            <tr><td><code>--radius-md</code></td><td>the tint's corners, as a Button's</td></tr>
            <tr>
              <td><code>--motion-expand</code>, <code>--motion-collapse</code></td>
              <td>New. 240ms and 160ms: a panel that opens in place and pushes the page down. Accordion uses them too.</td>
            </tr>
            <tr><td><code>--motion-quick</code></td><td>the hover tint</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code> work everywhere. The panel's own box,{" "}
        <code>::details-content</code>, is in Chrome 131, Safari 18.4 and Firefox 143. Animating its height to{" "}
        <code>auto</code> takes <code>interpolate-size</code>, in Chrome 129: elsewhere the panel opens at once and fades
        in. An older browser opens it at once.
      </p>

      <h2>References</h2>
      <p>
        Headless UI's Disclosure for the parts and for a panel that can be opened from outside. Its compound
        DisclosureButton and DisclosurePanel aren't needed here: the native summary and panel already exist, so a{" "}
        <code>summary</code> prop and the children cover them. The APG Disclosure pattern for the keys.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="More settings in a form" name="disclosure/options" />
      <Example title="The details behind an error" name="disclosure/log" />
      <Example title="Open at first" name="disclosure/open" />
      <Example title="Questions" name="disclosure/questions" />
      <Example title="In a dialog" name="disclosure/glass" />
    </article>
  );
}
