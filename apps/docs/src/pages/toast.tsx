import { type ToastPlacement, Toaster, toast } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { Example, PropsTable } from "../spec.tsx";

const placements: ToastPlacement[] = ["bottom end", "bottom", "bottom start", "top end", "top", "top start"];

export default function ToastPage() {
  const [placement, setPlacement] = createSignal<ToastPlacement>("bottom end");

  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Toast</h1>
      <p class="lede">
        A short message at the edge of the screen that says something happened, and goes away by itself.
      </p>
      <Example title="Toast" hero name="toast/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It tells you the outcome of something you did, such as <em>Link copied</em> or <em>Spring launch is
          live</em>, without stopping you. It never takes focus, and the page under it keeps working.
        </li>
        <li>
          Toasts stack in one corner of the screen, bottom right unless <code>placement</code> says otherwise. The
          newest is nearest the edge, and at most three show at once: a fourth sends the oldest away, keeping a danger toast while another can go. On a phone the
          stack spans the screen, 1rem in from each side.
        </li>
        <li>
          Each one goes away by itself: after 5 seconds, or 8 with an action, so there's time to reach Undo. A danger
          toast stays until it's dismissed, so an error can't vanish before it's read. Time stops while the pointer
          is over the stack, while focus is in it, and while the tab is hidden.
        </li>
        <li>
          A toast holds a message, an optional second line, an optional action such as Undo or View, and a close
          button. A tone adds an icon: a check for success, a mark for danger.
        </li>
        <li>
          The stack is a native <code>popover="manual"</code>, kept open from the start. That puts it in the top
          layer, above everything, and makes its live region exist before the first message, which screen readers
          need to hear it. While a modal <a href="/dialog">Dialog</a> is open, the stack moves into it, because the
          page behind a modal is inert: a toast left there could be neither read nor clicked.
        </li>
        <li>
          A toast can change after it shows, as when <em>Publishing…</em> becomes <em>Spring launch is live</em>.
          The new text is read out.
        </li>
        <li>
          It isn't for anything you must act on. A choice that needs an answer is <a href="/alert">Alert</a>. A
          field's mistake is its error message, beside it. A notice that stays on the page is <strong>Callout</strong>.
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
              <td><code>Toaster</code></td>
              <td>
                <code>&lt;beautiful-toaster popover="manual" role="region" aria-live="polite"&gt;</code>
              </td>
              <td>The stack, once near the root of the app. Its label is Notifications.</td>
            </tr>
            <tr>
              <td><code>toast()</code></td>
              <td>
                a <code>&lt;beautiful-toast tabindex="-1"&gt;</code> in the stack
              </td>
              <td>Shows a toast. Call it from anywhere, such as an event handler. Returns a handle to change or dismiss it.</td>
            </tr>
            <tr>
              <td>The message, and a second line</td>
              <td>
                <code>&lt;p&gt;</code>, <code>&lt;p&gt;</code>
              </td>
              <td>The first is the message, a little bolder. The second is in the muted color.</td>
            </tr>
            <tr>
              <td>An action</td>
              <td>a secondary <a href="/button">Button</a></td>
              <td>Runs its <code>onClick</code>, then dismisses the toast.</td>
            </tr>
            <tr>
              <td>The close button</td>
              <td>
                a tertiary Button, <code>data-dismiss</code>, labelled Dismiss
              </td>
              <td>Dismisses the toast. Its × is drawn with a mask, so it adds no node.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Toaster</h3>
      <PropsTable
        rows={[
          {
            name: "placement",
            type: '"bottom end" | "bottom" | "bottom start" | "top end" | "top" | "top start"',
            default: '"bottom end"',
            description: (
              <>
                The edge, then the end of it. End is the right in a left-to-right language. Written as{" "}
                <code>data-placement</code>, and left out at the default.
              </>
            ),
          },
          {
            name: "label",
            type: "string",
            default: '"Notifications"',
            description: "The stack's name, read when focus moves into it. Translate it with the app.",
          },
        ]}
      />
      <h3>toast(options)</h3>
      <p>
        Takes the message as a string, or these options. Returns a handle with <code>dismiss()</code>, and{" "}
        <code>update(options)</code>, which changes any of them and starts the toast's time again.
      </p>
      <PropsTable
        rows={[
          { name: "message", type: "string", description: "A few words, such as Link copied." },
          { name: "description", type: "string", default: "none", description: "A second line, in the muted color." },
          {
            name: "tone",
            type: '"success" | "danger"',
            default: "none",
            description: "Adds an icon in the tone's color. Danger also keeps the toast until it's dismissed.",
          },
          {
            name: "action",
            type: "{ label: string; onClick?: () => void }",
            default: "none",
            description: "One button, such as Undo. Clicking it runs onClick, then dismisses the toast.",
          },
          {
            name: "duration",
            type: "number",
            default: "5000, 8000, Infinity",
            description: (
              <>
                How long it shows, in ms: 5000, 8000 with an action, and Infinity with the danger tone, which keeps it
                until it's dismissed.
              </>
            ),
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Toaster, toast } from "beautiful-ui-solid";

// Once, near the root of the app.
<Toaster />

toast("Link copied");

toast({
  message: "Spring launch was deleted",
  action: { label: "Undo", onClick: restore },
});

const publishing = toast({ message: "Publishing…", duration: Infinity });
publishing.update({ message: "Spring launch is live", tone: "success" });`}</code>
      </pre>
      <p>
        <code>toast()</code> works on a page with no Toaster too. It makes a stack with the defaults at the end of the
        body.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        APG has no toast pattern. This follows its guidance on live regions and on not moving focus, and WCAG's
        rules for content that times out (2.2.1) and for status messages (4.1.3).
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
              <td>A toast shows</td>
              <td>Focus stays where it is. Screen readers read the toast once, after what they're reading.</td>
            </tr>
            <tr>
              <td>
                <kbd>F8</kbd>
              </td>
              <td>Moves focus to the newest toast, from anywhere on the page. Its time stops while focus is in the stack.</td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>, <kbd>Shift</kbd> <kbd>Tab</kbd>
              </td>
              <td>
                Move through the toast's action and close button. <kbd>Shift</kbd> <kbd>Tab</kbd> goes on to the older
                toasts.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd> in a toast
              </td>
              <td>
                Dismisses it. Focus goes to the next toast, or back to where it was before <kbd>F8</kbd>. Inside a
                dialog, it dismisses only the toast.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd> on the action
              </td>
              <td>Runs it and dismisses the toast.</td>
            </tr>
            <tr>
              <td>Pointer over the stack</td>
              <td>Stops the time on every toast, until the pointer leaves.</td>
            </tr>
            <tr>
              <td>Swipe sideways</td>
              <td>
                With a finger or a pen: the toast follows, and a long or quick swipe sends it off that side. A short one
                springs it back.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                The stack is a polite live region named Notifications, so a new toast, or a toast's new text, is read
                once and doesn't interrupt. A toast that leaves isn't read. The close button reads as Dismiss.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Entering:</strong> rises from the edge with a little spring and fades in, over 320ms. The toasts
          already there glide up to make room.
        </li>
        <li>
          <strong>Leaving:</strong> slides out toward the side it sits by and fades, in 180ms, easing in. A centered
          stack sends it back the way it came. The rest glide into its place at once.
        </li>
        <li>
          <strong>Swiping:</strong> follows the finger with no lag, and leaves from where it was let go.
        </li>
        <li>
          <strong>Paused:</strong> looks the same. Only its time stops.
        </li>
        <li>
          <strong>Focused:</strong> the kit's focus ring around the toast, and around a button in it.
        </li>
        <li>
          <strong>Reduced motion:</strong> a plain fade in and out, with no movement and no glide. A swipe still
          follows the finger.
        </li>
        <li>
          <strong>Size:</strong> 24rem wide, or the screen less 1rem a side on a phone. 0.75rem padding, 1rem at the
          start, 0.75rem corners, 14px text, and 0.5rem between toasts. The buttons are a little smaller than a
          control, 28px, so a one-line toast is 52px tall.
        </li>
        <li>
          <strong>Themes:</strong> a toast is a popup, the same pane as <a href="/popover">Popover</a>: the raised
          color with a hairline edge and a soft shadow in classic, and one pane of frosted glass in glass, 72% white
          or near-black, blurred 16px, with Dialog's sheen, rim and hotspot. Glass falls back to classic where the
          browser lacks <code>backdrop-filter</code> and where the user asks for reduced transparency.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
      <p>
        Toast reads the <code>--popup-*</code> tokens that Popover added, and adds one color.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Classic</th>
              <th>Glass</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>--popup-fill</code>, <code>--popup-blur</code>, <code>--shadow-popup</code></td><td>the raised color, no blur, a soft shadow</td><td>72% white or near-black, 16px</td></tr>
            <tr><td><code>--surface-edge</code>, <code>--surface-sheen</code>, <code>--surface-rim</code>, <code>--surface-hotspot</code></td><td>a gray edge, no light</td><td>Dialog's edge and light</td></tr>
            <tr><td><code>--color-success</code></td><td colspan="2">new: green 600 in light mode, 400 in dark, for the check. Only icons use it, which need 3:1</td></tr>
            <tr><td><code>--color-danger</code></td><td colspan="2">the danger mark</td></tr>
            <tr><td><code>--radius-lg</code></td><td colspan="2">0.75rem corners</td></tr>
            <tr><td><code>--motion-enter</code>, <code>--motion-exit</code>, <code>--ease-spring</code></td><td colspan="2">320ms in with the spring, 180ms out</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <ul>
        <li>
          <code>popover</code> works in every current browser. The enter animation uses <code>@starting-style</code>,
          in Chrome 117, Safari 17.5 and Firefox 129. Without it a toast appears with no movement.
        </li>
        <li>
          The glide uses the Web Animations API, and the spring is a <code>linear()</code> easing. Where a browser
          can't read it, the glide eases out instead.
        </li>
        <li>
          Moving the stack into a modal dialog, and the swipe, were tested only in Chromium. A modal that opens while
          toasts show takes them in on the dialog's <code>toggle</code> event, in Chrome 132 and Firefox 133. Where
          it's missing, the stack moves with the next toast.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Open Props UI's Toast for the name and a live region holding a list of toasts. The rest is our own: the
        stack in the top layer that follows a modal, the timings, pausing, <kbd>F8</kbd> (the key Radix and
        Microsoft use to reach notifications), and the swipe. Catalyst and Headless UI have no toast.
      </p>

      <h2>Try it</h2>
      <p>
        These send real toasts to this page's stack. Try a few at once, hover the stack, press <kbd>F8</kbd>, or open
        the dialog and copy the link from inside it.
      </p>
      <Example title="Send a toast" name="toast/send">
        <label class="toast-placement">
          Placement
          <select onChange={(event) => setPlacement(event.currentTarget.value as ToastPlacement)}>
            {placements.map((placement) => (
              <option>{placement}</option>
            ))}
          </select>
        </label>
      </Example>

      <h2>Other examples</h2>
      <p>
        Toasts written by <code>fillToast</code>, the same markup <code>toast()</code> renders, shown in the page
        rather than in a corner. Each
        stack is a region, so each example names its own, as two Toasters on one page would need. Switch the theme and
        mode at the top.
      </p>
      <Example title="Glass over bright content" name="toast/glass" />
      <Example title="Tones" name="toast/tones" />
      <Example title="With an action" name="toast/undo" />

      {/* The page's stack, for Try it. */}
      <Toaster placement={placement()} />
    </article>
  );
}
