import { Example, PropsTable } from "../spec.tsx";

export default function TooltipPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Tooltip</h1>
      <p class="lede">A few words about a control, shown when you rest the pointer on it or tab to it.</p>
      <Example title="Tooltip" hero name="tooltip/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          The tip is <a href="/popover">Popover</a>'s panel as a native <code>popover="hint"</code> with{" "}
          <code>role="tooltip"</code>, right after its control. The control points at it with{" "}
          <code>interestfor</code>, and the browser does the rest with no JS: it shows the tip after the pointer rests on the control for 200ms,
          or keyboard focus stays on it as long, and hides it 100ms after they leave.
        </li>
        <li>
          Only the first tip waits. While one shows, moving the pointer or focus to another control shows its tip at
          once, as the OS does. A CSS rule sets the delay to 0 while any tip is open.
        </li>
        <li>
          The pointer passes through a tip to what's under it, and <kbd>Escape</kbd> hides it at once, so it never
          covers something you need. That is chosen over WCAG 1.4.13's rule that the pointer can rest on the tip.
        </li>
        <li>
          One tip shows at a time. Showing one doesn't close a Popover, Dropdown or Dialog it sits in.
        </li>
        <li>
          It names or describes its control. A control with words of its own, such as Publish, takes the tip as its
          description. An icon button has no words, so the tip is its name: one string, read once, where an{" "}
          <code>aria-label</code> and a tip would say it twice. The Solid component picks which.
        </li>
        <li>
          Safari and Firefox don't have <code>interestfor</code> yet. There, <code>wireTooltip</code> does the same
          with a few listeners, and the Solid component calls it. Static markup with no JS shows no tip there, which
          is why a tip only ever repeats or adds to what's on the page.
        </li>
        <li>
          It's text only. Nothing in it can be clicked or focused, because focus never goes to it. A hint with a link
          or a button in it is a <a href="/popover">Popover</a>, opened by a click.
        </li>
        <li>
          A touch has no hover, so a tap does the control's job and shows no tip. What a phone user must know goes on
          the page.
        </li>
      </ul>

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
              <td><code>Tooltip</code></td>
              <td>its child, then the tip</td>
              <td>
                Gives the child <code>interestfor</code> and <code>aria-describedby</code> or{" "}
                <code>aria-labelledby</code>, pointing at the tip.
              </td>
            </tr>
            <tr>
              <td>The control</td>
              <td>its child, such as a <a href="/button">Button</a> or a <a href="/link">Link</a></td>
              <td>Anything you can focus. No wrapper element is added around it.</td>
            </tr>
            <tr>
              <td>The tip</td>
              <td>
                <code>&lt;beautiful-tooltip popover="hint" role="tooltip"&gt;</code>
              </td>
              <td>
                The words, and maybe a shortcut after them in muted text, drawn by CSS from{" "}
                <code>data-shortcut</code>. No other element.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "content",
            type: "JSX.Element",
            description: "The hint: a few words, no full stop. Text only: nothing in it can be clicked.",
          },
          {
            name: "shortcut",
            type: "string",
            default: "none",
            description: (
              <>
                A key shortcut to show after the words, such as <code>"⌘Z"</code>. Written as{" "}
                <code>data-shortcut</code> and drawn by CSS, so it stays out of the control's name. Give the control{" "}
                <code>aria-keyshortcuts</code> too, so a screen reader says it.
              </>
            ),
          },
          {
            name: "anchor",
            type: '"top" | "top start" | "top end" | "bottom" | "bottom start" | "bottom end" | "left" | "left start" | "left end" | "right" | "right start" | "right end"',
            default: '"top"',
            description: (
              <>
                The side of the control the tip shows on, then how it lines up, as on PopoverPanel. A bare side
                centers it. Written as <code>data-anchor</code>, and left out at the default.
              </>
            ),
          },
          {
            name: "id",
            type: "string",
            default: "made up",
            description: "The tip's id, which its control points at.",
          },
          {
            name: "names",
            type: "boolean",
            default: "from the control",
            description: (
              <>
                Whether the tip is the control's name (<code>aria-labelledby</code>) rather than its description.
                Left out, a button or link with no words of its own is named by it. Icon button sets it.
              </>
            ),
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "The control: one element you can focus.",
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Button, Tooltip } from "beautiful-ui-solid";

<Tooltip content="Puts your changes live on spring-launch.com">
  <Button variant="primary" color="accent">Publish</Button>
</Tooltip>

<Tooltip content="Undo" shortcut="⌘Z">
  <Button variant="tertiary" aria-keyshortcuts="Meta+Z"><UndoIcon /></Button>
</Tooltip>`}</code>
      </pre>
      <p>
        The delays are the <code>--tooltip-delay</code> and <code>--tooltip-hide-delay</code> tokens. Set them on an
        element to change them for what's inside it, such as a shorter delay across a toolbar.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/">APG tooltip pattern</a>, with the delays
        and the delays of interest invokers, and the OS's quick hand-off from one tip to the next.
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
                <kbd>Tab</kbd> to the control
              </td>
              <td>Shows the tip after the delay. Focus stays on the control.</td>
            </tr>
            <tr>
              <td>Pointer rests on the control</td>
              <td>Shows the tip after the delay. Passing over it on the way somewhere else shows nothing.</td>
            </tr>
            <tr>
              <td>Pointer leaves, or focus moves on</td>
              <td>
                Hides the tip after the hide delay. Reaching another control first shows its tip at once, in place of
                this one. The tip itself takes no pointer: it passes through to what's under it.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>Hides the tip at once. A dialog or popover the control is in stays open.</td>
            </tr>
            <tr>
              <td>Click or press</td>
              <td>Does the control's job. The tip stays until the pointer or focus leaves.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read the tip as the control's description, after its name and role, or as its name on an icon button.
                The tip is read whether or not it's showing, and is never in the tab order.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Hidden:</strong> not drawn. Still read as the control's name or description.
        </li>
        <li>
          <strong>Showing:</strong> fades in and grows from 96% over 200ms, from the side <code>anchor</code> names,
          and goes in 120ms: Popover's motion. Under reduced motion, a plain fade.
        </li>
        <li>
          <strong>Size:</strong> 12px text on a 16px line, 0.25rem by 0.5rem of padding, 0.5rem corners, 0.5rem from
          its control. Up to 15rem wide, then the words wrap.
        </li>
        <li>
          <strong>Placement:</strong> centered above its control, flipping below where there's no room. It hides while
          its control is scrolled out of view.
        </li>
        <li>
          <strong>Disabled controls:</strong> show no tip, because the browser sends them no hover or focus. To say why
          something is disabled, say it on the page.
        </li>
        <li>
          <strong>Themes:</strong> Popover's surface, smaller. Classic is the raised color with a hairline edge
          and a soft shadow. Glass is Popover's pane of frosted glass, 72% white or near-black blurred 16px, with its
          sheen, rim and hotspot. It falls back to classic where the browser lacks <code>backdrop-filter</code> and
          where the user asks for reduced transparency. Popover's surface is used rather than an inverted dark
          chip.
        </li>
        <li>
          <strong>Shortcut:</strong> quieter than muted text, so the words lead: #71717a in light mode and #8b8b93 in
          dark, in both themes. That still keeps 4.5:1 on the tip.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
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
            <tr><td><code>--popup-fill</code>, <code>--popup-blur</code>, <code>--shadow-popup</code></td><td>the raised color, no blur</td><td>72% white or near-black, 16px</td></tr>
            <tr><td><code>--surface-edge</code>, <code>--surface-sheen</code>, <code>--surface-rim</code>, <code>--surface-hotspot</code></td><td>a gray edge, no light</td><td>Popover's edge and light</td></tr>
            <tr><td><code>--tooltip-shortcut</code></td><td colspan="2">#71717a, or #8b8b93 in dark, new</td></tr>
            <tr><td><code>--tooltip-delay</code>, <code>--tooltip-hide-delay</code></td><td colspan="2">200ms and 100ms, new. 0 while a tip shows.</td></tr>
            <tr><td><code>--leading-xs</code></td><td colspan="2">1rem, new: the line height for <code>--text-xs</code></td></tr>
            <tr><td><code>--motion-popup-enter</code>, <code>--motion-popup-exit</code></td><td colspan="2">Popover's</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <ul>
        <li>
          <code>interestfor</code> and <code>interest-delay</code> are in Chrome and Edge 149. Safari and Firefox
          don't have them: <code>wireTooltip</code> covers them.
        </li>
        <li>
          <code>popover="hint"</code> is in Chrome 133. Where it's missing, the browser treats the tip as a manual
          popover, and <code>wireTooltip</code> hides it.
        </li>
        <li>
          Anchor positioning is in Chrome 125, Safari 26 and Firefox 147. Without it, the tip shows in the middle of the
          screen, as a popover does.
        </li>
      </ul>

      <h2>References</h2>
      <p>
        APG's tooltip pattern for the role, the description and <kbd>Escape</kbd>. Interest invokers for the delays
        and Escape. macOS and Windows for showing the next tip at once. Open Props UI's Tooltip for the top placement and hiding with its
        anchor. GitHub Primer for a tip that names an icon button rather than describing it. Catalyst and Headless UI
        have no tooltip.
      </p>

      <h2>Other examples</h2>
      <p>
        Each is the Solid component, live. Rest the pointer on a control, or tab to it.
        Switch the theme and mode with T and M, or the toggles at the bottom right.
      </p>
      <Example title="Icon buttons" name="tooltip/toolbar" />
      <Example title="Describing a button" name="tooltip/describe" />
      <Example title="Placement" name="tooltip/placement" />
      <Example title="Glass over bright content" name="tooltip/glass" />
    </article>
  );
}
