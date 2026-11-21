import { Example, PropsTable } from "../spec.tsx";

export default function MeterPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Meter</h1>
      <p class="lede">
        A level that stays, out of a limit: storage used of a plan's 5 GB, emails sent this month, a page speed score.
        Its color says whether the level is fine, needs care, or is nearly at the end.
      </p>
      <Example title="Meter" hero name="meter/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;meter&gt;</code>, drawn as a Progress bar is: a rounded track 8px tall, filled from
          the start of the line to <code>value</code> out of <code>max</code>. Screen readers know it as a meter with
          no help from us.
        </li>
        <li>
          The fill's color says how the level stands. The browser reads it from <code>low</code>,{" "}
          <code>high</code> and <code>optimum</code>, which split the range in three: the part <code>optimum</code> is
          in is good and takes the accent, the part next to it takes the warning amber, and the part furthest away
          takes the danger red. With none of the three set, the fill is always the accent.
        </li>
        <li>
          Most meters are for something that runs out, so lower is better: <code>optimum</code> 0,{" "}
          <code>low</code> at 80% of the limit and <code>high</code> at 95%. The bar turns amber at 80% and red past
          95%. A score where higher is better sets <code>optimum</code> to the top instead, and turns amber below{" "}
          <code>high</code> and red below <code>low</code>.
        </li>
        <li>
          In a Field it takes the field's label, shows its value at the end of the label's line ("3.2 GB of 5 GB"), and
          a description under the bar. The label says what is measured, the value says how much, and the description
          says what it means or what to do: "Almost full. New uploads stop at 5 GB."
        </li>
        <li>
          Color is never the only signal. When the level needs care, the description says so in words, so it reads the
          same to someone who can't tell amber from blue, and to a screen reader.
        </li>
        <li>
          It isn't focusable and takes no input. A Meter only reports. Its Upgrade is a Button beside it.
        </li>
        <li>
          The CSS styles every <code>&lt;meter&gt;</code>, so a static page gets the look with no JS. Every rule is
          wrapped in <code>:where()</code>, so its specificity is 0.
        </li>
      </ul>
      <p>
        A Meter is for a level. A task that moves toward done, such as an upload, is a Progress, which can also say it
        is working with no value. A level the person sets is a Range.
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
              <td><code>Meter</code></td>
              <td><code>&lt;meter&gt;</code></td>
              <td>The bar. Its own background is the track. Its <code>aria-valuetext</code> carries the value's words.</td>
            </tr>
            <tr>
              <td>Fill</td>
              <td>the browser's own part</td>
              <td>
                <code>::-webkit-meter-optimum-value</code> and its two siblings in Chrome and Safari, one for each state,
                and <code>::-moz-meter-bar</code> in Firefox. Rounded at its end.
              </td>
            </tr>
            <tr>
              <td>Value</td>
              <td><code>&lt;output for aria-hidden="true"&gt;</code></td>
              <td>
                In a Field, at the end of the label's line, muted, as Progress's and Range's are, with figures of one
                width. Hidden from screen readers, which read the same words from the bar.
              </td>
            </tr>
            <tr>
              <td>Label and description</td>
              <td>the Field's own</td>
              <td>
                <code>&lt;label for&gt;</code> names the bar, since <code>&lt;meter&gt;</code> takes a label like a form
                control. The description sits under the bar.
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
            description: "The level, from min to max. Outside them, the bar shows the nearer end.",
          },
          { name: "min", type: "number", default: "0", description: "The bottom of the range." },
          {
            name: "max",
            type: "number",
            default: "100",
            description: "The limit: 100 for a percentage or a score, 5 for a plan's 5 GB.",
          },
          {
            name: "low",
            type: "number",
            default: "min",
            description: "Where the low part of the range ends.",
          },
          {
            name: "high",
            type: "number",
            default: "max",
            description: "Where the high part of the range starts.",
          },
          {
            name: "optimum",
            type: "number",
            default: "the middle",
            description: (
              <>
                Where the best level is. Its part of the range takes the accent, the next part amber, and the furthest
                red. 0 when less is better, such as storage used. <code>max</code> when more is, such as a score.
              </>
            ),
          },
          {
            name: "valueText",
            type: "string",
            default: "the percentage",
            description: (
              <>
                The value in words, such as <code>"3.2 GB of 5 GB"</code>. It shows at the end of the label's line and
                screen readers read it. Left out, it is the share of the range, rounded: "64%".
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
        <code>{`import { Description, Field, Label, Meter } from "beautiful-ui-solid";

<Field>
  <Label>Storage</Label>
  <Meter value={used()} max={5} low={4} high={4.75} optimum={0} valueText={\`\${used()} GB of 5 GB\`} />
  <Description>Images and files across your sites. Your plan includes 5 GB.</Description>
</Field>

<Field>
  <Label>Page speed</Label>
  <Meter value={72} low={50} high={90} optimum={100} valueText="72 out of 100" />
</Field>`}</code>
      </pre>
      <p>
        Outside a Field it is the bar alone, and needs an <code>aria-label</code>. Other attributes pass through to the{" "}
        <code>&lt;meter&gt;</code>: <code>id</code>, <code>class</code>, <code>aria-*</code>. Inside a Field it takes
        the Field's id, so its Label points at it, and the Field's description describes it.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From APG's Meter pattern: the meter has a name, a minimum, a maximum, and a value, read in words where numbers
        alone would mislead. A native <code>&lt;meter&gt;</code> meets them, so Meter adds no script.
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
                "Storage, meter, 3.2 GB of 5 GB", then the description. Without <code>valueText</code>, the percentage.
              </td>
            </tr>
            <tr>
              <td>The level needs care</td>
              <td>
                The color isn't read out. The description says it: "Almost full." A level that crosses a line while
                the person is on the page, and needs them now, says so with a Callout or a Toast.
              </td>
            </tr>
            <tr>
              <td>The value changes</td>
              <td>Not announced, as a Progress isn't.</td>
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
              <td>Good</td>
              <td>In the part of the range <code>optimum</code> is in: the fill is a primary Button's accent.</td>
            </tr>
            <tr>
              <td>Needs care</td>
              <td>One part away: the fill turns amber, the warning fill.</td>
            </tr>
            <tr>
              <td>Nearly out, or poor</td>
              <td>Two parts away: the fill turns the danger red.</td>
            </tr>
            <tr>
              <td>Empty (0)</td>
              <td>The track alone.</td>
            </tr>
            <tr>
              <td>Full</td>
              <td>The track is full, in the color its part of the range gives it.</td>
            </tr>
            <tr>
              <td>A new value</td>
              <td>
                The fill grows or shrinks to it in 320ms, easing out, and changes color when it crosses a line. Firefox
                jumps: it can't animate its fill.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> The bar is Progress's: the same track, the same height, the same accent, so a
        page that shows a level beside a task reads as one family. Classic's fills are flat. On glass the track is a
        groove in the glass, each fill is tinted glass at a primary Button's 85%, and it lightens toward its lower edge,
        as light caught in the groove. The amber is a step deeper in light mode, and a step deeper again on glass, so it keeps 3:1 over a white page.
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
            <tr><td><code>--meter-height</code></td><td>the bar's thickness: Progress's 8px. New.</td></tr>
            <tr><td><code>--radius-full</code></td><td>round ends at any height</td></tr>
            <tr><td><code>--track-fill</code>, <code>--track-shadow</code></td><td>the track and its shade, from Range</td></tr>
            <tr><td><code>--track-value</code></td><td>the fill when the level is good</td></tr>
            <tr><td><code>--color-warning-fill</code></td><td>the fill when it needs care: amber 600 in light mode (700 on glass), 500 in dark. New.</td></tr>
            <tr><td><code>--color-danger-fill</code></td><td>the fill when it is nearly out, or poor</td></tr>
            <tr><td><code>--progress-sheen</code></td><td>the light over the fill on glass, from Progress. None on classic.</td></tr>
            <tr><td><code>--motion-enter</code>, <code>--ease-out</code></td><td>the fill moving to a new value</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;meter&gt;</code>, its label and its three states work in every current browser, and each lets its
        look be replaced with <code>appearance: none</code> and the fill's own pseudo-elements.
      </p>

      <h2>References</h2>
      <p>
        No reference kit has a Meter, so it is our own. The APG Meter pattern and the HTML spec's{" "}
        <code>&lt;meter&gt;</code> for what a screen reader hears and how low, high and optimum pick the state.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component live, then its code, then the markup it renders. Switch the theme and mode
        with T and M, or the toggles at the bottom right.
      </p>
      <Example title="Storage" name="meter/storage" />
      <Example title="As it fills" name="meter/levels" />
      <Example title="When higher is better" name="meter/higher" />
      <Example title="On its own" name="meter/alone" />
      <Example title="In a dialog" name="meter/dialog" />
    </article>
  );
}
