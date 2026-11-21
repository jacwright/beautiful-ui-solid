import { Example, PropsTable } from "../spec.tsx";

export default function SelectPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Select</h1>
      <p class="lede">Pick one value from a short, fixed list: a plan, a time zone, a role, a date range.</p>
      <Example title="Select" hero name="select/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;select&gt;</code>, styled. The browser does the list, the keys, typing to jump to
          an option, autofill, and the phone's own picker.
        </li>
        <li>
          <strong>It is the same box as an Input</strong>: the same well, height, edge, corners and text, with a
          chevron at its end. A select and an input side by side in a form line up exactly.
        </li>
        <li>
          <strong>The open list is the kit's own</strong> in Chrome and Edge with a mouse or trackpad: Popover's
          panel, frosted on glass, with Dropdown's quiet tint on the option you're on and a check by the picked one.
          It opens under the select, at least as wide, and flips above where there's no room below. This is the
          browser's customizable select, so it is still the native control, with no JS.
        </li>
        <li>
          <strong>Elsewhere the browser draws the list</strong>: Safari and Firefox on a computer, and every phone
          and tablet, where the sheet or wheel the phone gives is easier to hit with a finger than a list under the
          field. The closed select looks the same everywhere.
        </li>
        <li>
          A <strong>placeholder</strong>, such as "Choose a plan", shows in the muted ink until a choice is made,
          and isn't in the list. On a required select, the Field says "Choose an option." if it's left on the
          placeholder.
        </li>
        <li>
          Options can sit in <strong>groups</strong>, each under a small muted heading, as a Dropdown's sections
          are. An option can be disabled, faded and skipped by the keys.
        </li>
        <li>
          In a <a href="/fieldset">Field</a> it takes its label, description and error from the field, and the Field
          checks it, as it does an Input. Outside a field it needs an <code>aria-label</code>, as the date range on
          the glass example has.
        </li>
        <li>It fills the width of what it sits in, as an Input does, so a form's column sets it.</li>
        <li>On a phone the text is 16px, so iOS doesn't zoom the page when the select is focused.</li>
      </ul>
      <p>
        Left out: picking several values (<code>multiple</code>), which needs a modifier key few people know, and a
        list of rows always open (<code>size</code>). A group of checkboxes, or Listbox, does those better. Options
        with an icon, an avatar or a second line are Listbox too. A search box in the list is Combobox. Sizes other
        than the one control height are left out, as on Input.
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
              <td><code>Select</code></td>
              <td><code>&lt;select&gt;</code></td>
              <td>
                The control. 36px tall, or 44px for a finger, with 14px text (16px for a finger), and a 16px chevron
                at its end.
              </td>
            </tr>
            <tr>
              <td>its children</td>
              <td><code>&lt;option&gt;</code>, <code>&lt;optgroup label&gt;</code></td>
              <td>
                The choices, written as native elements. No wrapper components: an option is already the element it
                would render. In the kit's list an option is a row as tall as a Dropdown item, 32px, or 44px for a
                finger.
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
            type: "string",
            default: "the first option",
            description: (
              <>
                The picked option's <code>value</code>. Read it back with <code>onChange</code>, as on any native
                select.
              </>
            ),
          },
          {
            name: "placeholder",
            type: "string",
            default: "none",
            description: (
              <>
                What shows, muted, until a choice is made, such as "Choose a plan". It isn't in the list and can't be
                picked again. Set it with <code>required</code> when a choice must be made. An optional select with
                nothing picked has a real option for that, such as "No redirect".
              </>
            ),
          },
          {
            name: "required",
            type: "boolean",
            default: "false",
            description: "A choice must be made: the Field says so when the placeholder is still showing.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Can't be focused or changed, and isn't sent with the form. A Field's disabled sets it too.",
          },
          {
            name: "children",
            type: "<option>, <optgroup>",
            default: "none",
            description: (
              <>
                The choices. An <code>&lt;option&gt;</code> takes its <code>value</code>, <code>disabled</code> and
                its text. An <code>&lt;optgroup label&gt;</code> heads a group of them.
              </>
            ),
          },
        ]}
      />
      <p>
        Every other native attribute passes through: <code>name</code>, <code>autocomplete</code> (such as{" "}
        <code>country</code> or <code>bday-month</code>), <code>form</code>, <code>onChange</code>.
      </p>
      <pre tabindex="0">
        <code>{`import { Description, Field, Label, Select } from "beautiful-ui-solid";

<Field>
  <Label>Plan</Label>
  <Description>You can change plans at any time.</Description>
  <Select name="plan" placeholder="Choose a plan" required>
    <option value="starter">Starter, $9 a month</option>
    <option value="pro">Pro, $29 a month</option>
    <option value="business">Business, $99 a month</option>
  </Select>
</Field>`}</code>
      </pre>
      <p>
        The placeholder renders as a first <code>&lt;option value="" disabled hidden selected&gt;</code>, which is
        how the static markup writes one: disabled and hidden so it can't be picked again, and selected because the
        browser otherwise starts on the first option it can pick. A select that's on it has the value{" "}
        <code>""</code>, which is what makes a required one invalid. An optional select left on its placeholder sends nothing under its
        name, as an empty field the browser leaves out.
      </p>

      <Example title="Checked when the form is sent" name="select/checking" />

      <h2>Keyboard and screen readers</h2>
      <p>
        APG's Select-Only Combobox is the pattern a custom select copies. A native select is that pattern already,
        and the browser does all of it.
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
                Move onto the select and off it. A disabled one is skipped. The focus ring is the kit's 2px accent
                ring, and it glides in from the last control.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Alt</kbd> + <kbd>↓</kbd>, or a
                click
              </td>
              <td>
                Opens the list, with focus on the picked option. In Safari and Firefox on a computer, the arrows on a
                closed select change its value instead, as those browsers' own selects do.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>↑</kbd> <kbd>↓</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>, in the list
              </td>
              <td>Light the option before or after, or the first or last. Disabled options are passed over.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>, or a click on an option
              </td>
              <td>Picks it, closes the list, and puts focus back on the select.</td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>, a click outside, or <kbd>Tab</kbd>
              </td>
              <td>Closes the list without changing the value, and puts focus back on the select.</td>
            </tr>
            <tr>
              <td>Typing letters</td>
              <td>
                Jumps to the first option that starts with them: in Time zone, "be" finds Berlin. On a closed select it picks
                it, and in the open list it lights it for Enter to pick.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read the label as its name, then the value, the description and the error, and say it is a pop-up
                button or combo box, required or invalid. In the list, each option is read with its place, such as "2
                of 4", and the group it's in.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Rest:</strong> Input's well, with the chevron in the muted text color. A placeholder is in the
          muted color too, which keeps 4.5:1 on the fill.
        </li>
        <li>
          <strong>Hover:</strong> the edge darkens, only where the pointer can hover. A disabled select doesn't
          change.
        </li>
        <li>
          <strong>Focus:</strong> the kit's ring, 2px of accent 2px outside the edge. While the list is open, focus
          is on its options, and closing it puts focus back on the select.
        </li>
        <li>
          <strong>Open:</strong> the list fades and grows in from the select, faster out than in. Under reduced
          motion it only fades. The option the keyboard or pointer is on takes the quiet tint, and only one is ever
          lit. The picked option has a check before its label. Every row keeps the check's room, so the labels line
          up.
        </li>
        <li>
          <strong>Invalid:</strong> a danger edge from <code>aria-invalid</code>, with the Field's error under it.
        </li>
        <li>
          <strong>Disabled:</strong> half opacity, with its label and description, as Input does. A disabled option
          is faded in the list.
        </li>
        <li>
          <strong>Long values:</strong> the closed select ends a value too long for it with an ellipsis. The list
          is as wide as its longest option, up to the screen, and scrolls past 20rem or half the screen.
        </li>
        <li>
          <strong>Touch:</strong> 44px tall, 16px text, a 20px chevron, and the phone's own picker.
        </li>
        <li>
          <strong>Themes:</strong> classic is Input's raised fill and the classic popup. Glass is Input's frosted
          well, and the list is Popover's frosted pane. Under reduced transparency glass falls back to classic.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <p>
        Select adds one token, <code>--field-chevron</code>: the chevron as an image, for the browser's own list.
        Everything else it shares with Input, Popover and Dropdown.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>--field-fill</code>, <code>--field-edge</code>, <code>--field-edge-hover</code>, <code>--field-shadow</code>, <code>--field-autofill</code></td><td>the closed select, as Input</td></tr>
            <tr><td><code>--field-chevron</code></td><td>the chevron where the browser draws the list: zinc 500, which keeps 3:1 on the fill in both modes. The kit's list draws it in <code>--color-text-muted</code></td></tr>
            <tr><td><code>--control-height</code>, <code>--control-pad-x</code>, <code>--control-font-size</code>, <code>--control-icon</code></td><td>the size, shared with Input and Button</td></tr>
            <tr><td><code>--popup-fill</code>, <code>--popup-blur</code>, <code>--surface-*</code>, <code>--shadow-popup</code></td><td>the open list, as Popover's panel</td></tr>
            <tr><td><code>--item-height</code></td><td>an option's row, as a Dropdown item's</td></tr>
            <tr><td><code>--motion-popup-enter</code>, <code>--motion-popup-exit</code></td><td>the list opening and closing</td></tr>
            <tr><td><code>--radius-md</code>, <code>--radius-lg</code>, <code>--space-1</code>, <code>--space-2</code></td><td>the select's corners, the list's corners, its padding and the gap to the select</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        The native select works everywhere. The kit's list is the customizable select, <code>appearance:
        base-select</code>, in Chrome and Edge 135 and later. Where it's missing, or the pointer is a finger, the
        same markup gets the browser's own list and the chevron is drawn as a background image. Nothing needs JS:
        the styled markup works on a static marketing page.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Select for a native select that matches its Input, with a chevron at the end. Headless UI's Select
        for reading <code>disabled</code> and <code>invalid</code> from the Field around it, which{" "}
        <code>useField</code> does here. Open Props UI's Select for the native control's CSS. APG's Select-Only
        Combobox for the keys. HTML's customizable select for the kit's list.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right, and open a select to see its list.
      </p>
      <Example title="Fields" name="select/fields" />
      <Example title="Invalid, disabled, and a disabled option" name="select/states" />
      <Example title="Beside an input and a button" name="select/row" />
      <Example title="On glass, and in a dialog" name="select/glass" />
    </article>
  );
}
