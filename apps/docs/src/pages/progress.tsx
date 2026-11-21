import { Example, PropsTable } from "../spec.tsx";

export default function ProgressPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Progress</h1>
      <p class="lede">How far along something is: an upload, an import, a publish. Or, when nobody can say yet, that it's working.</p>
      <Example title="Progress" hero name="progress/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;progress&gt;</code>, drawn as a rounded bar 8px tall that fills from the start of
          the line. Screen readers know it as a progress bar with no help from us.
        </li>
        <li>
          With a <code>value</code> it is <strong>determinate</strong>: the fill is <code>value</code> out of{" "}
          <code>max</code>, and grows smoothly to each new value. <code>max</code> is 100 unless it is set, so a
          percentage needs only a value, and an upload of 12 photos can count photos.
        </li>
        <li>
          With no <code>value</code> it is <strong>indeterminate</strong>: a soft glow sweeps along the track, start to
          end, until a value comes. Under reduced motion nothing moves, and the track breathes gently between its own
          tint and the fill's instead.
        </li>
        <li>
          In a Field it takes the field's label, shows its value at the end of the label's line ("42%", or "5 of 12"
          when you give it words), and a description or an error under the bar. The label says what is happening, the
          value says how far, and the description says what's left: "About a minute left."
        </li>
        <li>
          An error in its Field turns the fill the danger color, where it stopped, so a failed upload shows how far it
          got. The error under it says why and what to do.
        </li>
        <li>
          It isn't focusable and takes no input. A Progress only reports. Its Cancel or Retry is a Button beside it.
        </li>
        <li>
          The CSS styles every <code>&lt;progress&gt;</code>, so a static page gets the look with no JS. Every rule is
          wrapped in <code>:where()</code>, so its specificity is 0.
        </li>
      </ul>
      <p>
        A Progress is for a task that ends. A level that stays, such as storage used out of a plan's limit, is a meter,
        native <code>&lt;meter&gt;</code>, and isn't in this spec. Waiting with no bar at all, such as inside a button,
        is Spinner's.
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
              <td><code>Progress</code></td>
              <td><code>&lt;progress&gt;</code></td>
              <td>
                The bar. Its own background is the track. Its <code>aria-valuetext</code> carries the value's words.
              </td>
            </tr>
            <tr>
              <td>Fill</td>
              <td>the browser's own part</td>
              <td>
                <code>::-webkit-progress-value</code> in Chrome and Safari, <code>::-moz-progress-bar</code> in Firefox.
                Rounded at its end, in a primary Button's accent.
              </td>
            </tr>
            <tr>
              <td>Sweep</td>
              <td>a gradient on the track</td>
              <td>Only while indeterminate. 40% of the track long. Over a third of it fades in at each end, so only its middle is solid.</td>
            </tr>
            <tr>
              <td>Value</td>
              <td><code>&lt;output for aria-hidden="true"&gt;</code></td>
              <td>
                In a Field, at the end of the label's line, muted, as a Range's value is, with figures of one width so it doesn't jitter as it
                counts. Hidden from screen readers, which read the same words from the bar.
              </td>
            </tr>
            <tr>
              <td>Label, description, error</td>
              <td>the Field's own</td>
              <td>
                <code>&lt;label for&gt;</code> names the bar, since <code>&lt;progress&gt;</code> takes a label like a
                form control. The description and error sit under the bar.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "value",
            type: "number",
            default: "none",
            description: "How far along, from 0 to max. Left out, the bar is indeterminate.",
          },
          {
            name: "max",
            type: "number",
            default: "100",
            description: "What done is: 100 for a percentage, 12 for 12 photos.",
          },
          {
            name: "valueText",
            type: "string",
            default: "the percentage",
            description: (
              <>
                The value in words, such as <code>"5 of 12"</code>. It shows at the end of the label's line and screen
                readers read it. Left out, it is the percentage, rounded: "42%". An indeterminate bar has none.
              </>
            ),
          },
          {
            name: "hideValue",
            type: "boolean",
            default: "false",
            description: "Leaves the value off the label's line, when the description already says it. Screen readers still hear it.",
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Description, Field, Label, Progress } from "beautiful-ui-solid";

<Field>
  <Label>Uploading 12 photos</Label>
  <Progress value={sent()} max={12} valueText={\`\${sent()} of 12\`} />
  <Description>About a minute left.</Description>
</Field>

<Field>
  <Label>Building Spring launch</Label>
  <Progress />
</Field>`}</code>
      </pre>
      <p>
        Outside a Field it is the bar alone, and needs an <code>aria-label</code>. Other attributes pass through to the{" "}
        <code>&lt;progress&gt;</code>: <code>id</code>, <code>class</code>, <code>aria-*</code>. Inside a Field it takes
        the Field's id, so its Label points at it, and the Field's description and error describe it.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        APG has no progress bar pattern. Its Meter pattern is the nearest, and its rules for a range's value hold: a
        name, a value read in words, and a minimum and maximum. A native <code>&lt;progress&gt;</code> meets them, so
        Progress adds no script.
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
              <td>Passes over it. Nothing on it can be done, so it isn't a stop.</td>
            </tr>
            <tr>
              <td>Reading the page</td>
              <td>
                "Uploading 12 photos, progress bar, 5 of 12", then the description. Without <code>valueText</code>, the
                percentage. An indeterminate bar is read as a busy progress bar with no value.
              </td>
            </tr>
            <tr>
              <td>The value changes</td>
              <td>
                Not announced. A bar that spoke at every step would talk over everything else. Say when it finishes, or
                fails, with a status message, such as the error under the bar or a Toast.
              </td>
            </tr>
            <tr>
              <td>The area it loads</td>
              <td>
                Not its job. A panel that fills in when the bar ends can take <code>aria-busy="true"</code> until then,
                so a screen reader waits for it.
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
              <td>Determinate</td>
              <td>The fill, in a primary Button's accent, covers value out of max of the track.</td>
            </tr>
            <tr>
              <td>A new value</td>
              <td>
                The fill grows to it in 320ms, easing out, so a bar fed every few hundred milliseconds moves smoothly
                instead of in steps. Firefox jumps: it can't animate its fill.
              </td>
            </tr>
            <tr>
              <td>Empty (0)</td>
              <td>The track alone. It has started, or is waiting its turn.</td>
            </tr>
            <tr>
              <td>Done</td>
              <td>
                The track is full. Nothing else changes: the description says it's done, and a page that moves on can
                take the bar away.
              </td>
            </tr>
            <tr>
              <td>Indeterminate</td>
              <td>
                The glow sweeps start to end every 1.6s, speeding up and settling. It sweeps right to left in a
                right-to-left language. Under reduced motion, the track breathes instead.
              </td>
            </tr>
            <tr>
              <td>Failed</td>
              <td>
                An error in the Field: the fill turns the danger color and stays where it stopped. An indeterminate bar
                stops sweeping and shows its empty track.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> The bar is a track, the same as Range's: the same well, and the same fill,
        the accent a primary Button is filled with. That blue is nearly the same in light and dark mode, so a bar
        doesn't turn pale at night. Classic's fill is flat. On glass the track is a groove in the glass, the fill is
        tinted glass at a primary Button's 85%, and it lightens toward its lower edge, as light caught in the groove.
        The indeterminate sweep is lit the other way, from its top, and that light fades out toward the sweep's ends
        with its color.
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
            <tr><td><code>--progress-height</code></td><td>the bar's thickness: <code>--space-2</code> (8px). New.</td></tr>
            <tr><td><code>--radius-full</code></td><td>round ends at any height</td></tr>
            <tr><td><code>--track-fill</code>, <code>--track-shadow</code></td><td>the track and its shade, from Range</td></tr>
            <tr><td><code>--track-value</code>, <code>--color-danger-fill</code></td><td>the fill, and the fill when it failed</td></tr>
            <tr><td><code>--progress-sheen</code></td><td>the light over the fill, lighter toward its lower edge. None on classic. New.</td></tr>
            <tr><td><code>--progress-sweep-sheen</code></td><td>the light over the sweep, from its top. None on classic. New.</td></tr>
            <tr><td><code>--motion-enter</code>, <code>--ease-out</code></td><td>the fill growing to a new value</td></tr>
            <tr><td><code>--motion-sweep</code>, <code>--ease-in-out</code></td><td>one sweep of the glow: 1.6s. New.</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;progress&gt;</code> and its label work everywhere. Every current browser lets its look be replaced
        with <code>appearance: none</code> and the fill's own pseudo-element. The reduced-motion breathing needs{" "}
        <code>@property</code> (Safari 16.4, Firefox 128). An older browser shows the track at a steady tint.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's Progress, for a bar on a tinted track and a sweep drawn over the track while indeterminate, and
        which way it sweeps in a right-to-left page. We style the <code>&lt;progress&gt;</code> itself, with no wrapper
        around it. The APG Meter pattern and the HTML spec's <code>&lt;progress&gt;</code> for what a screen reader
        hears.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Counting" name="progress/upload" />
      <Example title="A percentage, and done" name="progress/percent" />
      <Example title="Indeterminate" name="progress/indeterminate" />
      <Example title="Failed" name="progress/failed" />
      <Example title="On its own" name="progress/alone" />
      <Example title="In a dialog" name="progress/dialog" />
    </article>
  );
}
