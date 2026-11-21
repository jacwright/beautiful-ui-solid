import { Example, PropsTable } from "../spec.tsx";

export default function ComboboxPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Combobox</h1>
      <p class="lede">A text box that finds an option as you type: for a long list, such as countries or teammates, where scrolling would be slow.</p>
      <Example title="Combobox" hero name="combobox/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It looks like <a href="/input">Input</a>, with up and down chevrons at its end. Typing filters the list under
          it to the options whose label holds what was typed, anywhere in it, ignoring case and accents, so "zur" finds
          Zürich and "york" finds New York. The first match is lit, so <kbd>Enter</kbd> takes it.
        </li>
        <li>
          The list is <a href="/listbox">Listbox</a>'s: the same options, with icons, descriptions, the check at the end of the
          chosen one, the quiet tint on the lit one, and the same keys for moving. It opens on{" "}
          <a href="/popover">Popover</a>'s panel, as wide as the field at least.
        </li>
        <li>
          Focus stays in the text box the whole time, so typing never stops. The lit option is named to screen readers
          with <code>aria-activedescendant</code>, as in Listbox.
        </li>
        <li>
          Choosing an option puts its label in the text box. The value is the option's, never the typed text: leaving
          the field with text that isn't a choice puts the chosen label back. Clearing the text and leaving chooses
          nothing.
        </li>
        <li>
          A click in the text box, or on the chevrons, opens the whole list with the chosen option lit, so it can be
          browsed as a Listbox is. The chevrons are a button for the pointer only: the keys open the list from the text
          box.
        </li>
        <li>
          When nothing matches, the list says "No matches." With <code>filter={"{false}"}</code> and{" "}
          <code>onQuery</code>, the page filters the options itself, such as by asking the server, and the list keeps
          up as they change.
        </li>
        <li>
          In a <a href="/fieldset">Field</a>, it takes its label, description and error from the Field, and the Field
          checks it: <code>required</code> with nothing chosen shows "Choose an option." The form sends the value under
          its <code>name</code>, from a hidden native <code>&lt;select&gt;</code>, as Listbox does.
        </li>
        <li>
          For a short list, under about fifteen options, use <a href="/listbox">Listbox</a>, or{" "}
          <a href="/select">Select</a> for plain words on a static page. To type anything with suggestions under it,
          use Input with a <code>&lt;datalist&gt;</code>: a Combobox only takes one of its options.
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
              <td><code>Combobox</code></td>
              <td>
                <code>&lt;beautiful-input-group&gt;</code> holding an{" "}
                <code>&lt;input role="combobox" aria-autocomplete="list"&gt;</code> and a chevron{" "}
                <code>&lt;button tabindex="-1"&gt;</code>, then <code>&lt;beautiful-popover popover="manual"&gt;</code>{" "}
                holding <code>&lt;beautiful-listbox role="listbox"&gt;</code> and a <code>&lt;p role="status"&gt;</code>
              </td>
              <td>
                The text box and its list. The group is Input's, so a leading icon fits as it does in Input. The popover
                is manual, opened against the group, because focus never leaves the text box. The line under the list
                shows only when nothing matches.
              </td>
            </tr>
            <tr>
              <td><code>ComboboxOption</code></td>
              <td>
                <code>&lt;beautiful-listbox-option role="option" aria-selected&gt;</code>
              </td>
              <td>
                One choice, as <code>ListboxOption</code>. Its children are its label, and any icon or description. The
                filter matches the label, not the description. A filtered-out option is <code>hidden</code>.
              </td>
            </tr>
            <tr>
              <td><code>ComboboxDescription</code></td>
              <td>
                <code>&lt;small&gt;</code>
              </td>
              <td>A line under the option's label, read with it, as Listbox's is.</td>
            </tr>
            <tr>
              <td>The form's value</td>
              <td>
                <code>&lt;select hidden&gt;</code>, only with <code>name</code> or <code>required</code>
              </td>
              <td>What the form sends and checks. The text box has no name, so the typed text is never sent.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        The ids follow Listbox's rule: the text box's is the Combobox's id (a Field's, in one), the panel's{" "}
        <code>&lt;id&gt;-options</code>, the list's <code>&lt;id&gt;-listbox</code>, each option's{" "}
        <code>&lt;id&gt;-option-&lt;value&gt;</code> with the value escaped as in a URL, and the label's{" "}
        <code>&lt;id&gt;-label</code>.
      </p>

      <h2>Props</h2>
      <h3>Combobox</h3>
      <PropsTable
        rows={[
          {
            name: "value",
            type: "string",
            default: "none",
            description: 'The chosen option\'s value, or "" for none. Leave it out for a field that keeps its own, from defaultValue.',
          },
          {
            name: "defaultValue",
            type: "string",
            default: "none",
            description: "The first value of a field that keeps its own, and the value a form's reset puts back.",
          },
          {
            name: "onChange",
            type: "(value: string) => void",
            default: "none",
            description: 'Called with the new value when an option is picked, the text is cleared, or the form is reset. "" is none.',
          },
          {
            name: "filter",
            type: "(label, query) => boolean, or false",
            default: "the label holds the query",
            description: (
              <>
                Which options show for what was typed. <code>false</code> shows every option, for a page that filters
                them itself with <code>onQuery</code>.
              </>
            ),
          },
          {
            name: "onQuery",
            type: "(query: string) => void",
            default: "none",
            description: 'Called as the typed text changes, and with "" when the list opens whole or closes.',
          },
          {
            name: "placeholder",
            type: "string",
            default: "none",
            description: "Shown, muted, in the empty text box.",
          },
          {
            name: "name",
            type: "string",
            default: "none",
            description: "The name the form sends the value under.",
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
            description: "As on Listbox: each option's description under its label, or after it on the same line.",
          },
          {
            name: "search",
            type: "boolean",
            default: "false",
            description:
              "A search box, for finding a page or a record rather than filling in a field: a magnifying glass at the start, fully rounded, and no chevrons, since the list is only what was typed. The input is type=\"search\". The docs site's own search is one.",
          },
          {
            name: "anchor",
            type: "PopoverPanel's anchor",
            default: '"bottom start"',
            description: "Where the list opens against the field. It flips above where there's no room below.",
          },
          {
            name: "id",
            type: "string",
            default: "made up",
            description: "The text box's id. In a Field, the Field sets it, so its label points at the text box.",
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
      <h3>ComboboxOption</h3>
      <PropsTable
        rows={[
          { name: "value", type: "string", description: "What choosing it sets the value to, and what the form sends." },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Fades the option. It still shows in the filter, and the keys and the pointer pass over it.",
          },
          { name: "children", type: "JSX.Element", description: "The label, and any icon or description." },
        ]}
      />
      <p>
        <code>ComboboxDescription</code> takes its text as children. Other attributes pass through to each element.
        Static markup, such as a plain HTML page, is wired with <code>wireCombobox(input)</code>.
      </p>
      <pre tabindex="0">
        <code>{`import { Combobox, ComboboxOption, Field, Label } from "beautiful-ui-solid";

<Field>
  <Label>Country</Label>
  <Combobox name="country" value={country()} onChange={setCountry} placeholder="Search countries">
    <For each={countries}>
      {(country) => <ComboboxOption value={country.code}>{country.name}</ComboboxOption>}
    </For>
  </Combobox>
</Field>

// Filtered by the server: show what it found for what was typed.
<Combobox filter={false} onQuery={setSearch} value={customer()} onChange={setCustomer}>
  <For each={found()}>{(c) => <ComboboxOption value={c.id}>{c.name}</ComboboxOption>}</For>
</Combobox>`}</code>
      </pre>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/">APG combobox pattern</a> and its{" "}
        <a href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/">list autocomplete example</a>,
        with Headless UI's Combobox for the pointer and the value.
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
              <td>Typing</td>
              <td>Filters the list and opens it, with the first match lit. Clearing the text shows the whole list, with none lit.</td>
            </tr>
            <tr>
              <td>
                <kbd>↓</kbd>, <kbd>↑</kbd> with the list shut
              </td>
              <td>
                Opens the whole list on the chosen option, or on the first one (<kbd>↓</kbd>) or the last (
                <kbd>↑</kbd>) when none is. <kbd>Alt</kbd> <kbd>↓</kbd> opens it with none lit.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>↓</kbd>, <kbd>↑</kbd> in the list
              </td>
              <td>Moves to the next or previous option shown, skipping disabled ones. It stops at the ends, as Listbox does.</td>
            </tr>
            <tr>
              <td>
                <kbd>Page Down</kbd>, <kbd>Page Up</kbd>
              </td>
              <td>Moves a listful down or up.</td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>←</kbd>, <kbd>→</kbd>
              </td>
              <td>Move the caret in the text, as in any text box. The lit option stays.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd> or a click on an option
              </td>
              <td>
                Chooses it: the text becomes its label and the list closes. With the list shut, <kbd>Enter</kbd> sends the
                form, as in any text box.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>, <kbd>Alt</kbd> <kbd>↑</kbd>
              </td>
              <td>
                Closes the list and puts the chosen label back. With the list shut, <kbd>Escape</kbd> is left to what's
                around it, such as a Dialog. APG's clears the text on a second <kbd>Escape</kbd>; we don't, so a stray
                key never loses a choice.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>, <kbd>Shift</kbd> <kbd>Tab</kbd>, or a click away
              </td>
              <td>
                Closes the list and moves on, keeping the chosen value, as <kbd>Escape</kbd> does. Text that isn't a
                choice goes back to the chosen label. Empty text chooses nothing. It never picks the lit option for you.
              </td>
            </tr>
            <tr>
              <td>Click in the text box, or on the chevrons</td>
              <td>Opens the whole list with the chosen option lit, scrolled to the middle. The chevrons close it again.</td>
            </tr>
            <tr>
              <td>Pointer over an option</td>
              <td>Lights it, so the keys go on from there. Leaving the list lights none.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce a combo box named by its label, with its text, collapsed or expanded, and its description and
                error. As the keys move, each option is read with its place, such as 3 of 12 in what's shown, and whether
                it's selected. "No matches" is a status, read when it shows. The chevron button is out of the tab order,
                named "Show options".
              </td>
            </tr>
            <tr>
              <td>No JS</td>
              <td>
                A text box that does nothing: filtering needs JS. A static page with no JS uses Select, or Input with a{" "}
                <code>&lt;datalist&gt;</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Field:</strong> Input's well, with its hover edge, placeholder and the kit's focus ring. The chevrons
          sit at the end, as a tertiary icon button inside the well, as DatePicker's calendar does.
        </li>
        <li>
          <strong>Invalid:</strong> the danger edge, as Input's, and the Field's error under it.
        </li>
        <li>
          <strong>Disabled:</strong> faded to half, as Input is, with its chevrons. It doesn't open.
        </li>
        <li>
          <strong>Closed, opening, closing:</strong> as Popover: grows in from the field over 200ms, and shrinks back in
          120ms. Under reduced motion, a plain fade. Typing in an open list doesn't replay it.
        </li>
        <li>
          <strong>Filtered:</strong> only the matching options show, in their order, and the panel shrinks to fit them.
          The chosen option keeps its check while it shows.
        </li>
        <li>
          <strong>No matches:</strong> the list goes, and the panel holds one muted line, "No matches".
        </li>
        <li>
          <strong>Option lit, chosen, disabled:</strong> as Listbox: the quiet tint, the check, faded to half.
        </li>
        <li>
          <strong>Size and long lists:</strong> as Listbox: the field is a control's height and its container's width;
          the list is as wide as the field at least, shows eight and a half options at most, and scrolls the lit one
          into view.
        </li>
        <li>
          <strong>Themes:</strong> Input's frosted well on glass and its plain one on classic, and Popover's panel for
          the list: classic's raised color with a hairline edge, or glass's frosted pane with the rim and sheen.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <p>
        None of its own. Combobox reads Input's <code>--field-*</code> tokens for the text box, Popover's{" "}
        <code>--popup-*</code> for the panel, and Listbox's <code>--listbox-max-height</code> and Dropdown's{" "}
        <code>--item-*</code> for the options.
      </p>

      <h2>Platform support</h2>
      <ul>
        <li>
          As Popover: <code>popover</code> everywhere, and anchor positioning in Chrome 125, Safari 26 and Firefox 147.
          The panel opens against the field with <code>showPopover({"{ source }"})</code>, in Chrome 133, Safari 26.2 and
          Firefox 144.
        </li>
        <li>
          A native <code>&lt;datalist&gt;</code> suggests while you type, but it can't be styled, can't hold icons or
          descriptions, and lets any text through. Combobox is for choosing one option.
        </li>
      </ul>

      <h2>Left out</h2>
      <ul>
        <li>
          <strong>Typing a value that isn't an option,</strong> such as a new tag. Headless UI lets a page add the typed
          text as an option; a page can do the same here with <code>onQuery</code> and an option that says "Add …".
        </li>
        <li>
          <strong>Choosing several.</strong> Listbox's <code>multiple</code> covers a short list. Several from a long one,
          as chips in the field, is a component of its own.
        </li>
        <li>
          <strong>Completing the text inline</strong> (<code>aria-autocomplete="both"</code>), as an address bar does.
          It fights a person who types past the guess, and the lit first match already gives <kbd>Enter</kbd> the same
          result.
        </li>
        <li>
          <strong>Opening on focus.</strong> <kbd>Tab</kbd> through a form shouldn't throw lists open. A click or a key
          opens it.
        </li>
        <li>
          <strong>Highlighting the matched letters</strong> in each option. It adds an element per match, and the list is
          short enough to scan once filtered.
        </li>
        <li>
          <strong>The chosen option's icon in the field.</strong> A text box can't hold one. A leading icon for the field
          itself fits in the group, as in Input.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Catalyst's Combobox for the name, the parts, the chevrons and the filter on the label. Headless UI's Combobox for
        the value staying an option's, the text going back on leave, and the page filtering for itself. APG's combobox
        with list autocomplete for the keys and roles. Listbox for the options, and Popover for the panel.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with its code and the markup it renders. Try the keys in any of them.
        Switch the theme and mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="Glass over bright content" name="combobox/glass" />
      <Example title="In a form: a long list, and a placeholder with a disabled option" name="combobox/fields" />
      <Example title="Icons and descriptions" name="combobox/icons" />
      <Example title="Descriptions on the label's line" name="combobox/inline" />
      <Example title="Invalid and disabled" name="combobox/states" />
      <Example title="A search box" name="combobox/search" />
    </article>
  );
}
