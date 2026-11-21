import { Example, PropsTable } from "../spec.tsx";

export default function RangePage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Range</h1>
      <p class="lede">
        A slider: pick a number between two ends by dragging, such as the share of visitors who see a new version.
      </p>
      <Example title="Range" hero name="range/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;input type="range"&gt;</code>, styled. The browser does the dragging, the keys,
          right-to-left pages, the form value and what screen readers hear.
        </li>
        <li>
          The track fills in the accent from the start up to the thumb, so the amount reads at a glance. The thumb is a
          knob, raised like a Button, that grows a little while it's dragged. On glass it is a pane of frosted glass,
          like a secondary Button, and the track shows through it.
        </li>
        <li>
          In a <a href="/fieldset">Field</a> it shows its value at the end of the label's line, in words from{" "}
          <code>format</code>: "25%", "30 days", "None". Screen readers hear the same words. Outside a field it needs
          an <code>aria-label</code>, and shows no value.
        </li>
        <li>
          <code>marks</code> names values under the track, each under the thumb's spot for it: the steps of a choice
          such as 7 days, 30 days, 90 days, 1 year. Clicking a mark moves the thumb there.
        </li>
        <li>
          The CSS styles every <code>&lt;input type="range"&gt;</code>, so a static page gets the look with no JS. In
          Chrome and Firefox the fill follows the thumb with no JS too. Every rule is wrapped in <code>:where()</code>,
          so its specificity is 0.
        </li>
      </ul>
      <p>
        A slider is for a value where roughly right is fine and seeing the amount helps. For an exact number, such as a
        price or a count of seats past a handful, use an <a href="/input">Input</a> with <code>type="number"</code>.
      </p>
      <p>
        <strong>Not in this spec:</strong> two thumbs for a span (from–to, such as a price filter), a vertical slider,
        dots on the track at each step, and a number box beside the slider. Each can follow when a screen needs it.
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
              <td><code>Range</code></td>
              <td><code>&lt;input type="range"&gt;</code></td>
              <td>
                The slider. Its style carries <code>--range-at</code>, where the thumb sits from 0 to 1, for browsers
                that can't work it out in CSS.
              </td>
            </tr>
            <tr>
              <td>Track</td>
              <td>the input's own track</td>
              <td>A 6px groove, rounded fully, filled in the accent up to the thumb.</td>
            </tr>
            <tr>
              <td>Thumb</td>
              <td>the input's own thumb</td>
              <td>A 20px knob, 28px for a finger. Its corners and ring are the input's, so it needs no extra element.</td>
            </tr>
            <tr>
              <td>Value</td>
              <td>
                <code>&lt;output for aria-hidden="true"&gt;</code>
              </td>
              <td>
                The value in words, at the end of the label's line, in a Field. Hidden from screen readers, which hear
                the same words from the slider itself, so they don't hear it twice.
              </td>
            </tr>
            <tr>
              <td>Marks</td>
              <td>
                <code>&lt;datalist&gt;</code> of <code>&lt;option&gt;</code>
              </td>
              <td>
                Only with <code>marks</code>. The input's <code>list</code> points at it. Each option sits under its
                value, by its <code>--at</code>. The first and last line up with the ends of the track.
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
            default: "halfway",
            description: "Where the thumb sits. Left out, the browser puts it halfway between min and max.",
          },
          { name: "min", type: "number", default: "0", description: "The start of the track." },
          { name: "max", type: "number", default: "100", description: "The end of the track." },
          {
            name: "step",
            type: 'number | "any"',
            default: "1",
            description: "How far one arrow key moves it. The value always lands on a step from min.",
          },
          {
            name: "format",
            type: "(value: number) => string",
            default: "the number",
            description: (
              <>
                The value in words: <code>(v) =&gt; `${"{v}"}%`</code>, or a lookup such as{" "}
                <code>(v) =&gt; ["7 days", "30 days", "90 days", "1 year"][v]</code>. Shown in a Field and read by
                screen readers as <code>aria-valuetext</code>. Left out, the number in the browser's language, such as
                1,000.
              </>
            ),
          },
          {
            name: "showValue",
            type: "boolean",
            default: "true",
            description: "In a Field, shows the value at the end of the label's line. Screen readers hear it either way.",
          },
          {
            name: "marks",
            type: "(number | { value: number; label: string })[]",
            default: "none",
            description: (
              <>
                Values to name under the track. A number is labeled by <code>format</code>. Name the ends and a few
                steps between: a mark for every step crowds the line.
              </>
            ),
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Can't be focused or dragged, and isn't sent with the form. A Field's disabled sets it too.",
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Description, Field, Label, Range } from "beautiful-ui-solid";

<Field>
  <Label>Visitors who see the new version</Label>
  <Description>The rest see the live site until you promote it.</Description>
  <Range name="share" step={5} value={share()} format={(v) => \`\${v}%\`} onInput={(e) => setShare(e.currentTarget.valueAsNumber)} />
</Field>

const days = ["7 days", "30 days", "90 days", "1 year"];
<Field>
  <Label>Keep logs for</Label>
  <Range name="logs" max={3} value={1} format={(v) => days[v]} marks={[0, 1, 2, 3]} />
</Field>`}</code>
      </pre>
      <p>
        Other attributes pass through to the <code>&lt;input&gt;</code>: <code>name</code>, <code>id</code>,{" "}
        <code>class</code>, <code>aria-*</code>, and event handlers. <code>onInput</code> fires as it's dragged,{" "}
        <code>onChange</code> when it's let go. Read the number with <code>valueAsNumber</code>.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the APG Slider pattern. A native range meets it, so Range adds only the words for the value and the
        click on a mark.
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
              <td>Moves focus to the slider and on. The focus ring shows around the track and thumb.</td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd> <kbd>↑</kbd> and <kbd>←</kbd> <kbd>↓</kbd>
              </td>
              <td>
                One step up and down. On a right-to-left page, <kbd>←</kbd> goes up, as the track runs from the right.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Page Up</kbd>, <kbd>Page Down</kbd>
              </td>
              <td>A bigger jump, a tenth of the track, where the browser has one. Chrome does.</td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd>, <kbd>End</kbd>
              </td>
              <td>The start and the end.</td>
            </tr>
            <tr>
              <td>Pointer</td>
              <td>
                Drag the thumb, or press anywhere on the track to move it there and keep dragging. Clicking a mark's
                words moves it to that mark.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read "slider", the label, the value in words (or the number), and the description. Each change is read
                as it happens. On a phone, swiping up and down moves it a step.
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
              <td>Rest</td>
              <td>The track filled in the accent up to the thumb.</td>
            </tr>
            <tr>
              <td>Hover</td>
              <td>The thumb's shadow deepens, as it lifts toward the pointer. Only where there is a pointer that hovers.</td>
            </tr>
            <tr>
              <td>Dragging</td>
              <td>
                The thumb grows by 15% in 120ms, so it shows under a finger. Under reduced motion it keeps its size.
              </td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>
                The kit's 2px accent ring, a pill 2px outside the thumb, around the whole track. The moving ring glides
                to it from the last control. Keyboard focus only.
              </td>
            </tr>
            <tr>
              <td>At the start or the end</td>
              <td>The track is empty or full. The thumb stays inside the track's ends, never past them.</td>
            </tr>
            <tr>
              <td>Disabled</td>
              <td>Fades to 50%, with its label, description, value and marks. It can't be focused or dragged.</td>
            </tr>
            <tr>
              <td>Invalid</td>
              <td>
                Can't happen on its own: the browser keeps the value between min and max and on a step. An{" "}
                <a href="/fieldset">ErrorMessage</a> the page writes, such as "This plan needs at least 5 seats.",
                shows under it as under any field.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> Classic's track is a gray groove with a faint shade inside its top edge, and
        the fill is the primary Button's blue. Glass's track is a tint of what's behind with a lit lower lip, and the
        fill is the primary Button's tinted glass. Classic's thumb is a white knob in both modes. Glass's is a
        secondary Button in small: frosted glass, white in light mode and dark in dark mode, with its sheen and a
        bright top edge. It is thinner than a Button's pane, so the groove and the fill show through it, blurred.
      </p>

      <h2>Look tokens</h2>
      <p>
        New tokens: Switch and Progress will share the track and thumb. <code>--radius-full</code> is new for every
        pill and circle.
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
            <tr><td><code>--track-height</code></td><td>0.375rem (6px)</td></tr>
            <tr><td><code>--thumb-size</code></td><td>1.25rem (20px), 1.75rem (28px) for a finger</td></tr>
            <tr><td><code>--radius-full</code></td><td>9999px: the track and thumb's round ends</td></tr>
            <tr><td><code>--track-fill</code>, <code>--track-shadow</code></td><td>the groove and the shade inside it</td></tr>
            <tr><td><code>--track-value</code></td><td>the fill up to the thumb: <code>--color-accent-fill</code>, and on glass the primary Button's opacity of it</td></tr>
            <tr><td><code>--track-value-image</code></td><td>the fill as drawn: flat in classic, and on glass the value color at the top, 22% lighter at the bottom</td></tr>
            <tr><td><code>--thumb-fill</code>, <code>--thumb-blur</code>, <code>--thumb-sheen</code>, <code>--thumb-edge</code></td><td>the knob, its frost on glass, its light, and the hairline that holds it apart from the page</td></tr>
            <tr><td><code>--thumb-shadow</code>, <code>--thumb-shadow-hover</code></td><td>its lift: depth 1 at rest, under the pointer and in a drag, where the thumb grows instead (its clip room is about 4px)</td></tr>
            <tr><td><code>--motion-quick</code>, <code>--ease-out</code></td><td>the thumb's growth and shadow</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;input type="range"&gt;</code> and its keys work everywhere, and so do its track and thumb styles,
        written once for Chrome and Safari and once for Firefox. The fill is where browsers differ. Firefox draws it.
        Chrome 115 and up work it out in CSS, from the thumb's place as a scroll-driven animation, so it follows the
        thumb with no JS. Elsewhere the Solid Range sets <code>--range-at</code> as the value changes, and static
        markup writes the first value in its style. Showing the marks styles a <code>&lt;datalist&gt;</code>, which
        current Chrome, Safari and Firefox allow.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's Range for the value at the end of the label's line, names for values under the track from a{" "}
        <code>&lt;datalist&gt;</code>, and a fill drawn from a custom property. Apple's sliders for the knob over a
        filled groove. The APG Slider pattern for the keys and <code>aria-valuetext</code>.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="In a field" name="range/fields" />
      <Example title="With marks" name="range/marks" />
      <Example title="Empty and disabled" name="range/states" />
      <Example title="On its own" name="range/alone" />
      <Example title="On glass, and in a dialog" name="range/glass" />
    </article>
  );
}
