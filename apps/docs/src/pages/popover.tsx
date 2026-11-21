import { Example, PropsTable } from "../spec.tsx";

export default function PopoverPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Popover</h1>
      <p class="lede">A small panel of content that opens beside the button that shows it, and closes when you're done with it.</p>
      <Example title="Popover" hero name="popover/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          The panel is a native <code>popover</code>, and its button points at it with{" "}
          <code>commandfor</code> and <code>command="toggle-popover"</code>. The browser does the rest with no JS: it
          puts the panel above everything else, closes it on <kbd>Escape</kbd> or a click outside, returns focus to
          the button, and tells screen readers whether the button's panel is expanded.
        </li>
        <li>
          CSS anchor positioning places the panel against its button, below it and lined up with its left edge
          unless <code>anchor</code> says otherwise. Where it doesn't fit, it flips to the other side, then to the
          other end. The button is the panel's anchor because it opens it, so the markup names no anchor.
        </li>
        <li>
          One popover is open at a time. Opening another closes the first, unless the second is inside the first.
        </li>
        <li>
          The panel comes right after its button in the markup, so <kbd>Tab</kbd> from the button goes into it.
        </li>
        <li>
          The Solid component adds what the platform lacks: the panel closes when focus leaves it and its button, as
          in Headless UI, and <code>open</code> and <code>onToggle</code> let a parent control it.
        </li>
        <li>
          It holds any content: a few lines, a link, a couple of buttons. It isn't a menu. A list of actions to pick
          from is <strong>Dropdown</strong>, with arrow keys and roles of its own. A hint on hover or focus is{" "}
          <strong>Tooltip</strong>. A task that needs the page to wait is <a href="/dialog">Dialog</a>. Dropdown,
          Tooltip, Listbox and Combobox are all built on this panel.
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
              <td><code>Popover</code></td>
              <td>nothing</td>
              <td>Gives its button and panel one id, and holds the open state. Adds no element.</td>
            </tr>
            <tr>
              <td><code>PopoverButton</code></td>
              <td>
                a <a href="/button">Button</a>, with <code>commandfor</code> and{" "}
                <code>command="toggle-popover"</code>
              </td>
              <td>Opens and closes the panel.</td>
            </tr>
            <tr>
              <td><code>PopoverPanel</code></td>
              <td>
                <code>&lt;beautiful-popover popover&gt;</code>
              </td>
              <td>The panel. Its last child may be a <code>&lt;footer&gt;</code> of actions, set at its end.</td>
            </tr>
            <tr>
              <td>A close button</td>
              <td>
                a Button with <code>command="hide-popover"</code>
              </td>
              <td>Optional, such as Done. No component: the attribute does it.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Popover</h3>
      <PropsTable
        rows={[
          {
            name: "id",
            type: "string",
            default: "made up",
            description: "The panel's id, which its button points at. Give one when something else must point at it too.",
          },
          {
            name: "open",
            type: "boolean",
            default: "none",
            description: "Opens or closes the panel from the parent. Leave it out and the button opens and closes it.",
          },
          {
            name: "onToggle",
            type: "(open: boolean) => void",
            default: "none",
            description: "Called whenever the panel opens or closes, by the button, a key, a click outside, or focus leaving.",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "The button and the panel, with anything between them.",
          },
        ]}
      />
      <h3>PopoverButton</h3>
      <p>
        Button's props: <code>variant</code>, <code>color</code>, <code>disabled</code>, and the label as its
        children. Not <code>href</code>: a link can't open a popover.
      </p>
      <h3>PopoverPanel</h3>
      <PropsTable
        rows={[
          {
            name: "anchor",
            type: '"bottom start" | "bottom" | "bottom end" | "top start" | "top" | "top end" | "left start" | "left" | "left end" | "right start" | "right" | "right end"',
            default: '"bottom start"',
            description: (
              <>
                The side of the button the panel opens on, then how it lines up. Start is the button's left edge above
                or below it, and its top edge beside it. A bare side centers it. Written as <code>data-anchor</code>,
                and left out at the default.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The content." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Popover, PopoverButton, PopoverPanel } from "beautiful-ui-solid";

<Popover>
  <PopoverButton>Share</PopoverButton>
  <PopoverPanel>
    <p>Anyone with the link can see Spring launch.</p>
  </PopoverPanel>
</Popover>`}</code>
      </pre>
      <p>
        Other attributes pass through to the panel, such as <code>class</code> and <code>aria-label</code>. To move
        focus into the panel when it opens, put <code>autofocus</code> on the field or button that should take it.
        The browser focuses it.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/">APG disclosure pattern</a>, with
        Headless UI's Popover for closing. The browser does all of it but closing when focus leaves.
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
                <kbd>Enter</kbd>, <kbd>Space</kbd> on the button
              </td>
              <td>Opens the panel, or closes it if it's open. Focus stays on the button.</td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>
              </td>
              <td>From the button, moves into the panel's first link, button or field, then through them in order.</td>
            </tr>
            <tr>
              <td>Focus leaves</td>
              <td>
                Tabbing past the end of the panel, or back before its button, closes it. Focus goes on as usual. With
                no JS, the panel stays open until <kbd>Escape</kbd> or a click outside.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>Closes the panel. If focus was in it, focus returns to the button.</td>
            </tr>
            <tr>
              <td>Click outside</td>
              <td>Closes the panel. Focus stays where the click put it.</td>
            </tr>
            <tr>
              <td>Opening</td>
              <td>
                Focus stays on the button, unless something in the panel has <code>autofocus</code>.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce the button with its state, collapsed or expanded. The panel has no role of its own: its
                content is read as it is, in its place after the button.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Closed:</strong> not drawn and not in the tab order.
        </li>
        <li>
          <strong>Opening:</strong> fades in and grows from 96% over 200ms, from the side <code>anchor</code> names, easing out. Quicker than
          a dialog: it opens where you're already looking.
        </li>
        <li>
          <strong>Closing:</strong> fades and shrinks back in 120ms, easing in.
        </li>
        <li>
          <strong>Reduced motion:</strong> a plain fade, with no movement.
        </li>
        <li>
          <strong>Size:</strong> as wide as its content, up to 20rem, and never wider than the screen less 1rem a
          side. 1rem of padding, 0.75rem corners, 14px text, and 0.5rem from its button.
        </li>
        <li>
          <strong>Narrow screens:</strong> the same panel, still beside its button. It flips where it doesn't fit.
        </li>
        <li>
          <strong>Themes:</strong> classic is the raised color with a hairline edge and a soft shadow. Glass is one
          pane of frosted glass with no bezel, smaller than Dialog's panel: 72% white in light mode and 72%
          near-black in dark, blurred 16px, so its text keeps its contrast over whatever it opens on. It catches the
          same light as Dialog: a sheen from the upper right, the hairline rim and its hotspot. Glass falls back to
          classic where the browser lacks <code>backdrop-filter</code> and where the user asks for reduced
          transparency.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
      <p>
        Popover adds the <code>--popup-*</code> tokens, which Dropdown, Tooltip, Listbox and Combobox will read
        too.
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
            <tr><td><code>--popup-fill</code></td><td>the raised color</td><td>72% white, or 72% near-black</td></tr>
            <tr><td><code>--popup-blur</code></td><td>0</td><td>16px, saturated 180% (<code>--surface-saturate</code>)</td></tr>
            <tr><td><code>--shadow-popup</code></td><td>a soft shadow</td><td>depth 3, <code>--shadow-3</code>, in both themes (<a href="/shadows">Shadows</a>)</td></tr>
            <tr><td><code>--surface-edge</code>, <code>--surface-sheen</code>, <code>--surface-rim</code>, <code>--surface-hotspot</code></td><td>a gray edge, no light</td><td>Dialog's edge and light</td></tr>
            <tr><td><code>--surface-text-muted</code></td><td colspan="2">muted text inside the panel</td></tr>
            <tr><td><code>--radius-lg</code></td><td colspan="2">0.75rem, new: between a button's 0.5rem and a dialog's 1rem</td></tr>
            <tr><td><code>--motion-popup-enter</code>, <code>--motion-popup-exit</code></td><td colspan="2">200ms and 120ms, new</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <ul>
        <li>
          The <code>popover</code> attribute works in every current browser. <code>commandfor</code> and{" "}
          <code>command</code> are in Chrome 135, Safari 26.2 and Firefox 144.
        </li>
        <li>
          Anchor positioning is in Chrome 125, Safari 26 and Firefox 147. Without it, the panel opens in the middle of
          the screen, where the browser puts a popover by default.
        </li>
        <li>
          The button as the panel's implicit anchor, and the animated close (the <code>overlay</code> transition),
          were tested only in Chromium.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        Headless UI's Popover for the name, the parts, the anchor values, closing when focus leaves, and focus staying
        on the button when it opens. APG's disclosure pattern for the keys and the expanded state. The HTML
        popover API and anchor positioning for everything the browser now does itself. Catalyst has no popover.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Glass over bright content" name="popover/glass" />
      <Example title="With actions" name="popover/share" />
      <Example title="Placement" name="popover/placement" />
      <Example title="Help beside a line of text" name="popover/help" />
    </article>
  );
}
