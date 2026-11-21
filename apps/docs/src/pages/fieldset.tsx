import { Example, PropsTable } from "../spec.tsx";

export default function FieldsetPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Fieldset</h1>
      <p class="lede">
        Names and explains form controls: a label, a description and an error for each control, and a legend for a
        group of them.
      </p>
      <Example title="Fieldset" hero name="fieldset/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          A <strong>field</strong> is one control with its label, an optional description, and an error when there
          is one. It stacks them: label, description, control, error. A checkbox or radio sits beside its label
          instead, with the rest under the label.
        </li>
        <li>
          A <strong>fieldset</strong> is a native <code>&lt;fieldset&gt;</code> that groups related fields under a{" "}
          <code>&lt;legend&gt;</code>, such as an address or a list of checkboxes. Its <code>disabled</code> is the
          native one: it disables every control inside, and the browser takes them out of the Tab order.
        </li>
        <li>
          The label is a native <code>&lt;label for&gt;</code>, so a click or tap on it focuses the control, or
          ticks the checkbox. The description and error are linked to the control with{" "}
          <code>aria-describedby</code>, and an error marks it <code>aria-invalid</code>.
        </li>
        <li>
          The Solid components write the ids and the links. Every form control in the kit (Input, Select, Textarea,
          Checkbox, Radio, Switch, Range, Listbox) reads them from the Field it sits in, so a form never writes an id
          by hand. A control outside a Field works on its own.
        </li>
        <li>
          The CSS styles the native markup, so a static page gets the layout with no JS when it writes the ids
          itself, as the examples do.
        </li>
        <li>
          It has no surface of its own: no box or border around a group. The themes differ only in the controls
          inside.
        </li>
      </ul>
      <p>
        Catalyst's FieldGroup, a wrapper that spaces the fields in a fieldset, is left out: the CSS spaces fields
        that follow each other, so it needs no element.
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
              <td><code>Fieldset</code></td>
              <td><code>&lt;fieldset&gt;</code></td>
              <td>Groups fields. The legend names the group, and its description describes it.</td>
            </tr>
            <tr>
              <td><code>Legend</code></td>
              <td><code>&lt;legend&gt;</code></td>
              <td>The group's name, first in the fieldset. 16px semibold, a step above the labels.</td>
            </tr>
            <tr>
              <td><code>Field</code></td>
              <td><code>&lt;beautiful-field&gt;</code></td>
              <td>
                One control and its parts. It lays them out and gives them their ids. No semantic element fits, so
                it is a light DOM styling hook.
              </td>
            </tr>
            <tr>
              <td><code>Label</code></td>
              <td><code>&lt;label for&gt;</code></td>
              <td>
                The control's name. Medium weight, in the text color. A <code>&lt;small&gt;</code> inside it, such as
                "Optional", is muted.
              </td>
            </tr>
            <tr>
              <td><code>Description</code></td>
              <td><code>&lt;p&gt;</code></td>
              <td>
                Help with the control, in muted text. Directly in a Fieldset, under the legend, it describes the
                group instead.
              </td>
            </tr>
            <tr>
              <td><code>ErrorMessage</code></td>
              <td><code>&lt;p data-error&gt;</code></td>
              <td>What's wrong with the value and how to fix it, in the danger color, under the control.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        The ids follow one rule, so static markup can write them too. The control's id is the field's id, the
        description's is <code>&lt;id&gt;-description</code>, and the error's is <code>&lt;id&gt;-error</code>. A
        fieldset's description is <code>&lt;fieldset id&gt;-description</code>.
      </p>

      <h2>Props</h2>
      <h3>Fieldset</h3>
      <PropsTable
        rows={[
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "The native disabled: every control inside is disabled, and the group fades.",
          },
          {
            name: "id",
            type: "string",
            default: "a unique id",
            description: "The fieldset's id. Its description's id is made from it.",
          },
        ]}
      />
      <h3>Field</h3>
      <PropsTable
        rows={[
          {
            name: "id",
            type: "string",
            default: "a unique id",
            description: "The control's id. Set it when something outside the field must point at the control.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables the control, and fades the label, description and error.",
          },
        ]}
      />
      <p>
        <code>Legend</code>, <code>Label</code>, <code>Description</code> and <code>ErrorMessage</code> take only
        their children. Other attributes pass through to every part's element: <code>name</code> and{" "}
        <code>form</code> on a fieldset, <code>class</code>, <code>aria-*</code>. A Field is invalid while it holds
        an ErrorMessage, so showing the error is the only step.
      </p>
      <pre tabindex="0">
        <code>{`import { Description, ErrorMessage, Field, Fieldset, Input, Label, Legend } from "beautiful-ui-solid";

<Fieldset>
  <Legend>Site details</Legend>
  <Description>These show on your dashboard and in search results.</Description>
  <Field>
    <Label>Custom domain</Label>
    <Description>The address visitors type, such as springlaunch.com.</Description>
    <Input name="domain" />
    <Show when={domainError()}>
      <ErrorMessage>{domainError()}</ErrorMessage>
    </Show>
  </Field>
</Fieldset>`}</code>
      </pre>
      <p>
        A control reads its Field with <code>useField(props)</code>, which gives it its <code>id</code>,{" "}
        <code>aria-describedby</code>, <code>aria-invalid</code> and <code>disabled</code>. The control's own{" "}
        <code>aria-describedby</code> is kept after the field's. Each control's spec uses it, so only a new
        control has to.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        APG has no pattern for a field or a fieldset: they are native elements, and the browser does all of this.
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
              <td>
                Move through the controls in the order they're written. A disabled control is skipped, and so is
                every control in a disabled fieldset.
              </td>
            </tr>
            <tr>
              <td>A click or tap on a label</td>
              <td>Focuses its control. On a checkbox or radio, it ticks it, so the whole label is the target.</td>
            </tr>
            <tr>
              <td>Screen readers, at a control</td>
              <td>
                Read the label as its name, then the description and the error, and say it is invalid when there is
                an error. The error is read when the control is reached, not as it appears: a form that checks on
                submit moves focus to the first invalid control.
              </td>
            </tr>
            <tr>
              <td>Screen readers, entering a fieldset</td>
              <td>Announce a group, named by the legend, with its description.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Rest:</strong> the label in the text color, the description muted, 4px apart, and the control 8px
          below them. Fields in a group are 24px apart, and checkboxes or radios in a list 16px.
        </li>
        <li>
          <strong>Invalid:</strong> the error in the danger color, 8px under the control. The control shows it too,
          with a danger edge from <code>aria-invalid</code>: each control's spec draws it. The kit never styles{" "}
          <code>:invalid</code>, which would mark a required field red before anyone has typed in it.
        </li>
        <li>
          <strong>Disabled:</strong> the label, description and error at half opacity, like the control. In a
          disabled fieldset the legend and its description fade too.
        </li>
        <li>
          <strong>Required:</strong> the native <code>required</code> on the control, which screen readers announce.
          The label doesn't mark it. When a form has an optional field, its label ends in{" "}
          <code>&lt;small&gt;Optional&lt;/small&gt;</code>, in muted text.
        </li>
        <li>
          <strong>Touch:</strong> where the pointer is a finger, the label, description and error grow from 14px to
          16px with the control's text.
        </li>
        <li>
          <strong>Themes:</strong> the same in classic and glass. In a glass dialog, the description takes the
          panel's stronger muted color, as the dialog's own description does.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>--control-font-size</code></td><td>the label, description and error: 14px, or 16px for a coarse pointer</td></tr>
            <tr><td><code>--text-base</code></td><td>the legend</td></tr>
            <tr><td><code>--color-text</code>, <code>--color-text-muted</code>, <code>--color-danger</code></td><td>the label, the descriptions, the error</td></tr>
            <tr><td><code>--space-1</code>, <code>--space-2</code>, <code>--space-3</code></td><td>label to description, to the control and to the error; a checkbox to its label</td></tr>
            <tr><td><code>--space-4</code>, <code>--space-6</code></td><td>between checkboxes in a list; between fields</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;fieldset&gt;</code>, <code>&lt;legend&gt;</code> and <code>&lt;label for&gt;</code> work everywhere.
        The layout uses CSS grid, and the checkbox layout and the fading of a disabled field use{" "}
        <code>:has()</code>, in every current browser. Without <code>:has()</code>, a checkbox stacks above its label.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Fieldset for the parts (Fieldset, Legend, Field, Label, Description, ErrorMessage), their order
        with the description above the control, and a checkbox field with the control beside its label. Headless UI's
        Field for a field that wires its label and description to the control by id, a field-level{" "}
        <code>disabled</code>, and <code>invalid</code> marking the control. Open Props UI's FieldSet for
        zero-specificity rules on the native elements. HTML's own <code>&lt;fieldset disabled&gt;</code> and{" "}
        <code>&lt;label for&gt;</code> for the behavior.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid components, with their code and the markup they render. Switch the theme and mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="A group of fields" name="fieldset/fields" />
      <Example title="A field with an error" name="fieldset/error" />
      <Example title="Checkboxes in a group" name="fieldset/checkboxes" />
      <Example title="A disabled group" name="fieldset/disabled" />
      <Example title="In a dialog, on glass" name="fieldset/glass" />

    </article>
  );
}
