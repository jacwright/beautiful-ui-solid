import { For } from "solid-js";
import { Example } from "../spec.tsx";

/** Glide speeds to try on this page. The default is the --motion-focus token. */
const speeds = [
  { label: "80ms", value: "80ms" },
  { label: "100ms", value: "100ms" },
  { label: "120ms (default)", value: "" },
  { label: "160ms", value: "160ms" },
  { label: "1s, slow motion", value: "1000ms" },
];

function trySpeed(value: string) {
  if (value) document.documentElement.style.setProperty("--motion-focus", value);
  else document.documentElement.style.removeProperty("--motion-focus");
}

export default function FocusRingPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Focus ring</h1>
      <p class="lede">
        Shows which control the keyboard is on. When Tab moves focus, the ring glides to the next control, so the eye
        can follow it.
      </p>

      <h2>What it does</h2>
      <ul>
        <li>
          The ring itself doesn't change: a 2px accent outline, 2px outside the control's edge, following its corners.
          It shows for keyboard focus only, as now: clicking a button shows no ring, and clicking into a text field
          does.
        </li>
        <li>
          No ring has square corners. Links and disclosure titles are rounded by at least 3px
          (<code>--radius-xs</code>), so their ring is too. Anything that sets its own radius, such as Button, keeps
          it. The browser won't round a native checkbox or radio, so <a href="/checkbox">Checkbox</a> draws its own
          box, rounded 4px, and Radio draws its own circle, whose ring is a circle too. A radio's ring stays square in
          the example below until Radio is built.
        </li>
        <li>
          When the keyboard moves focus from one control with a ring to another, the ring glides from the old place to
          the new one in 120ms, speeding up and then settling. On the way it changes everything at once: position,
          width, height and each corner's radius, so a round-cornered button's ring turns into a field's or a link's.
        </li>
        <li>
          It glides for every key that moves focus: Tab and Shift+Tab, arrow keys inside a group such as radios or a
          toolbar.
        </li>
        <li>
          Once it lands, the control's own native outline takes over, in exactly the same spot. So at rest the ring
          is the browser's: it scrolls with its control, resizes with it, and is clipped by a scroll box like
          anything else inside it. The glide is the only thing the script draws.
        </li>
        <li>
          Controls need no code of their own. The ring reads what the browser would draw: the control's box, its
          corner radii, and its outline's width, offset and color. A control that draws its ring inside its edge,
          such as a dialog's scrolling body, gets a ring that glides inside the edge. A control with no ring, such as
          a dialog's panel, starts no glide.
        </li>
        <li>
          It glides only within one place: the page, or one dialog. When focus moves into a dialog or back out of it,
          or to a new page in an app, the place has changed, so the ring appears where focus lands instead. A glide
          across a change of context draws the eye to the wrong thing.
        </li>
        <li>
          It is not a component you render. The app calls <code>startFocusRing()</code> once, when it starts. With
          no JS, or before the script runs, the native outline is the ring and nothing moves.
        </li>
      </ul>

      <h2>When it glides, and when it doesn't</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Case</th>
              <th>What the ring does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tab or an arrow key to the next control</td>
              <td>Glides from the old ring to the new one.</td>
            </tr>
            <tr>
              <td>Tab again before it lands</td>
              <td>Turns from where it is now toward the newest control. It never jumps back to finish the first trip.</td>
            </tr>
            <tr>
              <td>Opening a dialog from the keyboard</td>
              <td>
                No glide: the ring appears on the control that takes focus in the dialog. Inside the dialog, Tab
                glides as on the page, above the dialog and its backdrop. When the dialog focuses its panel (no
                control has <code>autofocus</code>), the panel has no ring, so the next Tab shows the ring where it
                lands.
              </td>
            </tr>
            <tr>
              <td>Closing a dialog with Escape, Cancel or Save</td>
              <td>No glide: the ring appears on the button that opened it.</td>
            </tr>
            <tr>
              <td>A control inside a scroll box, such as a dialog's body</td>
              <td>
                The browser scrolls the control into view and the ring follows it while it scrolls. If part of the
                control is scrolled out of the box, its ring is cut at the box's edge, as the native outline is, so
                it never covers the dialog's title. Page scrolls and resizes while it glides are followed the same
                way.
              </td>
            </tr>
            <tr>
              <td>
                A box that hides its overflow for its look, such as rounded corners (<code>overflow: hidden</code>{" "}
                or <code>clip</code>)
              </td>
              <td>
                The ring flies over it, uncut. At rest the native outline would still be cut there, so a kit box that
                clips around controls uses <code>overflow: clip</code> with <code>overflow-clip-margin</code> of 4px:
                room for the ring, as the example cards on this page do.
              </td>
            </tr>
            <tr>
              <td>A link that wraps onto two lines</td>
              <td>
                Glides to the box around both lines. On landing, the browser's ring takes over, drawn around each line.
              </td>
            </tr>
            <tr>
              <td>Scrolling or resizing after it lands</td>
              <td>Nothing to do: the native outline is on the control.</td>
            </tr>
            <tr>
              <td>Clicking or tapping</td>
              <td>
                No glide. A click on a button shows no ring, and a click into a text field shows the field's ring in
                place. The next Tab from that field glides.
              </td>
            </tr>
            <tr>
              <td>Focus leaving the page</td>
              <td>
                Tabbing out to the browser's toolbar, or switching windows, hides the ring. Coming back shows it in
                place, with no glide from where it was before.
              </td>
            </tr>
            <tr>
              <td>Focus moving to nothing, such as a click on empty page</td>
              <td>The ring stops at once. It never lingers on a control that lost focus.</td>
            </tr>
            <tr>
              <td>Reduced motion</td>
              <td>
                No movement: <code>--motion-focus</code> is 0, and the ring jumps to the next control, as rings do
                today.
              </td>
            </tr>
            <tr>
              <td>Forced colors (Windows High Contrast)</td>
              <td>No glide. The system draws its own ring color, and the script stays out of its way.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>How it's built</h2>
      <p>
        The platform has no moving focus indicator, so this is the kit's one piece of behavior that is all script. It
        is small (<code>src/focus-ring.ts</code>) and adds one element to the page.
      </p>
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
              <td><code>startFocusRing()</code></td>
              <td>nothing</td>
              <td>
                Listens for focus moving and for the last input being a key or a pointer. Returns a function that
                stops it and removes the ring.
              </td>
            </tr>
            <tr>
              <td>The gliding ring</td>
              <td>
                <code>&lt;beautiful-focus-ring popover="manual" aria-hidden="true"&gt;</code>
              </td>
              <td>
                Shown only while it glides. It is a popover so it draws in the top layer, above a modal dialog. Each
                frame sets its place, size, radii and clip. Screen readers never see it.
              </td>
            </tr>
            <tr>
              <td>
                <code>data-focus-ring-gliding</code>
              </td>
              <td>on the control it glides to</td>
              <td>Hides that control's own outline until the ring lands, so there are never two rings.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <pre tabindex="0">
        <code>{`import { startFocusRing } from "beautiful-ui-solid";

startFocusRing();`}</code>
      </pre>
      <p>
        The speed is a time with a clock behind it, not a CSS transition, because the control it glides to can move
        while it glides: a dialog springing open, or a list scrolling the control into view. Each frame measures the
        control again and blends from where the ring started toward where the control is now.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        The ring is only a picture of focus. It never takes focus, never changes what Tab does, and is hidden from
        screen readers. WCAG 2.4.7 (focus visible) is met by the native outline, which is there whenever the ring
        isn't, and the ring keeps the outline's 2px and color, so 2.4.13 (focus appearance) is unchanged.
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
              <td><code>--motion-focus</code></td>
              <td>120ms, new. 0ms under reduced motion, which turns the glide off. A theme may change it.</td>
            </tr>
            <tr>
              <td><code>--ease-in-out</code></td>
              <td>
                <code>cubic-bezier(0.45, 0, 0.2, 1)</code>, new: starts gently, and settles a little longer than it
                starts, so the ring is easy to pick up at the end.
              </td>
            </tr>
            <tr>
              <td><code>--radius-xs</code></td>
              <td>0.1875rem (3px), new: the least rounding on links and disclosure titles, and later Checkbox.</td>
            </tr>
            <tr>
              <td><code>--color-accent</code></td>
              <td>the ring's color, as now. The ring copies each control's outline, so it always matches.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        It needs <code>popover</code> to draw over a modal dialog: every current browser has it. Without it, the
        script does nothing and the native ring shows as now. <code>:focus-visible</code>, the Web Animations clock
        and <code>clip-path: inset()</code> are everywhere.
      </p>

      <h2>References</h2>
      <p>
        None of the kit's references has a moving focus ring. The idea is the kit's own. Its rules come from the native
        ring it hands back to: <code>:focus-visible</code> decides when it shows, and the outline decides how it
        looks.
      </p>

      <h2>Examples</h2>
      <p>
        Click the first example, then press Tab and Shift+Tab. The whole docs site uses the ring, so the navigation
        and the theme and mode toggles show it too. Pick a speed to compare. Slow motion shows the corners change.
      </p>
      <label class="demo-speed">
        Glide speed
        <select onChange={(event) => trySpeed(event.currentTarget.value)}>
          <For each={speeds}>{(speed) => <option value={speed.value} selected={!speed.value}>{speed.label}</option>}</For>
        </select>
      </label>
      <Example title="Across controls" name="focus-ring/controls" />
      <Example title="Into a dialog and back" name="focus-ring/dialog" />
    </article>
  );
}
