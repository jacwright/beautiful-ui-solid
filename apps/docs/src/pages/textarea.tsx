import { Example, PropsTable } from "../spec.tsx";

export default function TextareaPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Textarea</h1>
      <p class="lede">
        A text field for more than a line: a description, a note, a message, a reply.
      </p>
      <Example title="Textarea" hero name="textarea/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;textarea&gt;</code>, styled. The browser does the typing, selection, undo, spell
          check and the phone's keyboard.
        </li>
        <li>
          It looks like <a href="/input">Input</a>: the same well, edge, corners and states, from the same{" "}
          <code>--field-*</code> tokens, so a form's fields match. Its lines are spaced like a paragraph, since it
          holds one.
        </li>
        <li>
          <strong>It grows as you type.</strong> It starts at 3 lines, or its <code>rows</code>, and gains a line
          each time the text needs one, up to 12 lines. Past that it scrolls. Nothing to drag, and no wasted space
          under a short note.
        </li>
        <li>
          <strong>With a <code>maxlength</code>, it counts.</strong> Under the field's end edge it says how many
          characters are left: "74 characters left". A screen reader reads the count with the field. The browser
          stops typing at the limit, as it does for any native <code>maxlength</code>. A script isn't held to it, so
          text a page loads past the limit reads "8 characters too many".
        </li>
        <li>
          <kbd>Enter</kbd> starts a new line. <kbd>⌘</kbd> + <kbd>Enter</kbd>, or <kbd>Ctrl</kbd> + <kbd>Enter</kbd>{" "}
          off a Mac, sends the form it's in, as it does in a chat or a comment box.
        </li>
        <li>
          In a <a href="/fieldset">Field</a> it takes its label, description and error from the field, and the Field
          checks it as it does Input: after you've changed it and left it, or sent the form. Outside a field it needs
          an <code>aria-label</code>, as the note on the glass example has.
        </li>
        <li>It fills the width of what it sits in, as Input does.</li>
        <li>
          On a phone the text is 16px, so iOS doesn't zoom the page when the field is focused. Pinch-zoom still works.
        </li>
      </ul>
      <p>
        Left out: a drag handle (it grows itself), rich text, and a count without a limit. Each is cheap to add when an
        app needs it.
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
              <td><code>Textarea</code></td>
              <td><code>&lt;textarea&gt;</code></td>
              <td>The field. 3 lines tall to start, 12 at most, with 14px text (16px for a finger).</td>
            </tr>
            <tr>
              <td>The count</td>
              <td>
                <code>&lt;p data-count&gt;</code>, after the textarea
              </td>
              <td>
                Only with a <code>maxlength</code>. In the field's muted text, at its end edge. With an error, the two
                share a line, the error first.
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
            default: '""',
            description: (
              <>
                The text in the field. Read it back with <code>onInput</code>, as on any native textarea.
              </>
            ),
          },
          {
            name: "rows",
            type: "number",
            default: "3",
            description: "How many lines it shows when empty. It grows from there.",
          },
          {
            name: "maxlength",
            type: "number",
            default: "none",
            description: "The most characters it takes. Shows the count of what's left.",
          },
          {
            name: "validate",
            type: "(value: string) => string | undefined",
            default: "none",
            description:
              "A rule of the page's own, as on Input. Return what's wrong, in words that say how to fix it. It runs after the browser's own checks pass.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Can't be focused or changed, and isn't sent with the form. A Field's disabled sets it too.",
          },
          {
            name: "readonly",
            type: "boolean",
            default: "false",
            description: "Can be focused, selected and copied, and is sent with the form, but can't be changed.",
          },
        ]}
      />
      <p>
        Every other native attribute passes through: <code>name</code>, <code>placeholder</code>,{" "}
        <code>required</code>, <code>minlength</code>, <code>spellcheck</code>, <code>autocomplete</code>,{" "}
        <code>enterkeyhint</code>, <code>wrap</code>.
      </p>
      <pre tabindex="0">
        <code>{`import { Description, Field, Label, Textarea } from "beautiful-ui-solid";

<Field>
  <Label>Search description</Label>
  <Description>Search results show it under the page's title.</Description>
  <Textarea name="description" maxlength={160} />
</Field>`}</code>
      </pre>
      <Example title="Counted, and sent with ⌘ + Enter" name="textarea/reply" />

      <h2>Keyboard and screen readers</h2>
      <p>
        APG has no pattern for a text field: it is the native <code>&lt;textarea&gt;</code>, and the browser does all
        of this but the send.
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
                Move into the field and out of it. Tab never types a tab, so the keyboard can always leave. A
                read-only field is in the Tab order, and a disabled one isn't. The focus ring is the kit's 2px accent
                ring.
              </td>
            </tr>
            <tr>
              <td><kbd>Enter</kbd></td>
              <td>A new line.</td>
            </tr>
            <tr>
              <td>
                <kbd>⌘</kbd> + <kbd>Enter</kbd>, <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
              </td>
              <td>
                Sends the form, as its submit button would, or shows its problems and focuses the first. Nothing,
                outside a form.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>↑</kbd> <kbd>↓</kbd>, <kbd>Page Up</kbd>, <kbd>Page Down</kbd>
              </td>
              <td>Move the caret by a line or a page, scrolling the field once it's at its 12 lines.</td>
            </tr>
            <tr>
              <td>A click or tap on the field or its label</td>
              <td>Focuses the field. On a phone, the keyboard opens.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read it as a multi-line text field, named by its label, then the description, the error and the
                count, and say it is invalid, required or read-only.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Rest:</strong> Input's well: the field fill with a 1px edge, 8px corners and the inner shade. The
          placeholder is in the muted text color, which keeps 4.5:1 on the fill.
        </li>
        <li>
          <strong>Hover:</strong> the edge darkens, only where the pointer can hover. A read-only or disabled field
          doesn't change.
        </li>
        <li>
          <strong>Focus:</strong> the kit's ring, 2px of accent 2px outside the edge, and an accent caret.
        </li>
        <li>
          <strong>Growing:</strong> a line at a time, with no jump, from its rows up to 12 lines. At 12 a thin
          scrollbar in the edge's color appears inside the field.
        </li>
        <li>
          <strong>Invalid:</strong> a danger edge from <code>aria-invalid</code>, with the Field's error under it,
          and the count beside the error.
        </li>
        <li>
          <strong>Read-only:</strong> looks like rest at full contrast, so it can be read and copied, with no hover.
          It still grows to show all its text.
        </li>
        <li>
          <strong>Disabled:</strong> half opacity, with its label and description, as Input does.
        </li>
        <li>
          <strong>Touch:</strong> 16px text with its lines spaced to match, and the side padding Input takes for a
          finger.
        </li>
        <li>
          <strong>Themes:</strong> Input's: the raised fill in classic, a frosted well in glass, and classic again
          under reduced transparency.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <p>
        It reads Input's tokens and adds one: <code>--field-max-lines</code>, the 12 lines it grows to.
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
            <tr><td><code>--field-fill</code>, <code>--field-edge</code>, <code>--field-edge-hover</code>, <code>--field-shadow</code></td><td>the well, as on Input; the hover edge is the scrollbar's color too</td></tr>
            <tr><td><code>--field-max-lines</code></td><td>the most lines it grows to before it scrolls</td></tr>
            <tr><td><code>--control-pad-x</code>, <code>--control-font-size</code>, <code>--space-2</code></td><td>the side padding and text size, shared with Input; the padding above and below</td></tr>
            <tr><td><code>--leading</code></td><td>the line height, a paragraph's</td></tr>
            <tr><td><code>--radius-md</code>, <code>--space-1</code>, <code>--space-3</code></td><td>the corners; the count's gap above, and between the count and an error</td></tr>
            <tr><td><code>--color-text</code>, <code>--color-text-muted</code>, <code>--color-accent</code>, <code>--color-danger</code></td><td>the text; the placeholder and count; the caret and ring; the invalid edge</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        Chromium grows the field itself, with <code>field-sizing: content</code>, reading the lines it starts at from{" "}
        <code>rows</code>. Safari and Firefox don't do both yet, so the Solid component grows it there, with a few
        lines of JS. On a static page with no JS, those browsers show the native rows and a handle to drag it
        taller. <kbd>⌘</kbd> + <kbd>Enter</kbd> and the live count are the Solid component's. A static page shows
        the count as written.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Textarea for the well shared with Input and the field that fills its column; it has a resize
        option, which growing replaces here. Headless UI's Textarea for reading <code>disabled</code> and{" "}
        <code>invalid</code> from the Field. Open Props UI's textarea for <code>field-sizing</code> and the
        placeholder style. GOV.UK's character count for "characters left" in words, read with the field. HTML's own{" "}
        <code>&lt;textarea&gt;</code> and constraint validation for the behavior.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with the markup it renders for a static page. Type in them to see the
        field grow. Switch the theme and mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="A description and a note" name="textarea/fields" />
      <Example title="Invalid, read-only and disabled" name="textarea/states" />
      <Example title="On glass, and in a dialog" name="textarea/glass" />
    </article>
  );
}

