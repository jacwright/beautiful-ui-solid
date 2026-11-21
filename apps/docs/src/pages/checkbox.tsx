import { Example, PropsTable } from "../spec.tsx";

export default function CheckboxPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Checkbox</h1>
      <p class="lede">A choice that is on or off: a setting, a consent, or one row picked out of many.</p>
      <Example title="Checkbox" hero name="checkbox/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;input type="checkbox"&gt;</code>. The browser does the rest: Space and a click
          toggle it, a click on its label does too, a form sends its <code>name</code> and <code>value</code> only
          while it's on, <code>required</code> asks for it to be on, and a form's reset puts it back.
        </li>
        <li>
          The kit draws the box itself (<code>appearance: none</code>), because Chrome won't round a native one. It is
          rounded 4px (<code>--radius-sm</code>), so the focus ring around it is rounded too, and the moving ring
          turns smoothly into it from a button or a field.
        </li>
        <li>
          Off, it is a small well like an <a href="/input">Input</a>, with an edge dark enough to find: 3:1 or more
          against the page, as WCAG asks of the edge that shows a control is there. On, it fills with the accent and a
          white tick grows in from its middle. It empties at once when turned off: enter is slower than exit.
        </li>
        <li>
          Mixed shows a dash, for a box that stands for several others when only some of them are on, such as "All
          changed pages". Only a script can make a box mixed, so it's the Solid component's{" "}
          <code>indeterminate</code> prop. Pressing a mixed box turns it on, and the app turns on everything it stands
          for.
        </li>
        <li>
          It is 16px, and 20px where the pointer is a finger. In a <a href="/fieldset">Field</a> it sits beside its
          label, centered on the label's first line, with the description and error under the label, and the whole
          label is the target. Several in a Fieldset make a group with a legend.
        </li>
        <li>
          In a Field, it is checked like any control. A <code>required</code> box that's left off says "Check this box
          to go on." once the form is sent.
        </li>
        <li>
          The CSS styles every <code>&lt;input type="checkbox"&gt;</code>, so a static page gets the look with no JS.
          Every rule is wrapped in <code>:where()</code>, so its specificity is 0.
        </li>
      </ul>
      <p>
        A setting that takes effect the moment it's flipped, with no Save, is a Switch. A box that's part of a form,
        sent with the rest, is a Checkbox.
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
              <td><code>Checkbox</code></td>
              <td><code>&lt;input type="checkbox"&gt;</code></td>
              <td>The box. One element and no wrapper: the label is the Field's.</td>
            </tr>
            <tr>
              <td>Tick and dash</td>
              <td>the input's <code>background-image</code></td>
              <td>
                A white SVG, 2px strokes with round ends, drawn on the fill. Not a <code>::before</code>, which Firefox
                doesn't draw on an input.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "checked",
            type: "boolean",
            default: "false",
            description: "Whether it is on. Set it from the app's state, and update the state in onChange.",
          },
          {
            name: "defaultChecked",
            type: "boolean",
            default: "false",
            description:
              "Whether it starts on, for a box the app doesn't keep in its state. A form's reset puts it back to this.",
          },
          {
            name: "indeterminate",
            type: "boolean",
            default: "false",
            description: (
              <>
                Mixed: shows a dash and tells screen readers "mixed". It wins over <code>checked</code> while it is
                true. The browser clears it when the box is pressed.
              </>
            ),
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Can't be focused or changed, and isn't sent. It fades, with its label. A Field's disabled sets it too.",
          },
          {
            name: "name",
            type: "string",
            default: "none",
            description: "The form field it sends while it's on.",
          },
          {
            name: "value",
            type: "string",
            default: '"on"',
            description: "What it sends. Boxes that share a name send one value each, such as the pages to publish.",
          },
          {
            name: "required",
            type: "boolean",
            default: "false",
            description: "Must be on for its form to send, such as agreeing to terms.",
          },
          {
            name: "onChange",
            type: "(event) => void",
            default: "none",
            description: (
              <>
                After each toggle. <code>event.currentTarget.checked</code> is the new state.
              </>
            ),
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Checkbox, Description, Field, Fieldset, Label, Legend } from "beautiful-ui-solid";

<Fieldset>
  <Legend>Spring launch</Legend>
  <Field>
    <Checkbox name="search" checked={search()} onChange={(e) => setSearch(e.currentTarget.checked)} />
    <Label>Show in search results</Label>
    <Description>Lets Google and Bing list the site's pages.</Description>
  </Field>
</Fieldset>

// A box that stands for others.
<Checkbox
  aria-label="Select every submission"
  checked={rows().length > 0 && picked().length === rows().length}
  indeterminate={picked().length > 0 && picked().length < rows().length}
  onChange={(e) => setPicked(e.currentTarget.checked ? rows() : [])}
/>`}</code>
      </pre>
      <p>
        In a Field, it takes its id, its description and error links, and <code>disabled</code> from the Field, as
        Input does. Other attributes pass through to the <code>&lt;input&gt;</code>: <code>id</code>,{" "}
        <code>class</code>, <code>form</code>, <code>aria-*</code>, and event handlers. A box with no label beside it,
        such as one per table row, needs an <code>aria-label</code> that says which row.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the APG Checkbox pattern. A native checkbox meets all of it, so Checkbox adds no keys. For a mixed box,
        the app keeps <code>indeterminate</code> in step with the boxes it stands for.
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
                Moves focus to the box and on. Every box is a stop, unlike radios, and a disabled one is skipped.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Space</kbd>
              </td>
              <td>Turns it on or off. A mixed box turns on.</td>
            </tr>
            <tr>
              <td>A click on the label</td>
              <td>Toggles the box and focuses it, so a long label is one big target.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read the label, "checkbox", and "checked", "not checked" or "mixed", then the description and any error.
                In a Fieldset, the legend first. An invalid box is announced as invalid.
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
              <td>Off</td>
              <td>The field's well and soft inner shade, with a zinc 500 edge.</td>
            </tr>
            <tr>
              <td>Hover</td>
              <td>The edge darkens in 120ms (lightens in dark mode). Only where a pointer can hover.</td>
            </tr>
            <tr>
              <td>On</td>
              <td>
                The accent fill, the color of a primary Button, with a white tick. The fill fades in over 120ms and the
                tick grows from half size with a slight spring. Under reduced motion it only fades.
              </td>
            </tr>
            <tr>
              <td>Mixed</td>
              <td>The same fill, with a white dash.</td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>The kit's 2px accent ring, 2px out, following the 4px corners. Keyboard focus only.</td>
            </tr>
            <tr>
              <td>Invalid</td>
              <td>
                The edge turns the danger color while the box is off, and the Field shows the error under the label.
              </td>
            </tr>
            <tr>
              <td>Disabled</td>
              <td>Half opacity, on or off, with its label and description. No hover.</td>
            </tr>
            <tr>
              <td>Forced colors</td>
              <td>
                Windows' high contrast drops the fill, which would hide the white tick, so the browser draws its own box in
                the system's colors there.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> On glass the well is frosted like a field, and the edge is see-through but
        still 3:1 over the page. The fill is a primary Button's: the accent at 85%, so a little of the page shows
        through. Classic is opaque.
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
            <tr>
              <td><code>--control-choice</code></td>
              <td>new, shared with Radio: 1rem (16px), 1.25rem (20px) where the pointer is a finger</td>
            </tr>
            <tr>
              <td><code>--control-choice-edge</code>, <code>--control-choice-edge-hover</code></td>
              <td>
                new, shared with Radio: the edge while off, at least 3:1. Classic zinc 500, and zinc 600 or 400 on
                hover. Glass a black or white at 50% (40% in dark), and 70% (60%) on hover.
              </td>
            </tr>
            <tr><td><code>--field-fill</code>, <code>--field-shadow</code></td><td>the well while off, as Input's</td></tr>
            <tr><td><code>--control-blur</code>, <code>--control-saturate</code></td><td>the frost behind it on glass</td></tr>
            <tr>
              <td><code>--color-accent-fill</code>, <code>--control-primary-opacity</code></td>
              <td>the fill while on or mixed, as a primary Button's</td>
            </tr>
            <tr><td><code>--color-on-fill</code></td><td>white: the tick and the dash</td></tr>
            <tr><td><code>--color-danger</code></td><td>the edge while invalid</td></tr>
            <tr><td><code>--radius-sm</code></td><td>0.25rem (4px): the corners, and the focus ring's</td></tr>
            <tr>
              <td><code>--motion-quick</code>, <code>--ease-out</code>, <code>--ease-spring</code></td>
              <td>the fill and edge changes, and the tick growing in</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Not included</h2>
      <ul>
        <li>
          <strong>A color prop.</strong> Catalyst offers twenty fills. A box is on or off, and the accent says on
          everywhere in the kit.
        </li>
        <li>
          <strong>CheckboxGroup and CheckboxField.</strong> Catalyst's are our Fieldset and Field, which every control
          shares.
        </li>
        <li>
          <strong>A mixed box that remembers.</strong> APG's example cycles a mixed box through on, off and back to the
          mix it had. Ours turns on and off, as Gmail's and GitHub's do, which is what people expect.
        </li>
      </ul>

      <h2>Platform support</h2>
      <p>
        <code>appearance: none</code> on a checkbox, <code>:indeterminate</code>, <code>color-mix()</code> and{" "}
        <code>forced-colors</code> are in every current browser. Glass's frost falls back to classic's opaque well
        where <code>backdrop-filter</code> is missing.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Checkbox for the size, the rounded box, the dash for mixed and the label beside it. Headless UI's
        Checkbox for <code>indeterminate</code> as a prop, though we keep the native input where it renders a span.
        Open Props UI's Checkbox for drawing a native input with <code>appearance: none</code>. The APG Checkbox
        pattern for the keys and its mixed example for <code>aria-controls</code> on a box that stands for others.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with its code and the markup it renders. Each "select all" box keeps the
        list of what's on, as an app would. Switch the theme and mode at the top.
      </p>
      <Example title="Settings" name="checkbox/settings" />
      <Example title="Select all" name="checkbox/select-all" />
      <Example title="In a table" name="checkbox/table" />
      <Example title="Invalid and disabled" name="checkbox/states" />
      <Example title="In a dialog" name="checkbox/glass" />
    </article>
  );
}
