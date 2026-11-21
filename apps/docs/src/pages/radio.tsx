import { Example, PropsTable } from "../spec.tsx";

export default function RadioPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Radio</h1>
      <p class="lede">One choice from a short list you can see all at once: who can see a site, when changes publish, a role.</p>
      <Example title="Radio" hero name="radio/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;input type="radio"&gt;</code>, drawn by the kit. The browser does the rest: radios
          with the same <code>name</code> are one group, checking one unchecks the others, the arrow keys move
          between them, the form sends the checked one's <code>value</code>, and a form reset puts back the choice
          the radio started with.
        </li>
        <li>
          It is drawn as a <strong>circle</strong> with <code>appearance: none</code>, so the focus ring around it is a
          circle too. Chrome won't round the ring of a native radio. The moving focus ring glides from one radio to
          the next as the arrow keys move, and from a button's corners into the circle.
        </li>
        <li>
          Unchecked, it is a <strong>well</strong>, like an <a href="/input">Input</a>. Its edge is darker than a
          field's, so the circle shows on its own at 3:1. Checked, it fills with the accent, as a primary Button
          does, and a dot grows in its middle in 120ms.
        </li>
        <li>
          <strong>RadioGroup</strong> is a <a href="/fieldset">Fieldset</a> with <code>role="radiogroup"</code>: a{" "}
          <code>Legend</code> names the question, and each option is a <code>Field</code> holding a{" "}
          <code>Radio</code> and its <code>Label</code>, with a <code>Description</code> if it needs one. The group
          gives its radios their <code>name</code>, so a form writes it once, and holds the value.
        </li>
        <li>
          The radio sits beside its label, centered on the label's first line, and a description goes under the
          label. A click anywhere on the label checks it, so the target is the whole line, not a 16px circle.
        </li>
        <li>
          <strong>The group checks itself.</strong> A <code>required</code> group sent with nothing chosen says
          "Choose an option." under its last option, in place of the browser's bubble, and focus goes to the first
          radio. The message clears the moment one is checked, or the form is reset.
        </li>
        <li>
          It is 16px, and 20px where the pointer is a finger, with the label's text growing to 16px beside it.
        </li>
        <li>
          The CSS styles every <code>&lt;input type="radio"&gt;</code>, so a static page gets the look with no JS. Its
          rules are wrapped in <code>:where()</code>, so their specificity is 0.
        </li>
      </ul>
      <p>
        Use radios for two to about seven choices that are worth reading side by side. A long list, or one where the
        choices need no explaining, is a <code>Select</code> or a <code>Listbox</code>. Yes or no is a{" "}
        <code>Checkbox</code>, or a <code>Switch</code> when it takes effect at once.
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
              <td><code>RadioGroup</code></td>
              <td><code>&lt;fieldset role="radiogroup"&gt;</code></td>
              <td>
                The question. Its <code>Legend</code> names it, and screen readers read the name as you enter the
                group. It points <code>aria-describedby</code> at its description and its error, and carries{" "}
                <code>aria-required</code> and <code>aria-invalid</code>.
              </td>
            </tr>
            <tr>
              <td><code>Field</code></td>
              <td><code>&lt;beautiful-field&gt;</code></td>
              <td>One option: the radio, its label, and its description. Fieldset's.</td>
            </tr>
            <tr>
              <td><code>Radio</code></td>
              <td><code>&lt;input type="radio"&gt;</code></td>
              <td>
                The circle. Its <code>name</code> comes from the group, its <code>id</code> and links from the Field.
              </td>
            </tr>
            <tr>
              <td>Dot</td>
              <td>the radio's background</td>
              <td>
                A radial gradient in white on the accent, 6px across (8px at touch size). An <code>&lt;input&gt;</code>{" "}
                can't hold a pseudo-element in every browser, so it is drawn on the radio itself, with no extra node.
              </td>
            </tr>
            <tr>
              <td><code>ErrorMessage</code></td>
              <td><code>&lt;p data-error&gt;</code></td>
              <td>The group's error, under its last option, in the danger color.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>RadioGroup</h3>
      <PropsTable
        rows={[
          {
            name: "name",
            type: "string",
            default: "a unique name",
            description: "The name the form sends the value under. Every Radio in the group takes it.",
          },
          {
            name: "value",
            type: "string",
            default: "none",
            description: (
              <>
                The checked radio's value, when the page holds it. Pair it with <code>onChange</code>. A form reset leaves
                a group the page holds as the page has it.
              </>
            ),
          },
          {
            name: "defaultValue",
            type: "string",
            default: "none",
            description: "The radio checked at first, when the group holds the value itself. A form reset comes back to it.",
          },
          {
            name: "onChange",
            type: "(value: string) => void",
            default: "none",
            description: "Called with the new value when a radio is checked, by a click, a tap, an arrow key or a form reset that changes the choice.",
          },
          {
            name: "required",
            type: "boolean",
            default: "false",
            description: (
              <>
                The form can't be sent until one is checked. Sent without one, the group shows "Choose an option."
              </>
            ),
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables every radio in the group, and fades the legend and descriptions with them.",
          },
          {
            name: "id",
            type: "string",
            default: "a unique id",
            description: (
              <>
                The fieldset's id. Its description is <code>&lt;id&gt;-description</code> and its error{" "}
                <code>&lt;id&gt;-error</code>, as with Fieldset.
              </>
            ),
          },
          {
            name: "children",
            type: "JSX.Element",
            description: (
              <>
                A <code>Legend</code>, an optional <code>Description</code>, then a <code>Field</code> per option.
              </>
            ),
          },
        ]}
      />
      <h3>Radio</h3>
      <PropsTable
        rows={[
          { name: "value", type: "string", description: "What the form sends, and what onChange gets, when this one is checked." },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "This option can't be chosen. The arrow keys skip it. Its Field fades its label and description.",
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Description, Field, Label, Legend, Radio, RadioGroup } from "beautiful-ui-solid";

const [when, setWhen] = createSignal("now");

<RadioGroup name="publish-when" value={when()} onChange={setWhen}>
  <Legend>Publish changes</Legend>
  <Description>Applies to every page on the site.</Description>
  <Field>
    <Radio value="now" />
    <Label>Right away</Label>
    <Description>Visitors see a change the moment you save it.</Description>
  </Field>
  <Field>
    <Radio value="review" />
    <Label>After a teammate approves</Label>
  </Field>
</RadioGroup>`}</code>
      </pre>
      <p>
        Other attributes pass through: on RadioGroup to the <code>&lt;fieldset&gt;</code>, and on Radio to the{" "}
        <code>&lt;input&gt;</code>, such as <code>form</code>, <code>aria-*</code> and event handlers. A Radio outside a
        RadioGroup works too, as a plain radio with its own <code>name</code> and <code>checked</code>.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the APG Radio Group pattern. Native radios meet all of it, so Radio adds no key handling: the group's
        script only holds the value and the error.
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
                The group is one stop. Tab lands on the checked radio. With none checked, it lands on the first, and
                Shift+Tab on the last. The next Tab leaves the group.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>↓</kbd> <kbd>→</kbd>
              </td>
              <td>Moves to the next radio and checks it. From the last, it wraps to the first. A disabled radio is skipped.</td>
            </tr>
            <tr>
              <td>
                <kbd>↑</kbd> <kbd>←</kbd>
              </td>
              <td>Moves to the previous radio and checks it, wrapping from the first to the last.</td>
            </tr>
            <tr>
              <td>
                <kbd>Space</kbd>
              </td>
              <td>Checks the focused radio, when Tab landed on one with none checked yet.</td>
            </tr>
            <tr>
              <td>Click or tap</td>
              <td>On the circle or anywhere on its label, checks it.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read the group's legend and description as you enter it, then the radio: "Only the team, radio button,
                not checked, 2 of 3". An option's description follows its label. In an invalid group, each radio is
                read as invalid, and the group's error with it.
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
              <td>Unchecked</td>
              <td>A well: the field fill, a soft shade inside the top edge, and an edge of zinc 500 (3:1 at least).</td>
            </tr>
            <tr>
              <td>Hover</td>
              <td>The edge darkens in light mode and brightens in dark, in 120ms. Only where there's a pointer that hovers.</td>
            </tr>
            <tr>
              <td>Checked</td>
              <td>
                The accent fills the circle, edge and all, and a white dot grows in the middle in 120ms. Under reduced
                motion the dot appears at its size, and the fill still fades in.
              </td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>The kit's 2px accent ring, 2px out, round. Keyboard focus only.</td>
            </tr>
            <tr>
              <td>Disabled</td>
              <td>
                The radio, its label and its description at 50%, checked or not. A disabled group fades its legend and
                description too.
              </td>
            </tr>
            <tr>
              <td>Invalid</td>
              <td>
                Each unchecked radio takes the danger edge, and the group's error shows under its last option. Checking
                one clears both.
              </td>
            </tr>
            <tr>
              <td>Forced colors</td>
              <td>
                Windows' high-contrast themes drop backgrounds, which would hide the dot, so the browser's own radio
                draws in the system's colors instead.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> Classic is opaque: a white well in light mode, a faint lighter tint in dark.
        On glass the well is frosted like a field, and the checked fill is a primary Button's: the accent at 85%, so
        a little of the page shows through it. It falls back to classic with reduced transparency.
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
            <tr><td><code>--control-choice</code></td><td>new: 1rem (16px), 1.25rem (20px) where the pointer is a finger. A radio's circle and a checkbox's box.</td></tr>
            <tr><td><code>--control-choice-dot</code></td><td>new: 0.375rem (6px), 0.5rem (8px) at touch size. The dot in a checked radio.</td></tr>
            <tr><td><code>--control-choice-edge</code>, <code>--control-choice-edge-hover</code></td><td>new: the edge of a radio or checkbox, at 3:1 or more. Zinc 500, and on hover zinc 600 in light mode and zinc 400 in dark. Glass: black at 50% and 70%, white at 40% and 60%.</td></tr>
            <tr><td><code>--field-fill</code>, <code>--field-shadow</code></td><td>the well, as on Input</td></tr>
            <tr><td><code>--control-blur</code>, <code>--control-saturate</code></td><td>the frost on glass</td></tr>
            <tr><td><code>--color-accent-fill</code>, <code>--control-primary-opacity</code>, <code>--color-on-fill</code></td><td>the checked fill and its dot, as on a primary Button</td></tr>
            <tr><td><code>--color-danger</code></td><td>the invalid edge and the group's error</td></tr>
            <tr><td><code>--motion-quick</code>, <code>--ease-out</code></td><td>hover, and the dot growing</td></tr>
            <tr><td><code>--space-3</code>, <code>--space-4</code></td><td>a radio to its label, and the last option to the error; between options</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        Checkbox reads the same <code>--control-choice</code> tokens, so a checkbox and a radio side by side are one size
        and one family: a rounded square and a circle.
      </p>

      <h2>Platform support</h2>
      <p>
        Native radios and their keys work everywhere, and <code>appearance: none</code> is in every current browser.
        The dot grows with a registered custom property (<code>@property</code>), in Chrome, Safari 16.4 and Firefox
        128. An older browser shows the dot without the growing. <code>role="radiogroup"</code> on a{" "}
        <code>&lt;fieldset&gt;</code> is allowed by ARIA in HTML. The layout beside the label uses{" "}
        <code>:has()</code>, as Fieldset does.
      </p>

      <h2>Not in this spec</h2>
      <ul>
        <li>
          <strong>A color prop.</strong> Catalyst lets each radio take a color. Ours is always the accent, as a checked
          state should mean one thing everywhere.
        </li>
        <li>
          <strong>Options drawn as cards</strong>, such as plans side by side, which Headless UI's RadioGroup allows by
          rendering any element as an option. That would be a component of its own, on these same native radios.
        </li>
        <li>
          <strong>Options in a row.</strong> Radios stack, one per line. A short choice in a row, such as Monthly or
          Yearly, is a Toggle group.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Catalyst's Radio button for the parts (RadioGroup, a field per option, Radio) and the layout beside the
        label. Headless UI's RadioGroup for <code>value</code>, <code>defaultValue</code>, <code>onChange</code> and a
        disabled option. Its keys are roving tabindex in JS, which native radios already do. Open Props UI's Radio
        for a native radio drawn with <code>appearance: none</code>. The APG Radio Group pattern for the keys and{" "}
        <code>role="radiogroup"</code>, and WCAG 1.4.11 for the edge's contrast.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right. In Nothing chosen, press Send to see the error.</p>
      <Example title="A group" name="radio/group" />
      <Example title="With descriptions" name="radio/descriptions" />
      <Example title="Disabled" name="radio/disabled" />
      <Example title="Nothing chosen" name="radio/error" />
      <Example title="In a dialog" name="radio/glass" />
    </article>
  );
}
