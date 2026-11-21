import { Example, PropsTable } from "../spec.tsx";

export default function ToggleGroupPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Toggle group</h1>
      <p class="lede">
        Segments in one groove: a segmented control that picks one view, or a row of formats where several can be
        on.
      </p>
      <Example title="Toggle group" hero name="toggle-group/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          The group is a groove cut into the surface, as a <a href="/switch">Switch</a>'s track is, and its segments
          are text on it. A segment that's on rises out of the groove on a raised pane, a secondary{" "}
          <a href="/button">Button</a>'s. With one choice the pane is a thumb that glides to the segment chosen. With
          several, each pressed segment gets a pane of its own, and pressed neighbours share one.
        </li>
        <li>
          <strong>One choice</strong>, the default, is a segmented control: Day, Week, Month. Exactly one is on once
          one is chosen, and clicking it again keeps it on. It is the APG radio group: a{" "}
          <code>role="radiogroup"</code> of <code>&lt;button role="radio" aria-checked&gt;</code>, so a screen reader
          says "Week, radio button, checked, 2 of 4".
        </li>
        <li>
          <strong>Several at once</strong>, with <code>multiple</code>: Bold, Italic, Underline. Each button flips on
          its own. It is a <code>role="group"</code> of <code>&lt;button aria-pressed&gt;</code>, Toggle buttons, with
          the keys of the APG toolbar.
        </li>
        <li>
          Either way the group is one Tab stop, and the arrow keys move inside it. In a segmented control the arrows
          choose as they move, as on radios. With several, they only move, and Space or Enter flips.
        </li>
        <li>
          The group is named, as Button group is: the types take an <code>aria-label</code> or an{" "}
          <code>aria-labelledby</code>. An icon-only segment takes <code>icon</code> and its own <code>aria-label</code>.
        </li>
        <li>
          Each segment carries a <code>value</code>, and the group reports the values that are on: one string, or a
          list with <code>multiple</code>. It takes action at once and holds no form value. A choice saved with a form
          is a radio group or a <a href="/select">Select</a>.
        </li>
        <li>
          Neutral or accent: the color of every segment's text. There are no variants: the groove and the pane are the
          look. With <code>fill</code> the group takes the full width and the segments share it equally, for a phone
          or a narrow panel.
        </li>
        <li>
          The CSS styles every <code>&lt;beautiful-toggle-group&gt;</code>, and <code>wireToggleGroup</code> gives
          static markup the keys and the clicks, as <code>wireTabs</code> does for Tabs. Without JS the segments show
          their state but can't change it.
        </li>
      </ul>
      <p>
        A row of separate toggles with gaps between them, such as Grid and Spellcheck above an editor, is a row of
        Toggle buttons. Switching between panels of content is <a href="/tabs">Tabs</a>.
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
              <td>
                <code>ToggleGroup</code>
              </td>
              <td>
                <code>&lt;beautiful-toggle-group role="radiogroup"&gt;</code>, or <code>role="group"</code> with{" "}
                <code>multiple</code>
              </td>
              <td>
                The groove, the name, which segments are on, and the keys. With one choice its{" "}
                <code>::after</code> is the thumb. <code>data-fill</code> carries <code>fill</code>.
              </td>
            </tr>
            <tr>
              <td>
                <code>ToggleGroupItem</code>
              </td>
              <td>
                <code>&lt;button type="button" role="radio" aria-checked&gt;</code>, or{" "}
                <code>&lt;button type="button" aria-pressed&gt;</code> with <code>multiple</code>
              </td>
              <td>
                One segment, with its <code>value</code>. The group's color lands on each as <code>data-color</code>,
                and only the segment that takes Tab has <code>tabindex="0"</code>.
              </td>
            </tr>
            <tr>
              <td>An icon</td>
              <td>
                <code>&lt;svg aria-hidden="true"&gt;</code>
              </td>
              <td>
                Before the text, sized as on Button. An icon-only segment takes <code>icon</code> and an <code>aria-label</code>, and is square,
                as an <a href="/icon-button">Icon button</a>.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>ToggleGroup</h3>
      <PropsTable
        rows={[
          {
            name: "aria-label | aria-labelledby",
            type: "string",
            description: "The group's name, required. One or the other.",
          },
          {
            name: "multiple",
            type: "boolean",
            default: "false",
            description: "Several segments can be on at once. Without it, one choice.",
          },
          {
            name: "value",
            type: "string | string[]",
            default: "none",
            description: (
              <>
                What's on, when the page owns the state: a value, or a list of them with <code>multiple</code>. The
                group shows what it says.
              </>
            ),
          },
          {
            name: "defaultValue",
            type: "string | string[]",
            default: "none, or []",
            description: "What's on at first, when the group owns the state.",
          },
          {
            name: "onChange",
            type: "(value: string) => void, or (values: string[]) => void",
            default: "none",
            description: (
              <>
                Called with what's on after each choice: a click, Space, Enter, or an arrow in a segmented control.
                The list keeps the segments' order.
              </>
            ),
          },
          {
            name: "color",
            type: '"neutral" | "accent"',
            default: '"neutral"',
            description: "The color of every segment's text.",
          },
          {
            name: "fill",
            type: "boolean",
            default: "false",
            description: "Takes the full width, with equal segments.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables every segment. Each keeps its state, faded, and the group leaves the Tab order.",
          },
          { name: "children", type: "JSX.Element", description: "The ToggleGroupItems." },
        ]}
      />
      <h3>ToggleGroupItem</h3>
      <PropsTable
        rows={[
          { name: "value", type: "string", description: "Names the segment in value and onChange. Required, and unique in its group." },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "The native disabled. The arrows pass over it, and it keeps its state, faded.",
          },
          {
            name: "icon",
            type: "boolean",
            default: "false",
            description: (
              <>
                The segment shows only an icon: it is square, and the types then ask for an <code>aria-label</code> to
                name it.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The label, with an optional icon. It never changes with the state." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { ToggleGroup, ToggleGroupItem } from "beautiful-ui-solid";

<ToggleGroup aria-label="Period" value={period()} onChange={setPeriod}>
  <ToggleGroupItem value="day">Day</ToggleGroupItem>
  <ToggleGroupItem value="week">Week</ToggleGroupItem>
  <ToggleGroupItem value="month">Month</ToggleGroupItem>
</ToggleGroup>

<ToggleGroup aria-label="Text style" multiple defaultValue={["bold"]} onChange={applyStyles}>
  <ToggleGroupItem value="bold" icon aria-label="Bold"><BoldIcon /></ToggleGroupItem>
  <ToggleGroupItem value="italic" icon aria-label="Italic"><ItalicIcon /></ToggleGroupItem>
</ToggleGroup>`}</code>
      </pre>
      <p>
        Other attributes pass through: on the group to the <code>&lt;beautiful-toggle-group&gt;</code>, such as{" "}
        <code>id</code>, and on an item to its <code>&lt;button&gt;</code>, such as <code>title</code> and{" "}
        <code>onClick</code>. A caller's <code>onClick</code> that calls <code>preventDefault</code> keeps the state.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/radio/">APG radio group pattern</a> for one choice,
        and the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/">APG toolbar pattern</a> for several.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Key or event</th>
              <th>One choice</th>
              <th>Several at once</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd>
              </td>
              <td>Into the group onto the segment that's on, or the first if none is. The next Tab leaves the group.</td>
              <td>Into the group onto the segment last focused, the first at the start. The next Tab leaves it.</td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd> <kbd>↓</kbd>, <kbd>←</kbd> <kbd>↑</kbd>
              </td>
              <td>Move to the next or previous segment and choose it, wrapping at the ends.</td>
              <td>Move to the next or previous segment, wrapping at the ends. Nothing flips.</td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd>, <kbd>End</kbd>
              </td>
              <td>Move to the first or last segment and choose it.</td>
              <td>Move to the first or last segment.</td>
            </tr>
            <tr>
              <td>
                <kbd>Space</kbd>, <kbd>Enter</kbd>
              </td>
              <td>Choose the focused segment, if it isn't on already.</td>
              <td>Flip the focused segment.</td>
            </tr>
            <tr>
              <td>Disabled segments</td>
              <td colspan="2">Skipped by the arrows, Home and End.</td>
            </tr>
            <tr>
              <td>Right to left</td>
              <td colspan="2">
                <kbd>←</kbd> is the next segment and <kbd>→</kbd> the previous, as the segments read.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>"Period, radio group. Week, radio button, checked, 2 of 4."</td>
              <td>"Text style, group. Bold, toggle button, pressed."</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Off:</strong> text on the groove, in the group's color. Hovered, a faint tint of the color, only
          where the pointer can hover.
        </li>
        <li>
          <strong>On, one choice:</strong> the thumb, a raised pane with a Button's fill, clear edge, sheen and shadow,
          under the segment. On a change it glides to the new one in 240ms. Under reduced motion it moves at once.
        </li>
        <li>
          <strong>On, several at once:</strong> the same pane under each pressed segment. It fades and grows in over
          120ms, and fades only under reduced motion. Pressed neighbours share one pane, square where they meet, and
          its shadow falls once under the whole.
        </li>
        <li>
          <strong>None chosen:</strong> a segmented control may start with no value. There's no thumb, and Tab lands
          on the first segment.
        </li>
        <li>
          <strong>Focus:</strong> the kit's ring around the focused segment, drawn over its neighbours and the pane,
          from the keyboard only.
        </li>
        <li>
          <strong>Disabled:</strong> a segment, or the whole group, at half opacity, keeping its state.
        </li>
        <li>
          <strong>Touch:</strong> 44px tall with 16px text, as Button, the groove's lip included.{" "}
          <code>fill</code> shares the width.
        </li>
        <li>
          <strong>Themes:</strong> classic is an opaque gray groove with a white pane. Glass tints the groove with
          what's behind and frosts the pane, as it frosts a Button. Glass falls back to classic where{" "}
          <code>backdrop-filter</code> is missing or the user asks for reduced transparency.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
      <p>
        Toggle group reads Switch's <code>--track-*</code> tokens for the groove and Button's{" "}
        <code>--control-*</code> for the pane, so a theme draws each once.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>What it does here</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--track-fill</code>, <code>--track-shadow</code>
              </td>
              <td>The groove: its tint and the shade inside its top edge.</td>
            </tr>
            <tr>
              <td>
                <code>--toggle-track-pad</code>
              </td>
              <td>2px, the groove's lip around a pane. Set on the group.</td>
            </tr>
            <tr>
              <td>
                <code>--control-fill</code>, <code>--control-sheen</code>, <code>--control-pane-edge</code>,{" "}
                <code>--control-shadow</code>
              </td>
              <td>The pane, as on a secondary Button.</td>
            </tr>
            <tr>
              <td>
                <code>--radius-md</code>
              </td>
              <td>The pane's corners. The groove's are that plus its lip.</td>
            </tr>
            <tr>
              <td>
                <code>--motion-slide</code>, <code>--motion-quick</code>
              </td>
              <td>240ms for the thumb's glide, 120ms for a pane that fades in.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        Buttons with <code>role="radio"</code> or <code>aria-pressed</code> work in every current browser and screen
        reader. The thumb glides where the browser has CSS anchor positioning. Without it the
        checked segment draws its own pane and the thumb jumps rather than glides. Glass needs{" "}
        <code>backdrop-filter</code> and falls back to classic without it.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's ToggleGroup for the component and its two kinds, and the segmented controls of iOS and macOS for the raised thumb in a groove. It builds them from hidden radios and
        checkboxes in labels; here the segments are buttons, so one is a single Tab stop with the APG keys, and a
        screen reader hears a radio group or toggle buttons rather than form fields. APG's radio group for the
        segmented control, and its toolbar for several at once. Catalyst and Headless UI have none; the{" "}
        <code>value</code>, <code>defaultValue</code> and <code>onChange</code> shape follows Headless UI's RadioGroup.
      </p>

      <h2>Examples</h2>
      <p>
        Each is the Solid component, live. Click a segment or use the arrows. Switch the theme and mode at the top.
      </p>
      <Example title="Glass over bright content" name="toggle-group/glass" />
      <Example title="One choice, a segmented control" name="toggle-group/single" />
      <Example title="Several at once" name="toggle-group/multiple" />
      <Example title="Accent" name="toggle-group/accent" />
      <Example title="With icons" name="toggle-group/icons" />
      <Example title="Fill the width" name="toggle-group/fill" />
      <Example title="Disabled, one segment and the whole group" name="toggle-group/disabled" />
    </article>
  );
}
