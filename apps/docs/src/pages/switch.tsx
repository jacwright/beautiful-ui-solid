import { Example, PropsTable } from "../spec.tsx";

export default function SwitchPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Switch</h1>
      <p class="lede">Turns one setting on or off, and the change takes effect right away.</p>
      <Example title="Switch" hero name="switch/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;input type="checkbox" role="switch"&gt;</code>. The browser does the work: a click,
          a tap on its label, and <kbd>Space</kbd> flip it, a form sends it as a checkbox, and a form's reset puts it
          back. Screen readers call it a switch and say "on" or "off", where a checkbox says "checked".
        </li>
        <li>
          The input itself is the track, drawn with <code>appearance: none</code>, and its background draws the thumb.
          A switch is one element, with no wrapper and no extra node for the thumb.
        </li>
        <li>
          Off, the track is a well, like an Input, tinted so it shows on the page, on a dialog and on glass. On, it
          fills with the accent color, as a primary Button does, and the white thumb slides to the end with a little
          spring.
        </li>
        <li>
          <code>color="neutral"</code> fills it near-black instead (zinc in dark mode), for a switch that shouldn't pull
          the eye, such as a view preference.
        </li>
        <li>
          In a Field, the label and description come first and the switch sits at the end of the label's line, as in
          a list of settings. The whole label is part of the target, so on a phone the row is easy to hit even though
          the switch is small. Several switches in a row sit closer than text fields, as checkboxes do.
        </li>
        <li>
          The CSS styles every <code>input[role="switch"]</code>, so a static page gets the look with no JS. Every rule
          is in <code>:where()</code>, at specificity 0.
        </li>
      </ul>
      <p>
        <strong>Switch or Checkbox.</strong> A switch acts now, as a light switch does: turning on "Show in search
        results" turns it on. A checkbox is a choice that waits for a Save or Next button, or one of several in a
        list. A switch in a dialog with a Save button reads as "on once you save", which is fine for a settings dialog,
        and the dialog's description should say so.
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
              <td><code>Switch</code></td>
              <td><code>&lt;input type="checkbox" role="switch"&gt;</code></td>
              <td>
                The switch, and its track: a pill 32 by 20px, 44 by 26px on a touch screen.{" "}
                <code>data-color</code> carries the prop, and is left out for the default accent.
              </td>
            </tr>
            <tr>
              <td>Thumb</td>
              <td>the input's background</td>
              <td>
                A white disc 2px in from the track's edge, with a soft shade 1px under it. Two radial gradients, so it
                needs no element: Firefox draws no <code>::before</code> on an input.
              </td>
            </tr>
            <tr>
              <td><code>Field</code>, <code>Label</code>, <code>Description</code></td>
              <td>Fieldset's parts</td>
              <td>
                Name and explain the switch, from the Fieldset page. With a switch in it, a field puts the label and
                description in the first column and the switch in the second, centered on the label's line.
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
            description: (
              <>
                Whether it is on. The native <code>checked</code>: pass a signal to control it, or leave it to the
                switch.
              </>
            ),
          },
          {
            name: "onChange",
            type: "(checked: boolean, event: Event) => void",
            default: "none",
            description: (
              <>
                Runs when the person flips it, with the new state first, as Catalyst's and Headless UI's do. The event
                is the input's <code>change</code>.
              </>
            ),
          },
          {
            name: "color",
            type: '"accent" | "neutral"',
            default: '"accent"',
            description: "The track's color when it is on.",
          },
          {
            name: "name",
            type: "string",
            default: "none",
            description: (
              <>
                The form field's name. The form sends <code>value</code> while it is on, and nothing while it is off.
              </>
            ),
          },
          {
            name: "value",
            type: "string",
            default: '"on"',
            description: "What the form sends for it while it is on.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Faded, out of the Tab order, and left out of the form. In a Field, the label and description fade with it.",
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Description, Field, Label, Switch } from "beautiful-ui-solid";

const [indexed, setIndexed] = createSignal(true);

<Field>
  <Label>Show in search results</Label>
  <Description>Lets Google and Bing list the site's pages.</Description>
  <Switch name="indexed" checked={indexed()} onChange={setIndexed} />
</Field>`}</code>
      </pre>
      <p>
        In a Field, a Switch takes its id, its links to the description and error, and <code>disabled</code> from the
        Field, as Input does. Other attributes pass through to the <code>&lt;input&gt;</code>: <code>id</code>,{" "}
        <code>form</code>, <code>required</code>, <code>aria-*</code>, and event handlers. A switch with no visible
        label, such as one in a table row, takes an <code>aria-label</code> that names what it turns on: "Spring
        launch is live", not "Toggle".
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the APG Switch pattern. A native checkbox with <code>role="switch"</code> meets all of it, so Switch adds
        no key handling.
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
              <td>Moves focus to the switch and on. Each switch is its own stop. The focus ring shows.</td>
            </tr>
            <tr>
              <td>
                <kbd>Space</kbd>
              </td>
              <td>Flips it, and fires <code>change</code>.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>
                Left to the browser, as on a checkbox: in a form it may send the form, and it never flips the switch.
                APG makes Enter optional, and a key that toggles in one place and submits in another is a surprise.
              </td>
            </tr>
            <tr>
              <td>Click or tap</td>
              <td>On the switch or its label: flips it.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read the label, "switch", and "on" or "off", then the description. A flip is announced as the new
                state. The state is the input's own <code>checked</code>, so there is no <code>aria-checked</code> to
                keep in step.
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
              <td>A tinted well with the field edge, the thumb at the start.</td>
            </tr>
            <tr>
              <td>On</td>
              <td>
                Filled with the color, the thumb at the end. It slides over 240ms with a spring that overshoots by
                about half a pixel, and the color fades over 120ms.
              </td>
            </tr>
            <tr>
              <td>Hover</td>
              <td>A shade darker, on or off, with the edge a step stronger. Only where there is a hovering pointer.</td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>The kit's 2px accent ring, 2px out, round like the track. Keyboard focus only.</td>
            </tr>
            <tr>
              <td>Disabled</td>
              <td>At half strength, on or off, with no hover. In a Field, the label and description fade too.</td>
            </tr>
            <tr>
              <td>Invalid</td>
              <td>
                A danger edge, with the Field's error under the description. Rare: a switch that must be on is better as
                a checkbox, such as "I agree to the terms".
              </td>
            </tr>
            <tr>
              <td>Right to left</td>
              <td>The thumb starts on the right and moves left.</td>
            </tr>
            <tr>
              <td>Reduced motion</td>
              <td>The thumb jumps across. The color still fades.</td>
            </tr>
            <tr>
              <td>High contrast (Windows)</td>
              <td>An outlined track in the theme's text color, filled with its highlight color when on.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> Classic's track is opaque. On glass, the off track is a frosted well like an
        Input's, and the on track is the color at 85% over the blur, as a glass primary Button is, so it is lighter on
        a light page and darker on a dark one. The thumb is white in every theme and mode.
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
              <td><code>--switch-width</code>, <code>--switch-height</code></td>
              <td>2rem by 1.25rem, 2.75rem by 1.625rem where the pointer is a finger. New.</td>
            </tr>
            <tr>
              <td><code>--switch-inset</code></td>
              <td>0.125rem: the gap between the thumb and the track's edge. New.</td>
            </tr>
            <tr>
              <td><code>--radius-full</code></td>
              <td>9999px, as round as the box allows: the track's pill.</td>
            </tr>
            <tr>
              <td><code>--motion-slide</code></td>
              <td>240ms, 0 under reduced motion: the thumb's glide, as Navbar's and Tabs' bars glide.</td>
            </tr>
            <tr>
              <td><code>--field-fill</code>, <code>--field-edge</code>, <code>--field-edge-hover</code>, <code>--field-shadow</code></td>
              <td>the off track's well, from Input</td>
            </tr>
            <tr>
              <td><code>--color-accent-fill</code>, <code>--color-neutral-fill</code>, <code>--control-primary-opacity</code></td>
              <td>the on track's fill, from a primary Button</td>
            </tr>
            <tr>
              <td><code>--ease-spring</code>, <code>--motion-quick</code></td>
              <td>the thumb's slide, and the color's fade</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>role="switch"</code> on a checkbox is read as a switch by VoiceOver, NVDA, JAWS and TalkBack. A screen
        reader too old to know it reads a checkbox, which still works. <code>appearance: none</code>, layered radial
        gradients, <code>color-mix()</code> and <code>:dir()</code> are in every current browser.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Switch and SwitchField for the pill, the colors as a prop, and the switch at the end of its label's
        line. Headless UI's Switch for <code>onChange</code> with the new state, and a hidden form value, which a native
        checkbox gives us for free. Open Props UI's Switch for drawing it on a real{" "}
        <code>input[role="switch"]</code>. The APG Switch pattern for the keys and the screen-reader wording.
      </p>

      <h2>Other examples</h2>
      <p>Static markup, the same markup the Solid component renders. Switch the theme and mode at the top.</p>
      <Example title="A list of settings" name="switch/settings" />
      <Example title="Neutral" name="switch/neutral" />
      <Example title="Disabled" name="switch/disabled" />
      <Example title="In a dialog" name="switch/glass" />
    </article>
  );
}
