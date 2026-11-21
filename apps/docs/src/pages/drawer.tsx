import { Example, PropsTable } from "../spec.tsx";

export default function DrawerPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Drawer</h1>
      <p class="lede">
        A panel that slides in from an edge of the screen, over the page: settings, details, a filter, or an app's
        menu on a phone.
      </p>
      <Example title="Drawer" hero name="drawer/lead" />

      <h2>What it does</h2>
      <p>
        Drawer is a <a href="/dialog">Dialog</a> that slides in from an edge. It renders the same{" "}
        <code>&lt;dialog&gt;</code>, the same parts, the same surface and backdrop, and the same focus and close
        wiring. It differs in five ways.
      </p>
      <ul>
        <li>
          <code>side</code> picks the edge: <code>start</code>, <code>end</code> (the default), <code>top</code> or{" "}
          <code>bottom</code>. Start and end follow the writing direction, so end is the right edge in English and
          the left in Arabic.
        </li>
        <li>
          It floats 0.5rem in from its edge and the two beside it, with all four corners rounded, like Alert's
          bottom card on a phone. On glass that keeps the rim and its light whole.
        </li>
        <li>
          A side drawer fills the screen's height, and its body takes the room the title and actions leave, so the
          actions sit at the bottom. A top or bottom drawer fills the width and is as tall as its content, up to 85%
          of the screen.
        </li>
        <li>
          A side drawer always leaves 3rem of backdrop beside it, even on a phone, so there is always somewhere to
          tap to close it. Like Dialog, it has no × button: Escape, the backdrop and Cancel close it.
        </li>
        <li>It slides in from beyond its edge, rather than rising and growing in place.</li>
      </ul>
      <p>
        Use a Dialog for a task that needs the user's full attention. Use a Drawer for a task that sits beside the
        page, where seeing the page's edge helps: editing a row's details, filtering a list, or a menu.
      </p>

      <h2>Anatomy</h2>
      <p>Dialog's parts, under Drawer's names. Each renders the same element as its Dialog part.</p>
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
              <td><code>Drawer</code></td>
              <td><code>&lt;dialog data-drawer="end"&gt;</code></td>
              <td>The panel. Its <code>::backdrop</code> dims the page.</td>
            </tr>
            <tr>
              <td><code>DrawerTitle</code></td>
              <td><code>&lt;h2&gt;</code></td>
              <td>Names the drawer.</td>
            </tr>
            <tr>
              <td><code>DrawerDescription</code></td>
              <td><code>&lt;p&gt;</code></td>
              <td>Describes it. Optional.</td>
            </tr>
            <tr>
              <td><code>DrawerBody</code></td>
              <td><code>&lt;beautiful-dialog-body&gt;</code></td>
              <td>The content. It fills the drawer's height and scrolls when it holds more.</td>
            </tr>
            <tr>
              <td><code>DrawerActions</code></td>
              <td><code>&lt;footer&gt;</code></td>
              <td>The buttons, right-aligned at the bottom. On narrow screens they stack, primary on top.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        As in Dialog, the parts can sit in one <code>&lt;form method="dialog"&gt;</code>. A drawer with no visible
        title, such as a menu, is named with <code>aria-label</code>. A drawer that holds a{" "}
        <a href="/sidebar">Sidebar</a> gives it the whole panel, and the Sidebar pads its own parts, as in an
        app's menu on a phone.
      </p>

      <h2>Props</h2>
      <h3>Drawer</h3>
      <PropsTable
        rows={[
          {
            name: "side",
            type: '"start" | "end" | "top" | "bottom"',
            default: '"end"',
            description: "The edge it slides in from. Start and end follow the writing direction.",
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg"',
            default: '"md"',
            description: (
              <>
                A side drawer's width: 20, 28 or 40rem. It never covers the last 3rem of the screen. A top or bottom
                drawer is the screen's width, so it ignores <code>size</code>.
              </>
            ),
          },
          { name: "open", type: "boolean", description: "As on Dialog." },
          { name: "onClose", type: "(returnValue: string) => void", description: "As on Dialog." },
          { name: "id", type: "string", description: "As on Dialog." },
        ]}
      />
      <p>
        Other attributes pass through to the <code>&lt;dialog&gt;</code>, as on Dialog. <code>closedby</code>{" "}
        defaults to <code>"any"</code>.
      </p>
      <h3>DrawerTitle, DrawerDescription, DrawerBody, DrawerActions</h3>
      <p>As the Dialog parts.</p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/">APG modal dialog pattern</a>, as
        Dialog. A drawer is a modal dialog that enters from an edge, so the keys are Dialog's.
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
                Focus moves to the control with <code>autofocus</code>. With none, the Solid component focuses the
                drawer itself, so a phone's keyboard doesn't open for its first field, and screen readers read its
                title and description.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd>
              </td>
              <td>Move through the drawer's controls. The page behind is inert.</td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>Closes the drawer.</td>
            </tr>
            <tr>
              <td>Backdrop click</td>
              <td>Closes the drawer. A drag that starts in the panel doesn't.</td>
            </tr>
            <tr>
              <td>Closing</td>
              <td>Focus returns to the element that opened it, or the newest one still on the page, as Dialog's.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>Announce a dialog, named by its title or <code>aria-label</code>. The page behind is hidden.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Closed:</strong> not rendered.
        </li>
        <li>
          <strong>Opening:</strong> over 320ms it slides in from beyond its edge and fades in, easing out with no
          spring, as Alert's bottom card does. An overshoot would pull it off the edge it is fixed to. The backdrop
          fades in.
        </li>
        <li>
          <strong>Closing:</strong> it slides back out in 180ms, easing in.
        </li>
        <li>
          <strong>Reduced motion:</strong> a plain fade, with no movement.
        </li>
        <li>
          <strong>Open:</strong> the page behind keeps its scroll position and doesn't scroll. A side drawer is the
          screen's height less 0.5rem at the top and the bottom.
        </li>
        <li>
          <strong>Long content:</strong> the body scrolls. The title and the actions stay in view.
        </li>
        <li>
          <strong>Narrow screen</strong> (under 40rem): a side drawer is at most the screen's width less 3.5rem, and
          the actions stack, primary on top. A bottom drawer's gap clears the phone's home indicator (
          <code>env(safe-area-inset-bottom)</code>) when the page sets <code>viewport-fit=cover</code>.
        </li>
        <li>
          <strong>Right to left:</strong> start and end swap edges, and the slide follows them.
        </li>
        <li>
          <strong>Themes:</strong> Dialog's panel. On glass that is the bezel, a 0.75rem band of very clear glass
          around a nearly opaque inner panel, with the rim and its hotspot on the outer edge, lit from the upper
          right. Classic has an opaque panel. Both fall back as Dialog's does.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
      <p>Drawer reads Dialog's tokens and adds three, which a page can set on the drawer.</p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Dialog's surface, backdrop and motion tokens</td><td>As on <a href="/dialog">Dialog</a></td></tr>
            <tr><td><code>--drawer-width</code></td><td>a side drawer's width: 28rem, or 20 and 40rem for sm and lg</td></tr>
            <tr><td><code>--drawer-gap</code></td><td>how far it floats in from the edges: 0.5rem (<code>--space-2</code>)</td></tr>
            <tr><td><code>--drawer-reach</code></td><td>the backdrop a side drawer always leaves to tap: 3rem (<code>--space-12</code>)</td></tr>
            <tr><td><code>--ease-sheet</code></td><td>Alert's bottom card's easing: a fast start that settles with no overshoot</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>Dialog's notes apply. Drawer adds these:</p>
      <ul>
        <li>
          <code>:dir(rtl)</code> flips the slide for start and end. It works in every current browser. The margins
          that place the drawer are logical, so they follow the direction with no rule.
        </li>
        <li>
          The close slide needs the same <code>overlay</code> transition as Dialog's. Only Chromium was tested.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Open Props UI's Drawer (MIT) for the four sides as logical edges and a drawer as a native{" "}
        <code>&lt;dialog&gt;</code> that translates in from beyond its edge. We wrote our own CSS and copied none of
        it. iOS sheets and Alert's bottom card for the floating panel and its easing. APG's modal dialog pattern for
        the keys. Everything else comes from <a href="/dialog">Dialog</a>.
      </p>

      <h2>Examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Glass over bright content" name="drawer/glass" />
      <Example title="Sides" name="drawer/sides" />
      <Example title="Long content scrolls in the body" name="drawer/activity" />
      <Example title="An app's menu on a phone" name="drawer/navigation" />
      <Example title="Sizes" name="drawer/sizes" />
    </article>
  );
}
