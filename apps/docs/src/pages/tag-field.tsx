import { Example, PropsTable } from "../spec.tsx";

export default function TagFieldPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Tag field</h1>
      <p class="lede">
        A field that holds several values, each a <a href="/chip">Chip</a>, with a text box after them that finds the
        next one as you type: labels on a site, people to invite, the countries a plan sells in.
      </p>
      <Example title="Tag field" hero name="tag-field/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It looks like <a href="/input">Input</a>: one well, a control's height while it's empty or holds one row of
          chips, growing a row at a time as they wrap. The chips sit inside it, in the order they were added, and the
          text box takes the rest of the last row.
        </li>
        <li>
          The text box is <a href="/combobox">Combobox</a>'s: typing filters the list under it, ignoring case and
          accents, with the first match lit. The list is <a href="/listbox">Listbox</a>'s, with several chosen: each
          chosen option shows its check.
        </li>
        <li>
          Picking an option adds its chip, empties the text box and keeps the list open, so the next can be picked
          straight away. Picking a chosen option again takes it out, as in a Listbox with <code>multiple</code>.
        </li>
        <li>
          Each chip ends in an ×. A click on it removes the chip. From the keyboard, <kbd>←</kbd> or{" "}
          <kbd>Backspace</kbd> in an empty text box goes back to the last chip, where <kbd>Backspace</kbd> removes it.
          The chips are out of the tab order, so <kbd>Tab</kbd> goes straight past the field however many it holds.
        </li>
        <li>
          With <code>create</code>, what was typed can be a tag of its own. The list ends with "Add “…”" for text that
          isn't an option's label yet; a comma adds it too, a pasted list adds each of its pieces, and leaving the field
          keeps what was typed rather than losing it. Without <code>create</code>, only the options can be chosen, and
          text left in the box goes when the field is left.
        </li>
        <li>
          A chip shows its option's label and its color, from the <code>color</code> on <code>TagFieldOption</code>:
          Chip's tints, neutral when left out. A tag that was typed is neutral.
        </li>
        <li>
          In a <a href="/fieldset">Field</a>, it takes its label, description and error from the Field, and the Field
          checks it: <code>required</code> with nothing chosen shows "Choose an option." The form sends each value under
          the <code>name</code>, from a hidden native <code>&lt;select multiple&gt;</code>, as Listbox does.
        </li>
        <li>
          For a few options that fit on screen, use <a href="/checkbox">Checkbox</a>es, or <a href="/listbox">Listbox</a>{" "}
          with <code>multiple</code>. For one value from a long list, use Combobox.
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
              <td><code>TagField</code></td>
              <td>
                <code>&lt;beautiful-tag-field&gt;</code> holding <code>&lt;beautiful-chips role="list"&gt;</code>, an{" "}
                <code>&lt;input role="combobox"&gt;</code> and a chevron <code>&lt;button tabindex="-1"&gt;</code>; then
                Combobox's <code>&lt;beautiful-popover popover="manual"&gt;</code> with an{" "}
                <code>aria-multiselectable</code> list
              </td>
              <td>
                The well holds the chips and the text box in one row that wraps: the chips' list takes no box of its
                own. The well wears the field's look and its focus ring, so the ring goes round the chips too.
              </td>
            </tr>
            <tr>
              <td>Each chip</td>
              <td>
                <code>&lt;beautiful-chip role="listitem"&gt;</code> with its × <code>&lt;button tabindex="-1"&gt;</code>
              </td>
              <td>
                Chip's look, a chosen value. Its × is named "Remove" and its label. The chips' list is named by the
                field's label, so a screen reader in browse mode reads "Labels, list, 2 items".
              </td>
            </tr>
            <tr>
              <td><code>TagFieldOption</code></td>
              <td>
                <code>&lt;beautiful-listbox-option role="option" aria-selected&gt;</code>
              </td>
              <td>One choice, as <code>ComboboxOption</code>, with the color its chip takes.</td>
            </tr>
            <tr>
              <td><code>TagFieldDescription</code></td>
              <td>
                <code>&lt;small&gt;</code>
              </td>
              <td>A line under the option's label, such as an email. The filter doesn't match it, and the chip doesn't show it.</td>
            </tr>
            <tr>
              <td>The news</td>
              <td>
                <code>&lt;beautiful-visually-hidden role="status"&gt;</code>
              </td>
              <td>"Added Launch" or "Removed Launch", read by screen readers, since the text box empties on each pick.</td>
            </tr>
            <tr>
              <td>The form's value</td>
              <td>
                <code>&lt;select hidden multiple&gt;</code>, only with <code>name</code> or <code>required</code>
              </td>
              <td>What the form sends and checks. The text box has no name, so typed text is never sent.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        The ids follow Combobox's rule: the text box's is the Tag field's id (a Field's, in one), the panel's{" "}
        <code>&lt;id&gt;-options</code>, the list's <code>&lt;id&gt;-listbox</code>, each option's{" "}
        <code>&lt;id&gt;-option-&lt;value&gt;</code>, and the chips' <code>&lt;id&gt;-chips</code>.
      </p>

      <h2>Props</h2>
      <h3>TagField</h3>
      <PropsTable
        rows={[
          {
            name: "value",
            type: "string[]",
            default: "none",
            description: "The chosen values, in the order they were added. Leave it out for a field that keeps its own, from defaultValue.",
          },
          {
            name: "defaultValue",
            type: "string[]",
            default: "[]",
            description: "The first values of a field that keeps its own, and what a form's reset puts back.",
          },
          {
            name: "onChange",
            type: "(value: string[]) => void",
            default: "none",
            description: "Called with the new values when a tag is added or removed, or the form is reset.",
          },
          {
            name: "create",
            type: "boolean, or (text) => string | undefined",
            default: "false",
            description: (
              <>
                Lets what was typed become a tag. <code>true</code> makes the trimmed text the value. A function makes
                the value from it, such as a slug, or returns <code>undefined</code> to turn it down.
              </>
            ),
          },
          {
            name: "filter",
            type: "(label, query) => boolean, or false",
            default: "the label holds the query",
            description: (
              <>
                As on Combobox. <code>false</code> shows every option, for a page that filters them itself with{" "}
                <code>onQuery</code>.
              </>
            ),
          },
          {
            name: "onQuery",
            type: "(query: string) => void",
            default: "none",
            description: 'Called as the typed text changes, and with "" when a pick empties it or the list closes.',
          },
          {
            name: "placeholder",
            type: "string",
            default: "none",
            description: "Shown, muted, while no tag is chosen. It goes with the first chip.",
          },
          { name: "name", type: "string", default: "none", description: "The name the form sends each value under." },
          { name: "required", type: "boolean", default: "false", description: "The form won't send until a tag is chosen, and the Field says so." },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Fades the field, chips and all, and keeps the list shut. In a Field, the Field's disabled sets it.",
          },
          { name: "anchor", type: "PopoverPanel's anchor", default: '"bottom start"', description: "Where the list opens against the field." },
          { name: "id", type: "string", default: "made up", description: "The text box's id. In a Field, the Field sets it." },
          { name: "aria-label", type: "string", default: "none", description: "Names the field, its chips and its list where no Field's label does." },
          { name: "children", type: "JSX.Element", description: "The options." },
        ]}
      />
      <h3>TagFieldOption</h3>
      <PropsTable
        rows={[
          { name: "value", type: "string", description: "What choosing it adds to the values, and what the form sends." },
          { name: "color", type: "ChipColor", default: '"neutral"', description: "Its chip's color once chosen: one of Chip's tints." },
          { name: "disabled", type: "boolean", default: "false", description: "Fades the option. The keys and the pointer pass over it." },
          { name: "children", type: "JSX.Element", description: "The label, and any icon or description." },
        ]}
      />

      <h2>Keyboard and screen readers</h2>
      <p>
        Combobox's keys, from the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/">APG combobox pattern</a>,
        with a multi-select list, and keys for the chips after the common pattern of mail clients' recipient fields.
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
              <td>Typing, <kbd>↓</kbd> <kbd>↑</kbd>, <kbd>Page Down</kbd> <kbd>Page Up</kbd></td>
              <td>As Combobox: filters and opens the list, then moves through it.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd> or a click on an option
              </td>
              <td>
                Adds its chip, or takes it out if it was chosen. The text empties and the list stays open, whole again,
                with the keys on the option picked. With the list shut, <kbd>Enter</kbd> sends the form, unless there's typed
                text and <code>create</code> is on: then it adds the text first.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>,</kbd> with <code>create</code>
              </td>
              <td>Adds what was typed: the option whose label it is, or a new tag.</td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>Closes the list and empties the text. The chips stay. With the list shut, it's left to a Dialog around it.</td>
            </tr>
            <tr>
              <td>
                <kbd>←</kbd> at the start of the text, or <kbd>Backspace</kbd> in an empty text box
              </td>
              <td>Moves focus to the last chip's ×. The list closes.</td>
            </tr>
            <tr>
              <td>
                <kbd>←</kbd> <kbd>→</kbd>, <kbd>Home</kbd> <kbd>End</kbd> on a chip
              </td>
              <td>Move between the chips. <kbd>→</kbd> on the last, or <kbd>End</kbd>, goes back to the text box.</td>
            </tr>
            <tr>
              <td>
                <kbd>Backspace</kbd>, <kbd>Delete</kbd> on a chip
              </td>
              <td>
                Removes it. Focus goes to the chip before (<kbd>Backspace</kbd>) or after (<kbd>Delete</kbd>), or back to
                the text box at the end. A held key removes one chip, not every one.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>, or a click away
              </td>
              <td>
                Closes the list and moves on, past the chips. With <code>create</code>, text left in the box becomes a tag;
                without it, the text goes. It never picks the lit option for you.
              </td>
            </tr>
            <tr>
              <td>A click on the field, away from a chip's ×</td>
              <td>Puts the caret in the text box, and opens the whole list.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                The text box is a combo box named by the label. The list is multi-select, so each option is read as
                selected or not. "Added …" and "Removed …" are read as each change happens. Each × is a button named
                "Remove" and its chip's label.
              </td>
            </tr>
            <tr>
              <td>No JS</td>
              <td>Nothing to do: a static page with no JS uses Checkboxes.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Field:</strong> Input's well, its hover edge and placeholder. The kit's focus ring goes round the
          whole well while the text box has focus, and round a single × while a chip has it.
        </li>
        <li>
          <strong>Chips:</strong> Chip's look, a space-1 band inside the well, so one row keeps the field at a control's
          height, and the text after them lines up with an Input's.
        </li>
        <li>
          <strong>Wrapping:</strong> the text box keeps at least 6rem (<code>--tag-field-text-min</code>), and drops to
          a line of its own when the chips leave less. The chevrons stay against the first row.
        </li>
        <li>
          <strong>Invalid:</strong> the danger edge round the well, and the Field's error under it.
        </li>
        <li>
          <strong>Disabled:</strong> the well fades to half, chips and all, and nothing opens or removes.
        </li>
        <li>
          <strong>List:</strong> as Combobox: lit, chosen with its check, disabled, "No matches", and the "Add “…”" row in
          muted ink after the matches.
        </li>
        <li>
          <strong>Themes:</strong> Input's frosted well on glass and its plain one on classic; the chips are Chip's,
          frosted on glass; the list is Popover's panel.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <p>
        One of its own: <code>--tag-field-text-min</code>, the narrowest the text box gets beside the chips. It reads
        Input's <code>--field-*</code> for the well, Chip's <code>--chip-height</code> and tints, and Combobox's list
        tokens.
      </p>

      <h2>Left out</h2>
      <ul>
        <li>
          <strong>A limit on how many.</strong> A page that wants one turns the pick down in <code>onChange</code> and
          says why in the Field's error.
        </li>
        <li>
          <strong>Editing a chip in place,</strong> as some mail clients do on a double click. Remove it and type it
          again.
        </li>
        <li>
          <strong>Dragging chips into a new order.</strong> They keep the order they were added in.
        </li>
        <li>
          <strong>Hiding the chosen options from the list.</strong> They stay, with their check, so the list shows what
          is chosen and a second pick takes one out, as Listbox does.
        </li>
      </ul>

      <h2>Other examples</h2>
      <Example title="Labels, picked or typed" name="tag-field/labels" />
      <Example title="Invite from the team, in a form" name="tag-field/invite" />
      <Example title="Invalid and disabled" name="tag-field/states" />
      <Example title="Many tags, on glass" name="tag-field/glass" />
    </article>
  );
}
