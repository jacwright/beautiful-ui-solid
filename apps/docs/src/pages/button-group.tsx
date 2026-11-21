import { Example, PropsTable } from "../spec.tsx";

export default function ButtonGroupPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Button group</h1>
      <p class="lede">
        Buttons joined into one control, for actions that belong together: a split button, a pager, Undo and Redo.
      </p>
      <Example title="Button group" hero name="button-group/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It holds Buttons side by side with no gap. Only the outer corners are round, and two neighbours share one
          edge, so the group reads as one control cut into parts.
        </li>
        <li>
          It is a <code>role="group"</code> with a label, so a screen reader says what the buttons are for as it
          enters them: "Publish, group". The label is required: the types take an <code>aria-label</code> or an{" "}
          <code>aria-labelledby</code>.
        </li>
        <li>
          Each button keeps its own variant, color and <code>disabled</code>, and does its own action. The group
          adds no behavior and no script. Tab reaches each button in turn.
        </li>
        <li>
          A split button is a group of a Button and a Dropdown's button: the action people take most, and a menu of
          its other forms beside it. The menu's button is square, as an Icon button is. The Dropdown's menu sits in
          the group after its button, and the corners skip it.
        </li>
        <li>
          It takes Buttons and links that look like buttons (<code>Button</code> with <code>href</code>). Use one
          variant across a group: all secondary, or all primary for a split button. Tertiary has no edge, so it
          doesn't join.
        </li>
        <li>
          In glass, the group catches the light as one button does: one rim around the whole with one hotspot, and
          one shadow under it. Each button stays its own pane of frosted glass.
        </li>
        <li>
          The CSS styles every <code>&lt;beautiful-button-group&gt;</code>, so a static page gets the look with no
          JS. Every rule is wrapped in <code>:where()</code>, so its specificity is 0.
        </li>
      </ul>
      <p>
        A group where one button stays chosen, such as 7 days, 30 days, 90 days, is Toggle group. A row of separate
        buttons with space between them needs no component: a flex row with a gap.
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
              <td>
                <code>ButtonGroup</code>
              </td>
              <td>
                <code>&lt;beautiful-button-group role="group"&gt;</code>
              </td>
              <td>
                Holds the buttons in a row, rounds the outer corners, and draws the shadow, and in glass the rim. No
                semantic element fits a group of buttons, so it is the kit's styling hook with the group role.
              </td>
            </tr>
            <tr>
              <td>The buttons</td>
              <td>
                <code>Button</code>, a Dropdown's or Popover's button, or <code>Button</code> with <code>href</code>
              </td>
              <td>
                Each as Button renders it, with square inner corners and no start edge after the first: the one before
                it draws the line between them.
              </td>
            </tr>
            <tr>
              <td>Rim</td>
              <td>
                <code>::before</code>
              </td>
              <td>Glass only. Button's rim and hotspot, drawn once at the group's size.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "aria-label",
            type: "string",
            description: (
              <>
                What the buttons are for, read as the group is entered. Required unless{" "}
                <code>aria-labelledby</code> is given.
              </>
            ),
          },
          {
            name: "aria-labelledby",
            type: "string",
            default: "none",
            description: "The id of a heading or text already on the page that names the group, in place of aria-label.",
          },
          { name: "children", type: "JSX.Element", description: "The buttons, and any Dropdown or Popover they open." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Button, ButtonGroup, Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "beautiful-ui-solid";

<ButtonGroup aria-label="Site">
  <Button onClick={edit}>Edit</Button>
  <Button onClick={preview}>Preview</Button>
  <Button onClick={share}>Share</Button>
</ButtonGroup>

<ButtonGroup aria-label="Publish">
  <Button variant="primary" color="accent" onClick={publish}>Publish</Button>
  <Dropdown>
    <DropdownButton variant="primary" color="accent" aria-label="More ways to publish" data-icon-button="">
      <ChevronDownIcon />
    </DropdownButton>
    <DropdownMenu>
      <DropdownItem onClick={schedule}>Schedule for later</DropdownItem>
      <DropdownItem onClick={publishPreview}>Publish to preview only</DropdownItem>
    </DropdownMenu>
  </Dropdown>
</ButtonGroup>`}</code>
      </pre>
      <p>
        Other attributes pass through to the element: <code>id</code>, <code>class</code>, <code>aria-*</code>, and
        event handlers.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From APG's guidance on the <a href="https://www.w3.org/TR/wai-aria-1.2/#group">group role</a> and the{" "}
        <a href="https://www.w3.org/WAI/ARIA/apg/patterns/button/">button pattern</a>. The browser does all of it.
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
                Move to each button in the group in turn, and on past it. A disabled button is skipped. The group
                itself takes no focus.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>
              </td>
              <td>As on each Button. On a split button's menu button, they open the menu, as on Dropdown.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Announce the group's label and "group" when focus enters it, then each button by its own name. A
                button with only an icon is an Icon button, named by its <code>aria-label</code>, as the split
                button's menu button is.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        No arrow keys. A group is a handful of buttons, and Tab reaching each one is what people expect of buttons.
        A long row of controls that should take one Tab stop and move by arrows is a toolbar, a different pattern.
      </p>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Rest:</strong> each button as its variant and color set it, joined.
        </li>
        <li>
          <strong>Hover:</strong> the button under the pointer, as Button does. Its neighbours don't change.
        </li>
        <li>
          <strong>Pressed:</strong> a shade darker, as Button, but it doesn't shrink: a joined button that shrinks
          would open a gap beside its neighbours.
        </li>
        <li>
          <strong>Focus:</strong> the kit's ring around the focused button, drawn over its neighbours. The moving
          ring glides from one button to the next.
        </li>
        <li>
          <strong>Disabled:</strong> a disabled button fades to half opacity, as Button does, with its part of the
          edge. Its neighbours and the glass rim stay as they are. A link can't be disabled.
        </li>
        <li>
          <strong>Narrow screens:</strong> the group never grows wider than its container. The buttons stay in one
          row, and a long label wraps inside its button.
        </li>
        <li>
          <strong>Touch:</strong> each button keeps Button's 44px height and 16px text where the pointer is a finger.
        </li>
        <li>
          <strong>Right to left:</strong> the corners and the shared edges use logical properties, so the round
          corners stay on the outside.
        </li>
        <li>
          <strong>Themes:</strong> in classic, the line between two buttons is the gray control edge, or a shade
          darker than the fill between two primaries, and the group has Button's small shadow. In glass, each button
          is its own frosted pane, and the group draws one rim and one shadow around them all. Glass falls back to
          classic as Button does.
        </li>
      </ul>

      <h2>Look and motion tokens</h2>
      <p>Button group reads Button's tokens, and adds none.</p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Job</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--radius-md</code>
              </td>
              <td>The outer corners, as on a Button.</td>
            </tr>
            <tr>
              <td>
                <code>--control-pad-x</code>
              </td>
              <td>A button after the first takes its edge's 1px back as padding, so every button keeps its width.</td>
            </tr>
            <tr>
              <td>
                <code>--control-shadow</code>
              </td>
              <td>Drawn once, under the group.</td>
            </tr>
            <tr>
              <td>
                <code>--control-rim</code>, <code>--control-hotspot</code>, <code>--control-rim-content</code>,{" "}
                <code>--surface-rim-scale</code>
              </td>
              <td>The glass rim, drawn once around the group. Classic draws none.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        The corners use <code>:nth-child(1 of …)</code> and <code>:nth-last-child(1 of …)</code> to count only the
        buttons, in every current browser since 2023. The rest is Button's CSS.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's ButtonGroup for a <code>role="group"</code> that rounds only its outer corners and shares one
        edge between neighbours, with logical properties for right-to-left. Its group-wide variant and size props
        are left out: each Button carries its own look, and the kit has one size. APG for the group role and its
        label.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Glass over bright content" name="button-group/glass" />
      <Example title="Secondary, the default" name="button-group/secondary" />
      <Example title="A split button" name="button-group/split" />
      <Example title="Links that look like buttons" name="button-group/links" />
      <Example title="With a disabled button" name="button-group/disabled" />
    </article>
  );
}
