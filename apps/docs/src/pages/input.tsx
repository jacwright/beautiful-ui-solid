import { Example, PropsTable } from "../spec.tsx";

export default function InputPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Input</h1>
      <p class="lede">
        A one-line text field: a name, an email, a password, a search, a number, a phone number or a date.
      </p>
      <Example title="Input" hero name="input/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;input&gt;</code>, styled. The browser does the typing, selection, undo, spell
          check, password managers, autofill and the phone's keyboard.
        </li>
        <li>
          It takes the types that hold text: <code>text</code> (the default), <code>email</code>,{" "}
          <code>password</code>, <code>search</code>, <code>tel</code>, <code>url</code> and <code>number</code>. The
          type picks the phone's keyboard, so an email field shows the <kbd>@</kbd>. A date is{" "}
          <a href="#date-picker">DatePicker</a>, not the browser's own picker. Checkbox, Radio, Range and a file
          picker are components of their own.
        </li>
        <li>
          In a <a href="/fieldset">Field</a> it takes its label, description and error from the field, so a form
          writes no ids. Outside a field it needs an <code>aria-label</code>, as the search box on the glass example
          has.
        </li>
        <li>
          <strong>The Field checks it</strong> and says what's wrong in plain words, under the field, in place of the
          browser's bubble. It waits until you've changed the field and left it, or sent the form, so nothing turns
          red while you're still typing. From then on it follows the value, and clears the moment it's fixed. See{" "}
          <a href="#checking">Checking values</a>.
        </li>
        <li>
          <strong>A phone number is formatted as it's typed</strong>, for its country: 5550100199 reads (555)
          010-0199 in the US. See <a href="#phone-numbers">Phone numbers</a>.
        </li>
        <li>
          A web address typed without its <code>https://</code>, such as springlaunch.com, gets it when you leave
          the field.
        </li>
        <li>
          It fills the width of what it sits in. A form sets the width with its column, so fields line up.
        </li>
        <li>
          An <strong>input group</strong> puts an icon inside the field, before the text, after it, or both: a
          magnifier on a search, a link on a URL, a check on a value that was verified. The icon is decorative, and a
          click on it lands on the field.
        </li>
        <li>
          A field is a <strong>well</strong>, where a Button is raised. In glass, light from the upper right leaves a
          soft shade inside its top edge and catches its lower lip, so a field and a button side by side read as
          something to type into and something to press. Classic keeps a faint inner shade.
        </li>
        <li>
          On a phone the text is 16px, so iOS doesn't zoom the page when the field is focused. Every field in the
          kit, and any bare <code>&lt;input&gt;</code>, <code>&lt;select&gt;</code> or{" "}
          <code>&lt;textarea&gt;</code>, keeps at least 16px where the pointer is a finger. Pinch-zoom still works.
        </li>
        <li>
          <strong>Password managers stay off fields that aren't yours.</strong> Their icons sit over the end of a
          field, on a number's arrows or a search's ×. A field with <code>autocomplete="off"</code>, such as a
          visits goal or a site's support phone, gets 1Password's, LastPass's and Bitwarden's ignore attributes too.
          A field about the person, such as their email or password, names its <code>autocomplete</code> so the
          managers fill it.
        </li>
      </ul>
      <p>
        Left out: text before or after the value inside the box, such as <code>https://</code> or{" "}
        <code>.com</code>, a button that shows a password, and sizes other than the one control height. Each is
        cheap to add when an app needs it.
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
              <td><code>Input</code></td>
              <td><code>&lt;input&gt;</code></td>
              <td>The field. 36px tall, or 44px for a finger, with 14px text (16px for a finger).</td>
            </tr>
            <tr>
              <td><code>InputGroup</code></td>
              <td><code>&lt;beautiful-input-group&gt;</code></td>
              <td>
                Holds an input and its icons: an <code>&lt;svg&gt;</code> before the input, after it, or both, or a
                Button at its end, as DatePicker's calendar. The input makes room for them. No semantic element fits,
                so it is a light DOM styling hook.
              </td>
            </tr>
            <tr>
              <td><code>DatePicker</code></td>
              <td>
                an input group, a hidden <code>&lt;input&gt;</code>, and a <code>popover</code>
              </td>
              <td>A date field with a calendar button, and the calendar. See below.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Input</h3>
      <PropsTable
        rows={[
          {
            name: "type",
            type: '"text" | "email" | "password" | "search" | "tel" | "url" | "number"',
            default: '"text"',
            description: "The kind of value. It sets the phone's keyboard and what the browser checks.",
          },
          {
            name: "value",
            type: "string",
            default: '""',
            description: (
              <>
                The text in the field. Read it back with <code>onInput</code>, as on any native input.
              </>
            ),
          },
          {
            name: "validate",
            type: "(value: string) => string | undefined",
            default: "none",
            description:
              "A rule of the page's own, such as a password's. Return what's wrong, in words that say how to fix it. It runs after the browser's own checks pass.",
          },
          {
            name: "country",
            type: "string",
            default: "the browser's region",
            description: (
              <>
                For <code>type="tel"</code>: the two-letter country, such as <code>"US"</code>, whose format a number
                takes when it doesn't start with +.
              </>
            ),
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
          {
            name: "autocomplete",
            type: "string",
            default: "unset",
            description: (
              <>
                What the browser may fill in. <code>"off"</code> also keeps password managers off the field.
              </>
            ),
          },
        ]}
      />
      <p>
        Every other native attribute passes through: <code>name</code>, <code>placeholder</code>,{" "}
        <code>required</code>, <code>inputmode</code>, <code>enterkeyhint</code>, <code>min</code>, <code>max</code>,{" "}
        <code>step</code>, <code>pattern</code> with a <code>title</code> that explains it, <code>minlength</code>,{" "}
        <code>maxlength</code>. Set <code>autocomplete</code> on every field a person fills in about themselves (
        <code>email</code>, <code>new-password</code>, <code>tel</code>), so the browser and password managers fill
        it.
      </p>
      <h3>InputGroup</h3>
      <p>
        It takes only its children: one <code>Input</code>, with an <code>&lt;svg aria-hidden="true"&gt;</code> before
        it, after it, or both. The icon is 16px, or 20px for a finger, in the muted text color.
      </p>
      <pre tabindex="0">
        <code>{`import { Field, Input, InputGroup, Label } from "beautiful-ui-solid";

<Field>
  <Label>Find a page</Label>
  <InputGroup>
    <SearchIcon aria-hidden="true" />
    <Input type="search" name="q" placeholder="Pricing, About, Contact…" />
  </InputGroup>
</Field>`}</code>
      </pre>

      <h2 id="checking">Checking values</h2>
      <p>
        The rules are the browser's own: <code>required</code>, the type, <code>minlength</code>,{" "}
        <code>pattern</code>, <code>min</code>, <code>max</code> and <code>step</code>, and <code>validate</code> for
        anything else. Without JS, on a static page, the browser checks them with its own bubbles. With the Solid
        components, the Field speaks instead:
      </p>
      <ul>
        <li>
          <strong>When:</strong> after the field has been changed and left, or when the form is sent. Tabbing through
          an empty field says nothing. Once a problem shows, it follows each keystroke and clears the moment the
          value is fixed.
        </li>
        <li>
          <strong>Sending the form</strong> shows every problem at once and moves focus to the first, where a screen
          reader reads its error. The form isn't sent until they're fixed.
        </li>
        <li>
          <strong>The words</strong> say how to fix it: "Fill this in.", "Enter an email address, such as
          name@example.com.", "Use at least 12 characters. This has 6.", "Enter 10 or 15." for a number off its
          step. A <code>pattern</code>'s <code>title</code> and a <code>validate</code> rule speak for themselves.
        </li>
        <li>
          <strong>An ErrorMessage the page writes</strong>, such as a server's "That subdomain is taken.", wins over
          the Field's own while it shows. Resetting the form clears the Field's.
        </li>
      </ul>
      <Example title="Checked as you go" name="input/checking" />

      <h2 id="phone-numbers">Phone numbers</h2>
      <p>
        <code>type="tel"</code> formats the number as it's typed, for the country in <code>country</code>, or the
        region of the browser's language. A number that starts with + is formatted for its own country. The caret
        stays after the digit it was after, and Backspace over a space or bracket takes the digit before it, so it
        never sticks. The form gets the number as shown.
      </p>
      <p>
        The formatter is libphonenumber-js (MIT) with its smallest metadata, about 80KB. It loads with the first
        phone field on a page, so pages without one don't carry it.
      </p>
      <Example title="A phone number" name="input/phone" />

      <h2 id="date-picker">Date picker</h2>
      <p>
        <code>DatePicker</code> is a date field with a calendar button at its end. It replaces the browser's own
        date picker, which each browser draws differently, and which clashes with both themes.
      </p>
      <ul>
        <li>
          You can type the date in your language's order, such as 11/20/2026 in the US or 20/11/2026 in the UK. The
          placeholder shows the order. Any separator works, and so do eight digits in a row. When you leave the
          field, it's written back in that order.
        </li>
        <li>
          The button opens a calendar beside the field, on a native <code>popover</code>, frosted on glass like
          every Popover. Pick a day and it closes. The week starts on the day your region's calendars start on.
        </li>
        <li>
          The form gets the ISO date, 2026-11-20, from a hidden input with the <code>name</code>, so a server never
          parses a language's format.
        </li>
        <li>
          <code>min</code> and <code>max</code> fade the days outside them, which can't be picked. A typed date
          outside them, or one that doesn't read, gets an error in the Field: "Choose 11/01/2026 or later."
        </li>
      </ul>
      <PropsTable
        rows={[
          { name: "name", type: "string", default: "none", description: "The name the form sends the ISO date under." },
          { name: "value", type: "string", default: '""', description: "The date, as YYYY-MM-DD." },
          {
            name: "onChange",
            type: "(value: string) => void",
            default: "none",
            description: 'Called with the new YYYY-MM-DD, or "" when the field is cleared.',
          },
          { name: "min, max", type: "string", default: "none", description: "The first and last days that can be picked, as YYYY-MM-DD." },
          { name: "required, disabled", type: "boolean", default: "false", description: "As on any field." },
          { name: "locale", type: "string", default: "the browser's", description: "The language the dates are written in." },
        ]}
      />
      <p>
        The calendar follows APG's Date Picker Dialog. It is a <code>dialog</code> named by its month, holding a{" "}
        <code>grid</code> of days, each named by its full date, such as "Friday, November 20, 2026".
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Behavior</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <kbd>Enter</kbd> or <kbd>Space</kbd> on the button, or <kbd>Alt</kbd> + <kbd>↓</kbd> in the field
              </td>
              <td>Opens the calendar, with focus on the picked day, or today.</td>
            </tr>
            <tr>
              <td>
                <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>
              </td>
              <td>The day before or after, or the same day a week before or after. The month turns as needed.</td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd>, <kbd>End</kbd>
              </td>
              <td>The first or last day of the week.</td>
            </tr>
            <tr>
              <td>
                <kbd>Page Up</kbd>, <kbd>Page Down</kbd>
              </td>
              <td>The same day a month before or after. With <kbd>Shift</kbd>, a year.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>, or a click
              </td>
              <td>Picks the day, closes the calendar and returns focus to the button.</td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>, a click outside, or <kbd>Tab</kbd> out
              </td>
              <td>Closes the calendar without picking.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <Example title="A date" name="input/date" />

      <h2>Keyboard and screen readers</h2>
      <p>
        APG has no pattern for a text field: it is the native <code>&lt;input&gt;</code>, and the browser does all of
        this.
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
                Move into the field and out of it. A read-only field is in the Tab order, and a disabled one isn't.
                The focus ring is the kit's 2px accent ring, and it glides in from the last control.
              </td>
            </tr>
            <tr>
              <td>A click or tap on the field, its label or its icon</td>
              <td>Focuses the field. On a phone, the keyboard for its type opens.</td>
            </tr>
            <tr>
              <td><kbd>Enter</kbd></td>
              <td>Sends the form the field is in, or shows its problems and focuses the first.</td>
            </tr>
            <tr>
              <td><kbd>Escape</kbd>, in a search</td>
              <td>
                Clears it in Chromium and Safari, as the × at its end does. The × is icon-sized, but a click anywhere
                on a square the field's height, out to its end, clears it.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>↑</kbd> <kbd>↓</kbd>, in a number
              </td>
              <td>Step the number by its <code>step</code>.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read the label as its name, then the description and the error, and say it is invalid, required or
                read-only. A search reads as a search box, and a number as a spin button.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Rest:</strong> the field fill with a 1px edge, 8px corners, and the inner shade. The placeholder is
          in the muted text color, which keeps 4.5:1 on the fill. Placeholders are examples, never the label.
        </li>
        <li>
          <strong>Hover:</strong> the edge darkens, only where the pointer can hover. A read-only or disabled field
          doesn't change.
        </li>
        <li>
          <strong>Focus:</strong> the kit's ring, 2px of accent 2px outside the edge, and an accent caret. A field
          shows the ring for a click too, as browsers do for anything you type into. The calendar button's ring sits
          inside the field.
        </li>
        <li>
          <strong>Invalid:</strong> a danger edge from <code>aria-invalid</code>, with the Field's error under it.
          Never from <code>:invalid</code>, which would mark a required field red before anyone has typed.
        </li>
        <li>
          <strong>Read-only:</strong> looks like rest at full contrast, so it can be read and copied, with no hover.
          A description says why it can't change.
        </li>
        <li>
          <strong>Disabled:</strong> half opacity, with its icons, label and description, as Button does.
        </li>
        <li>
          <strong>Filled by the browser:</strong> a faint accent tint in place of the browser's own blue or yellow,
          which clashed with both themes.
        </li>
        <li>
          <strong>Touch:</strong> 44px tall, 16px text and 20px icons, from the control tokens Button reads. The
          calendar's days grow to 44px too.
        </li>
        <li>
          <strong>Calendar days:</strong> the picked day filled with the accent, today in accent text, a day outside{" "}
          <code>min</code> and <code>max</code> faded, and a hover tint where the pointer can hover.
        </li>
        <li>
          <strong>Themes:</strong> classic is the raised fill (white in light mode, a light tint in dark) with the
          control edge. Glass is a frosted well, as dense as a secondary Button so its text keeps 4.5:1 over the
          bright stage. It blurs what's behind and draws no sheen or rim. Under reduced transparency glass falls
          back to classic.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <p>
        The <code>--field-*</code> tokens are new. Select and Textarea will read them too, so every field in a form
        matches. Until their specs, the docs' stand-in select and textarea read them already.
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
            <tr><td><code>--field-fill</code></td><td>the fill: white or a light tint in classic, frosted in glass</td></tr>
            <tr><td><code>--field-edge</code>, <code>--field-edge-hover</code></td><td>the 1px edge, and under the pointer</td></tr>
            <tr><td><code>--field-shadow</code></td><td>the shade inside the top edge, and in glass the lit lower lip</td></tr>
            <tr><td><code>--field-autofill</code></td><td>the tint of a value the browser filled in</td></tr>
            <tr><td><code>--control-height</code>, <code>--control-pad-x</code>, <code>--control-font-size</code>, <code>--control-icon</code></td><td>the size, shared with Button; a calendar day is a control-height square</td></tr>
            <tr><td><code>--control-blur</code>, <code>--control-saturate</code></td><td>glass's blur, shared with Button</td></tr>
            <tr><td><code>--popup-*</code></td><td>the calendar's panel, shared with Popover</td></tr>
            <tr><td><code>--color-accent-fill</code>, <code>--color-on-fill</code></td><td>the picked day</td></tr>
            <tr><td><code>--radius-md</code>, <code>--space-1</code> to <code>--space-3</code></td><td>the corners; the padding, the calendar's padding and gaps</td></tr>
            <tr><td><code>--color-text</code>, <code>--color-text-muted</code>, <code>--color-accent</code>, <code>--color-danger</code></td><td>the value; the placeholder, icons and weekdays; the caret, ring and today; the invalid edge</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        The native input works everywhere. The clear × on a search is Chromium's and Safari's: Firefox draws none,
        and Escape doesn't clear there. The number arrows are the browser's. The input group finds its icons with{" "}
        <code>:has()</code>, and the calendar opens on <code>popover</code> with anchor positioning, in every current
        browser. The CSS still styles a native <code>date</code> or <code>time</code> field, for a static page with
        no JS, where the browser's own picker stands in.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Input for the types it takes, a field that fills its column, and InputGroup with an icon at either
        end. Headless UI's Input for reading <code>disabled</code> and <code>invalid</code> from the Field around it,
        which <code>useField</code> does here. Open Props UI's TextField for placeholder and autofill styles. APG's
        Date Picker Dialog for the calendar's keys and roles. HTML's own <code>&lt;input&gt;</code> and constraint
        validation for the behavior.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid components live, then their code, then the markup they render. Switch the theme and
        mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="Text fields" name="input/fields" />
      <Example title="With an icon" name="input/icons" />
      <Example title="Invalid, read-only and disabled" name="input/states" />
      <Example title="Numbers and phones" name="input/types" />
      <Example title="On glass, and in a dialog" name="input/glass" />
    </article>
  );
}
