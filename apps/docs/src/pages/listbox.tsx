import { Example, PropsTable } from "../spec.tsx";

export default function ListboxPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Listbox</h1>
      <p class="lede">A custom select: pick one value, or a few, from a list whose options can carry icons and descriptions.</p>
      <Example title="Listbox" hero name="listbox/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It looks like a field: the chosen option's label, and its icon, in a well with up and down chevrons at the end. A
          click, or the keys, opens the list of options below it on <a href="/popover">Popover</a>'s panel, as wide as
          the field at least. The chosen option has a check at its end.
        </li>
        <li>
          The button is a native <code>&lt;button&gt;</code> with <code>commandfor</code> and{" "}
          <code>command="toggle-popover"</code>, so the browser opens the list, places it against the field, closes it on{" "}
          <kbd>Escape</kbd> or a click outside, and returns focus to the field. The Solid component adds the keys and
          the choosing.
        </li>
        <li>
          Focus stays on the list while it's open, and the option the keys are on is lit, named to screen readers with{" "}
          <code>aria-activedescendant</code>. Combobox uses the same list with focus in its text box, so the two share
          their options, keys and look.
        </li>
        <li>
          An option is a label, with an optional icon before it and a line of description under it, or after it on the same line with <code>descriptions="inline"</code>. The field shows
          the label and icon, not the description. An option that can't be chosen now is faded and the keys skip it.
        </li>
        <li>
          With <code>multiple</code>, each pick turns an option on or off and the list stays open. The field shows the
          chosen labels with commas between them.
        </li>
        <li>
          In a <a href="/fieldset">Field</a>, it takes its label, description and error from the Field, and the Field
          checks it: <code>required</code> with nothing chosen shows "Choose an option." The form sends the value under
          its <code>name</code>, from a hidden native <code>&lt;select&gt;</code>, so a form's submit, reset and{" "}
          <code>FormData</code> work as they do for any control.
        </li>
        <li>
          It isn't for a short list of plain words in a static page: that is <strong>Select</strong>, the native{" "}
          <code>&lt;select&gt;</code>, which works with no JS. It isn't for actions either: that is{" "}
          <a href="/dropdown">Dropdown</a>. A list to search or type into is <strong>Combobox</strong>.
        </li>
      </ul>

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
              <td><code>Listbox</code></td>
              <td>
                <code>&lt;button aria-haspopup="listbox"&gt;</code> holding a <code>&lt;beautiful-listbox-value&gt;</code>,
                then <code>&lt;beautiful-popover popover&gt;</code> holding{" "}
                <code>&lt;beautiful-listbox role="listbox"&gt;</code>
              </td>
              <td>
                The field and its list. The value element holds it, so it can be cut short with an ellipsis and named
                after the label. The list scrolls inside the panel, so the panel's glass rim stays put.
              </td>
            </tr>
            <tr>
              <td><code>ListboxOption</code></td>
              <td>
                <code>&lt;beautiful-listbox-option role="option" aria-selected&gt;</code>
              </td>
              <td>
                One choice. Its children are its label, and any icon or description. The check is drawn by CSS, so it
                adds no element.
              </td>
            </tr>
            <tr>
              <td><code>ListboxDescription</code></td>
              <td>
                <code>&lt;small&gt;</code>
              </td>
              <td>A line under the option's label, or after it with <code>descriptions="inline"</code>, read with it, as Dropdown's is.</td>
            </tr>
            <tr>
              <td>An icon</td>
              <td>
                an <code>&lt;svg&gt;</code>, first in the option
              </td>
              <td>No component, as in Button and Dropdown. It takes the muted color, and shows in the field when chosen.</td>
            </tr>
            <tr>
              <td>The form's value</td>
              <td>
                <code>&lt;select hidden&gt;</code>, only with <code>name</code> or <code>required</code>
              </td>
              <td>What the form sends and checks. Hidden from everyone, screen readers too: the button is the control.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        The ids follow one rule, so static markup can write the same: the button's is the Listbox's id (a Field's, in
        one), the value's is <code>&lt;id&gt;-value</code>, the panel's <code>&lt;id&gt;-options</code>, each
        option's <code>&lt;id&gt;-option-&lt;value&gt;</code> with the value escaped as in a URL, and the label's{" "}
        <code>&lt;id&gt;-label</code>, unless it has its own. The button is named by the label and the value together, so a
        screen reader says "Status, Paid".
      </p>

      <h2>Props</h2>
      <h3>Listbox</h3>
      <PropsTable
        rows={[
          {
            name: "value",
            type: "string, or string[] with multiple",
            default: "none",
            description: "The chosen option's value. Leave it out for a list that keeps its own value, from defaultValue.",
          },
          {
            name: "defaultValue",
            type: "string, or string[] with multiple",
            default: "none",
            description: "The first value of a list that keeps its own, and the value a form's reset puts back.",
          },
          {
            name: "onChange",
            type: "(value) => void",
            default: "none",
            description: "Called with the new value when an option is picked, or the form is reset.",
          },
          {
            name: "multiple",
            type: "boolean",
            default: "false",
            description: "Lets several options be chosen. Each pick turns one on or off, and the list stays open.",
          },
          {
            name: "placeholder",
            type: "string",
            default: "none",
            description: "Shown, muted, while nothing is chosen.",
          },
          {
            name: "name",
            type: "string",
            default: "none",
            description: "The name the form sends the value under, once for each value with multiple.",
          },
          {
            name: "required",
            type: "boolean",
            default: "false",
            description: "The form won't send until an option is chosen, and the Field says so.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Fades the field and keeps the list shut. In a Field, the Field's disabled sets it.",
          },
          {
            name: "descriptions",
            type: '"below" | "inline"',
            default: '"below"',
            description: (
              <>
                Where each option's description goes: under its label, for a long one, or after it on the same line,
                cut short with an ellipsis, for a short one such as a @handle. It sets <code>data-descriptions</code> on
                the list.
              </>
            ),
          },
          {
            name: "anchor",
            type: "PopoverPanel's anchor",
            default: '"bottom start"',
            description: (
              <>
                Where the list opens against the field, as on <a href="/popover">PopoverPanel</a>. It flips above where
                there's no room below.
              </>
            ),
          },
          {
            name: "id",
            type: "string",
            default: "made up",
            description: "The button's id. In a Field, the Field sets it, so its label points at the button.",
          },
          {
            name: "aria-label",
            type: "string",
            default: "none",
            description: "Names the field and its list where no Field's label does.",
          },
          { name: "children", type: "JSX.Element", description: "The options." },
        ]}
      />
      <h3>ListboxOption</h3>
      <PropsTable
        rows={[
          { name: "value", type: "string", description: "What choosing it sets the value to, and what the form sends." },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Fades the option. The keys and the pointer pass over it.",
          },
          { name: "children", type: "JSX.Element", description: "The label, and any icon or description." },
        ]}
      />
      <p>
        <code>ListboxDescription</code> takes its text as children. Other attributes pass through to each element.
      </p>
      <pre tabindex="0">
        <code>{`import { Field, Label, Listbox, ListboxDescription, ListboxOption } from "beautiful-ui-solid";

<Field>
  <Label>Status</Label>
  <Listbox name="status" value={status()} onChange={setStatus} placeholder="Pick a status">
    <ListboxOption value="draft">Draft</ListboxOption>
    <ListboxOption value="sent">Sent</ListboxOption>
    <ListboxOption value="paid">
      Paid
      <ListboxDescription>The money is in.</ListboxDescription>
    </ListboxOption>
    <ListboxOption value="void" disabled>Void</ListboxOption>
  </Listbox>
</Field>`}</code>
      </pre>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/">APG listbox pattern</a> and its{" "}
        <a href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/">select-only combobox</a>,
        with Headless UI's Listbox for the pointer.
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
                <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> on the field
              </td>
              <td>Opens the list on the chosen option, or the first one when none is.</td>
            </tr>
            <tr>
              <td>
                <kbd>↑</kbd> on the field
              </td>
              <td>Opens the list on the chosen option, or the last one.</td>
            </tr>
            <tr>
              <td>A letter on the field</td>
              <td>Opens the list on the next option whose label starts with it.</td>
            </tr>
            <tr>
              <td>Click on the field</td>
              <td>
                Opens the list with the chosen option lit, scrolled to the middle of the list. With none chosen, no
                option is lit, and <kbd>↓</kbd> goes to the first. A second click closes it.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>↓</kbd>, <kbd>↑</kbd>
              </td>
              <td>Moves to the next or previous option, skipping disabled ones. It stops at the ends, as a native select does.</td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Page Up</kbd>, <kbd>Page Down</kbd>
              </td>
              <td>Moves to the first or last option, or a listful up or down.</td>
            </tr>
            <tr>
              <td>Letters</td>
              <td>
                Move to the next option whose label starts with them. Letters typed within half a second add up, so{" "}
                <kbd>N</kbd> <kbd>E</kbd> <kbd>W</kbd> finds New Zealand past Netherlands, and a space typed within one is
                part of it.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>, or a click on an option
              </td>
              <td>
                Chooses it, closes the list, and returns focus to the field. With <code>multiple</code>, it turns the
                option on or off and the list stays open.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>Closes the list, keeps the value as it was, and returns focus to the field.</td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>, <kbd>Shift</kbd> <kbd>Tab</kbd>
              </td>
              <td>
                Closes the list, keeps the value, and moves on to the next or previous control. APG's select-only
                combobox chooses the lit option on <kbd>Tab</kbd>. We keep the value, as <kbd>Escape</kbd> does, so
                passing through never changes it.
              </td>
            </tr>
            <tr>
              <td>Pointer over an option</td>
              <td>Lights it, so the keys go on from there. Leaving the list lights none.</td>
            </tr>
            <tr>
              <td>Click on the field's label</td>
              <td>Focuses the field without opening it, as a native select's label does.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce the field as a pop-up button named by its label and value, such as "Status, Paid", collapsed
                or expanded, with its description and error. The list takes the label as its name, and says when
                several can be chosen. Each option is read with its place, such as 3 of 5, and whether it's selected. A
                description is read with its label.
              </td>
            </tr>
            <tr>
              <td>No JS</td>
              <td>
                The button opens and closes the list, but nothing can be chosen: options aren't focusable, so choosing
                needs JS. A static page with no JS uses Select. On static markup with JS, the kit's{" "}
                <code>wireListbox(listbox)</code> adds everything.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Field:</strong> Input's well, from the <code>--field-*</code> tokens, with its hover edge. The value
          is one line, cut short with an ellipsis. With nothing chosen, the placeholder is muted. Focus is the kit's
          ring.
        </li>
        <li>
          <strong>Invalid:</strong> the danger edge, as Input's, and the Field's error under it.
        </li>
        <li>
          <strong>Disabled:</strong> faded to half, as Input is. It doesn't open.
        </li>
        <li>
          <strong>Closed, opening, closing:</strong> as Popover: grows in from the field's side over 200ms, and shrinks
          back in 120ms. Under reduced motion, a plain fade.
        </li>
        <li>
          <strong>Option lit:</strong> Dropdown's quiet tint, 9% of the text color, on the option the keys or pointer
          are on. One option is lit at a time. In forced colors, an outline.
        </li>
        <li>
          <strong>Option chosen:</strong> a check at the end of its row. Every option keeps the check's column, so a
          long label wraps short of it. The check sits at the end rather than before the label, so no empty column
          waits before the labels.
        </li>
        <li>
          <strong>Option disabled:</strong> faded to half, never lit.
        </li>
        <li>
          <strong>Size:</strong> the field is a control's height and its container's width, as Input is. The list is at
          least as wide as the field, and up to 20rem or the field's width, where a long label wraps. Options are
          Dropdown's items: 2rem tall with 14px text, and 2.75rem with 16px on touch screens.
        </li>
        <li>
          <strong>Long lists:</strong> the list shows eight and a half options, the half one a hint that it scrolls, and
          no more than 40% of the screen's height. The lit option scrolls into view, and opening scrolls the chosen one
          to the middle.
        </li>
        <li>
          <strong>Themes:</strong> the field is Input's frosted well on glass and its plain one on classic. The list is
          Popover's panel: classic's raised color with a hairline edge, or glass's frosted pane with the rim and sheen.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <p>
        Listbox reads Input's <code>--field-*</code> tokens for the field, Popover's <code>--popup-*</code> for the
        panel, and Dropdown's <code>--item-height</code> and <code>--item-tint</code> for the options. Dropdown's item
        row moves to its own stylesheet, <code>item.css</code>, which both read. It adds one token.
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
            <tr>
              <td><code>--listbox-max-height</code></td>
              <td>Eight and a half options and the list's padding, set on the list. Under it, 40% of the screen's height.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <ul>
        <li>
          As Popover: <code>popover</code> everywhere, <code>commandfor</code> in Chrome 135, Safari 26.2 and Firefox
          144, and anchor positioning in Chrome 125, Safari 26 and Firefox 147.
        </li>
        <li>
          A native <code>&lt;select&gt;</code> styled with <code>appearance: base-select</code> can hold rich options
          too, but only Chrome has it, and it can't choose several from a pop-up list. Select will use it where it's
          there. Listbox needs the same look in every browser now.
        </li>
      </ul>

      <h2>Left out</h2>
      <ul>
        <li>
          <strong>Opening over the chosen option,</strong> as a Mac's menus and Catalyst's Listbox do, with the chosen
          option sitting on the field. It moves the list with each choice, and on a phone it covers the label. The list
          opens below the field, as Dropdown's menu does.
        </li>
        <li>
          <strong>Sections with headings.</strong> Dropdown has them. A list long enough to want them is a Combobox,
          where typing finds the option.
        </li>
        <li>
          <strong>Values that aren't strings.</strong> Headless UI's can be any object. A value here is what the form
          sends, so it's a string, such as an id.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Catalyst's Listbox for the name, the parts and the check on the chosen option. Headless UI's Listbox for
        the pointer, <code>multiple</code>, and focus staying on the list with <code>aria-activedescendant</code>. APG's
        listbox and select-only combobox for the keys and roles. Popover for everything the browser does.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component live, then its code, then the markup it renders. Switch the theme and mode
        with T and M, or the toggles at the bottom right.
      </p>
      <Example title="Glass over bright content" name="listbox/glass" />
      <Example title="In a form, with a placeholder and a disabled option" name="listbox/fields" />
      <Example title="Icons and descriptions" name="listbox/icons" />
      <Example title="A long list that scrolls, with type-ahead" name="listbox/long" />
      <Example title="Several choices" name="listbox/multiple" />
      <Example title="Invalid and disabled" name="listbox/states" />
    </article>
  );
}
