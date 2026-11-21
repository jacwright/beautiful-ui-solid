import { Example, PropsTable } from "../spec.tsx";

export default function IconButtonPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Icon button</h1>
      <p class="lede">
        A button with only an icon, for an action people know by its picture: more actions, settings, close, delete
        in a row.
      </p>
      <Example title="Icon button" hero name="icon-button/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a <a href="/button">Button</a>, made square. It takes Button's variants, colors, <code>type</code>,{" "}
          <code>disabled</code> and <code>href</code>, and looks and behaves the same: the native{" "}
          <code>&lt;button&gt;</code> gives it its role, focus, and Enter and Space.
        </li>
        <li>
          It is as wide as it is tall: 36px, or 44px where the pointer is a finger. Beside a Button it is the same
          height, so a row of them lines up.
        </li>
        <li>
          <strong>It must have a name.</strong> The icon says nothing to a screen reader, so <code>label</code> is a
          required prop: the types won't compile without it. The name says what the button does, such as "Delete" or
          "Site settings", not what the icon shows, such as "Trash can".
        </li>
        <li>
          <code>data-icon-button</code> marks it in the markup, since CSS can't tell that a button has no text. A
          static page writes the attribute and gets the look with no JS.
        </li>
        <li>
          <strong>It shows its name in a <a href="/tooltip">Tooltip</a></strong> when the pointer rests on it or
          keyboard focus reaches it, after Tooltip's short wait, and at once while another tip shows, so moving along
          a toolbar reads each name. The tip is the button's name: the button points at it with{" "}
          <code>aria-labelledby</code> and has no <code>aria-label</code>, so a screen reader says the name once, not
          once as the name and again as a description. A tap on a touch screen does the action and shows no tip.
        </li>
        <li>
          A <code>shortcut</code> shows after the name in the tip, quieter, such as Undo ⌘Z. It stays out of the
          name; give <code>aria-keyshortcuts</code> too, so a screen reader says it. The browser's{" "}
          <code>title</code> tooltip is left out: it never shows for a keyboard or a finger.
        </li>
        <li>
          Secondary is the default, as for Button. Tertiary suits a row of actions or a toolbar, where a box around
          every icon would be loud.
        </li>
      </ul>
      <p>A button with an icon and text is a Button. A button that stays pressed is Toggle button.</p>

      <h2>Anatomy</h2>
      <p>
        The button, with one <code>&lt;svg&gt;</code> child, and its tip right after it. The tip is hidden until it
        shows, and takes no room in a row.
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
              <td><code>IconButton</code></td>
              <td>
                <code>&lt;button type="button" data-icon-button interestfor aria-labelledby&gt;</code>, or{" "}
                <code>&lt;a data-button data-icon-button interestfor aria-labelledby&gt;</code> with{" "}
                <code>href</code>
              </td>
              <td>
                The button. <code>data-variant</code>, <code>data-color</code> and <code>data-shape</code> carry the props, and are left out
                at their defaults, as on Button. <code>shape="pill"</code> makes it a circle.
              </td>
            </tr>
            <tr>
              <td>The icon</td>
              <td>
                <code>&lt;svg aria-hidden="true"&gt;</code>
              </td>
              <td>16px, or 20px for a finger, centered. It takes the button's text color.</td>
            </tr>
            <tr>
              <td>The tip</td>
              <td>
                <code>&lt;beautiful-tooltip popover="hint" role="tooltip"&gt;</code>
              </td>
              <td>
                Tooltip's, holding the name. Both <code>interestfor</code> and <code>aria-labelledby</code> on the
                button name its id.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "label",
            type: "string",
            default: "required",
            description: "The button's name, shown in its tip and said by screen readers. Say the action.",
          },
          {
            name: "shortcut",
            type: "string",
            default: "none",
            description: (
              <>
                A key shortcut shown after the name in the tip, such as "⌘Z". Give <code>aria-keyshortcuts</code>{" "}
                too.
              </>
            ),
          },
          {
            name: "anchor",
            type: '"top" | "bottom" | "left" | "right", with " start" or " end"',
            default: '"top"',
            description: "The side the tip shows on, as on Tooltip.",
          },
          {
            name: "tooltipId",
            type: "string",
            default: "made up",
            description: "The tip's id, for markup that must match a static page.",
          },
          {
            name: "variant",
            type: '"primary" | "secondary" | "tertiary"',
            default: '"secondary"',
            description: "As on Button. Tertiary for a row of actions or a toolbar.",
          },
          {
            name: "color",
            type: '"neutral" | "accent" | "danger"',
            default: '"neutral"',
            description: "As on Button. Danger for an action that deletes.",
          },
          {
            name: "type",
            type: '"button" | "submit" | "reset"',
            default: '"button"',
            description: (
              <>
                As on Button. Not allowed with <code>href</code>.
              </>
            ),
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: (
              <>
                The native <code>disabled</code>. Not allowed with <code>href</code>.
              </>
            ),
          },
          {
            name: "href",
            type: "string",
            default: "none",
            description: (
              <>
                Renders <code>&lt;a href data-button data-icon-button&gt;</code>, a link that looks like an icon
                button.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The icon: one <svg aria-hidden=\"true\">." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { IconButton } from "beautiful-ui-solid";

<IconButton label="More actions" variant="tertiary"><EllipsisIcon /></IconButton>
<IconButton label="Delete" variant="tertiary" color="danger" onClick={remove}><TrashIcon /></IconButton>
<IconButton label="Undo" shortcut="⌘Z" aria-keyshortcuts="Meta+Z" variant="tertiary"><UndoIcon /></IconButton>`}</code>
      </pre>
      <p>
        Other attributes pass through to the element, as on Button: <code>onClick</code>, <code>commandfor</code>,{" "}
        <code>aria-haspopup</code>, <code>aria-*</code> except <code>aria-label</code> and{" "}
        <code>aria-labelledby</code>, which the tip takes. A Dropdown's or Popover's trigger can be an icon button.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/button/">APG button pattern</a>, which asks that a
        button with no text be named, here by its tip, and Tooltip's keys. The browser does the rest.
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
                Move focus to and from the button, showing its tip while focus is there. A disabled button is skipped.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>Activates the button, or follows the link.</td>
            </tr>
            <tr>
              <td>
                <kbd>Space</kbd>
              </td>
              <td>Activates a button when the key comes up. A link takes Enter only, as APG gives links.</td>
            </tr>
            <tr>
              <td>
                <kbd>Escape</kbd>
              </td>
              <td>Hides the tip at once. A Dialog or Popover the button sits in stays open.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce "Delete, button", or "View site, link" with <code>href</code>: the tip's words, once, and the
                role. The icon is hidden from them. Voice control users say the same name to press it.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <p>Every state is Button's, so an icon button and a Button side by side behave as one row.</p>
      <ul>
        <li>
          <strong>Rest:</strong> as the variant and color set it.
        </li>
        <li>
          <strong>Hover:</strong> primary darkens by 8%; secondary and tertiary take a tint of their color. Only where
          the pointer can hover.
        </li>
        <li>
          <strong>Pressed:</strong> a shade darker and 98% of its size over 120ms. With reduced motion it only
          darkens.
        </li>
        <li>
          <strong>Focus:</strong> the kit's ring, 2px of the accent color 2px outside the edge, rounded with it, from
          the keyboard only.
        </li>
        <li>
          <strong>Disabled:</strong> half opacity, the default cursor, and no hover, press or tip. It keeps its
          name.
        </li>
        <li>
          <strong>Touch:</strong> where the main pointer is coarse, a 44px square with a 20px icon: the target size
          Apple and WCAG's enhanced target size ask for. With a mouse it is 36px, over WCAG's 24px minimum.
        </li>
        <li>
          <strong>Themes:</strong> classic and glass draw it exactly as they draw Button: a primary is tinted glass,
          a secondary a pane of frosted glass with the rim and hotspot, and a tertiary has no glass until hovered.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
      <p>
        Icon button reads Button's tokens, listed on the <a href="/button">Button</a> page, and its tip reads
        Tooltip's, listed on the <a href="/tooltip">Tooltip</a> page. Two set its size, and none are new.
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
            <tr>
              <td><code>--control-height</code></td>
              <td>Its height and its width: 2.25rem, or 2.75rem for a coarse pointer.</td>
            </tr>
            <tr>
              <td><code>--control-icon</code></td>
              <td>The icon: 1rem, or 1.25rem for a coarse pointer.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        The same as Button: every current browser, with glass falling back to classic without{" "}
        <code>backdrop-filter</code>. The tip is Tooltip's: shown by <code>interestfor</code> in Chromium, and by
        the Solid component's few listeners in Safari and Firefox. Static markup with no JS names the button in
        every browser, and shows the tip only in Chromium.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's IconButton for a square button that takes the Button's looks. Catalyst has no icon button of its own: it puts an icon alone in its Button with an{" "}
        <code>aria-label</code>, which is what this is, with the square and the required name made part of it. APG
        for the keys, the role and naming a button with no text.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Glass over bright content" name="icon-button/glass" />
      <Example title="In each variant" name="icon-button/variants" />
      <Example title="A row of actions" name="icon-button/row-actions" />
      <Example title="Beside a button" name="icon-button/with-buttons" />
      <Example title="A link that looks like an icon button" name="icon-button/link" />
      <Example title="Disabled" name="icon-button/disabled" />
    </article>
  );
}
