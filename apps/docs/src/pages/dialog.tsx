import { Example, PropsTable } from "../spec.tsx";

export default function DialogPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Dialog</h1>
      <p class="lede">
        A modal window over the page. The user finishes a task in it, then closes it. The page behind stays out of
        reach until then.
      </p>
      <Example title="Dialog" hero name="dialog/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;dialog&gt;</code> opened with <code>showModal()</code>. The browser puts it in
          the top layer, makes the rest of the page inert, closes it on Escape, and returns focus to the opener.
        </li>
        <li>
          The <code>&lt;dialog&gt;</code> is the panel and <code>::backdrop</code> is the backdrop. The overlay adds
          no wrapper elements and no portal.
        </li>
        <li>A click on the backdrop closes it. Alert, which is built on Dialog, turns that off.</li>
        <li>The page behind doesn't scroll while the dialog is open.</li>
        <li>
          When the content is taller than the screen, the body scrolls. The title and the actions stay in view.
        </li>
        <li>
          The markup works with no JS: a button with <code>commandfor</code> opens it. The Solid component adds the
          ids that name and describe it, and the <code>open</code> and <code>onClose</code> wiring.
        </li>
      </ul>

      <h2>Anatomy</h2>
      <p>
        Each part is one element. Leave out the parts you don't need. Put anything long in the body: it is the only
        part that scrolls, and the panel doesn't clip what overflows it.
      </p>
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
              <td><code>Dialog</code></td>
              <td><code>&lt;dialog&gt;</code></td>
              <td>The panel. Its <code>::backdrop</code> dims the page.</td>
            </tr>
            <tr>
              <td><code>DialogTitle</code></td>
              <td><code>&lt;h2&gt;</code></td>
              <td>Names the dialog through <code>aria-labelledby</code>.</td>
            </tr>
            <tr>
              <td><code>DialogDescription</code></td>
              <td><code>&lt;p&gt;</code></td>
              <td>Describes it through <code>aria-describedby</code>.</td>
            </tr>
            <tr>
              <td><code>DialogBody</code></td>
              <td><code>&lt;beautiful-dialog-body&gt;</code></td>
              <td>The content. It is the part that scrolls, which is why it is its own element.</td>
            </tr>
            <tr>
              <td><code>DialogActions</code></td>
              <td><code>&lt;footer&gt;</code></td>
              <td>The buttons, right-aligned. On narrow screens they stack, with the primary action on top.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        The parts can sit inside one <code>&lt;form method="dialog"&gt;</code>. The form takes no box, so the layout
        is the same. Submitting it closes the dialog, and the submit button's <code>value</code> becomes the
        dialog's <code>returnValue</code>.
      </p>

      <h2>Props</h2>
      <h3>Dialog</h3>
      <PropsTable
        rows={[
          {
            name: "open",
            type: "boolean",
            description: (
              <>
                Shows the dialog with <code>showModal()</code> when true. Closes it when false. Left out, a
                button with <code>commandfor</code> and <code>command="show-modal"</code> opens it, as in the
                examples below, and the component still focuses it and returns focus as it does when{" "}
                <code>open</code> opens it.
              </>
            ),
          },
          {
            name: "onClose",
            type: "(returnValue: string) => void",
            description: (
              <>
                Called after the dialog closes, whatever closed it: Escape, the backdrop, a close button, or a{" "}
                <code>method="dialog"</code> form. It gets the value of the button that closed it, or{" "}
                <code>""</code> for Escape and the backdrop. The component sets <code>returnValue</code> to{" "}
                <code>""</code> before each open, so an earlier answer never carries over. The parent sets{" "}
                <code>open</code> to false here. <code>open</code> is the source of truth: if it is still true
                after <code>onClose</code>, the component opens the dialog again.
              </>
            ),
          },
          {
            name: "id",
            type: "string",
            description: (
              <>
                The <code>&lt;dialog&gt;</code>'s id. The title's id is it with <code>-title</code> after it, and
                the description's with <code>-description</code>. Left out, it makes a unique one.
              </>
            ),
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg" | "xl"',
            default: '"md"',
            description: "The panel's maximum width: 24, 32, 42 or 56rem. It never grows past the screen.",
          },
        ]}
      />
      <p>
        Other attributes pass through to the <code>&lt;dialog&gt;</code>. <code>closedby</code> defaults to{" "}
        <code>"any"</code>, and Alert sets <code>"closerequest"</code>. To focus a control when the dialog opens,
        give it <code>autofocus</code>.
      </p>
      <h3>DialogTitle, DialogDescription, DialogBody, DialogActions</h3>
      <p>
        Each takes <code>children</code> and passes other attributes through. Title and description get their ids
        from the Dialog, so they take no id prop.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/">APG modal dialog pattern</a>. The
        browser does these for a <code>&lt;dialog&gt;</code> opened with <code>showModal()</code>, except where a
        row says the component does it.
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
              <td>Opening</td>
              <td>
                Focus moves to the element with <code>autofocus</code>. With none, it moves to the dialog itself,
                and screen readers read its title and description. The browser would pick the first focusable
                element. On a phone, that opens the keyboard when the element is a field. So when no child has{" "}
                <code>autofocus</code>, the component gives the <code>&lt;dialog&gt;</code>{" "}
                <code>tabindex="-1"</code> and calls <code>focus()</code> on it after <code>showModal()</code>, as
                Headless UI does. (<code>autofocus</code> on the <code>&lt;dialog&gt;</code> itself doesn't work:
                Chromium still focuses the first focusable child.)
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd>
              </td>
              <td>
                Move through the dialog's controls. The page behind is inert, so focus never reaches it. Past the
                last control, focus goes to the browser's own controls, then back into the dialog. APG wraps
                straight to the first control. We keep the browser's behavior.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>Closes the dialog.</td>
            </tr>
            <tr>
              <td>Closing</td>
              <td>
                Focus returns to the element that had it before the dialog opened, usually the opener. If that
                element has left the page, as a Dropdown item does, the browser would drop focus to the page. The
                component instead focuses the newest element it saw focused that is still in the page, such as the
                Dropdown's button. This follows Headless UI.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce a dialog, named by the title and described by the description. <code>aria-modal</code> is
                implied by <code>showModal()</code>. The page behind is hidden from the accessibility tree.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Closed:</strong> not rendered (<code>display: none</code>).
        </li>
        <li>
          <strong>Opening:</strong> over 320ms the panel fades in, rises 0.5rem and grows from 96% on a spring
          that overshoots by about 4%. The backdrop fades in. All of it is CSS: <code>@starting-style</code>, with no JS.
        </li>
        <li>
          <strong>Closing:</strong> the opening reversed, in 180ms, easing in, with no spring.
        </li>
        <li>
          <strong>Reduced motion:</strong> a plain fade, with no movement.
        </li>
        <li>
          <strong>Open:</strong> centered, at most the screen's height less 2rem on each side. The page behind
          keeps its scroll position and doesn't scroll.
        </li>
        <li>
          <strong>Long content:</strong> the body scrolls.
        </li>
        <li>
          <strong>Narrow screen</strong> (under 40rem): the actions stack, primary on top.
        </li>
        <li>
          <strong>Themes:</strong> classic has an opaque panel with no light effects. Glass has a translucent
          panel that blurs and saturates what is behind it. Light falls on it from the upper right, at about 40°:
          a hairline rim, brightest along the top and fading down the sides, with a brighter hotspot toward the
          right of the top edge, and a faint sheen on the fill from the same corner. Nothing moves. Both
          modes draw the rim and hotspot at the same strength. A white glint is lost on a light page, so in light
          mode a dark halo with no offset surrounds the panel, and the glint stands out from it. The glint and the
          glow stay in the corner: their size is capped in rem, so a wide panel doesn't stretch them across its width. In light mode the
          inner panel is also whitest in the top-right corner, and the page behind is dimmed least there. Its
          shadow falls down and to the left, away from the light, in both modes. The panel is a bezel: a 0.75rem band of very clear glass (5px blur, 10% fill)
          around a nearly opaque inner panel (85% white in light mode, 85% near-black in dark) that holds the
          content. The inner panel's corners are half the bezel smaller than the outer ones, and a 1px edge with
          a highlight sets it apart from the band. The description is darker in light mode and lighter in
          dark mode than on classic. It keeps at least 4.5:1 over plain white, plain black and the bright
          example. Glass falls back
          to classic's panel where the browser lacks <code>backdrop-filter</code> and where the user asks for
          reduced transparency.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
      <p>
        The panel reads these, and a theme sets them. Classic sets the light effects to none. Kit-wide tokens are
        in <code>src/styles/tokens.css</code>.
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
            <tr><td><code>--surface-fill</code></td><td>opaque</td><td>10% white in light mode, 10% near-black in dark mode: the bezel</td></tr>
            <tr><td><code>--surface-blur</code>, <code>--surface-saturate</code></td><td>0, 100%</td><td>5px; 180%</td></tr>
            <tr><td><code>--surface-bezel</code></td><td>0</td><td>0.75rem</td></tr>
            <tr><td><code>--surface-inset-fill</code>, <code>--surface-inset-edge</code></td><td>none</td><td>the inner panel: 85% white or near-black, with a 1px edge and a top highlight</td></tr>
            <tr><td><code>--surface-inset-sheen</code></td><td>none</td><td>light mode: the inner panel whitest in its top-right corner</td></tr>
            <tr><td><code>--backdrop-fill</code></td><td>30% near-black, 60% black</td><td>10% near-black in the top-right corner to 32% in light mode, 30% black in dark</td></tr>
            <tr><td><code>--surface-sheen</code></td><td>none</td><td>a faint radial glow from the upper right corner</td></tr>
            <tr><td><code>--surface-rim</code></td><td>none</td><td>an edge gradient, bright at the top</td></tr>
            <tr><td><code>--surface-text-muted</code></td><td>the page's muted gray</td><td>darker in light mode, lighter in dark mode</td></tr>
            <tr><td><code>--shadow-overlay</code></td><td>one drop shadow</td><td>depth 4, <code>--shadow-4</code>, in both themes (<a href="/shadows">Shadows</a>)</td></tr>
            <tr><td><code>--surface-hotspot</code></td><td>none</td><td>a brighter patch on the rim, toward the right of the top edge</td></tr>
            <tr><td><code>--surface-rim-scale</code></td><td colspan="2">1 at 1x, 0.5 at 2x and ⅓ at 3x, so the rim is one device pixel</td></tr>
            <tr><td><code>--motion-enter</code>, <code>--motion-exit</code></td><td colspan="2">320ms, 180ms. 150ms and 120ms with reduced motion.</td></tr>
            <tr><td><code>--ease-spring</code></td><td colspan="2">a damped spring drawn with <code>linear()</code>, about 4% overshoot</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>showModal()</code>, <code>::backdrop</code>, and focus return work in every current browser. Newer
        features degrade like this where a browser lacks them:
      </p>
      <ul>
        <li>
          <code>closedby="any"</code> (close on a backdrop click): where{" "}
          <code>HTMLDialogElement.prototype.closedBy</code> is missing, the component closes the dialog when both{" "}
          <code>pointerdown</code> and <code>pointerup</code> land on the backdrop. A drag that starts inside the
          panel, such as selecting text, doesn't close it.
        </li>
        <li>
          <code>commandfor</code> buttons: the component opens and closes through <code>open</code>, so it doesn't
          need them. Static markup does, and the examples below open with them too.
        </li>
        <li>
          <code>@starting-style</code>: where it's missing, the dialog appears without the transition.
        </li>
        <li>
          Closing keeps the panel in the top layer while it animates out by transitioning <code>overlay</code>.
          Browsers without <code>overlay</code> drop it from the top layer at once, so the close animation may be
          cut short or play under the page. The dialog still closes. Only Chromium was tested.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Catalyst's Dialog for the parts, props and sizes. Headless UI's Dialog (MIT) for focus, closing, and the title
        and description wiring: the component adapts its logic and keeps its notice in <code>src/dialog.tsx</code>. Open Props UI's dialog CSS
        (MIT) for the scroll lock, adapted in <code>src/styles/elements/dialog.css</code> with its notice. APG for
        keys and roles.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Glass over bright content" name="dialog/glass" />
      <Example title="A form in a dialog" name="dialog/form" />
      <Example title="Long content scrolls in the body" name="dialog/scrolling" />
      <Example title="Sizes" name="dialog/sizes" />
    </article>
  );
}
