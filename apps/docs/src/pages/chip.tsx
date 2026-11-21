import { Example, PropsTable } from "../spec.tsx";

export default function ChipPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Chip</h1>
      <p class="lede">
        One thing someone picked or typed, shown as a small pill they can take away: a tag on a site, a person to
        invite, a filter on a list.
      </p>
      <Example title="Chip" hero name="chip/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It shows a short label in a soft pill, in one of the colors Badge has: neutral (the default), accent, red,
          orange, yellow, green, teal, blue, purple and pink. The colors come from the same tokens as Badge's, so a
          green tag and a green badge are the same green.
        </li>
        <li>
          With <code>onRemove</code> it ends in a small × button that takes it away. The button is a real{" "}
          <code>&lt;button&gt;</code>, named "Remove" and the chip's words, so a screen reader says "Remove Spring sale,
          button". The × is drawn with a CSS mask: no icon to pass in.
        </li>
        <li>
          <kbd>Delete</kbd> and <kbd>Backspace</kbd> on the × remove the chip too, as in a mail app's list of
          recipients.
        </li>
        <li>
          When a chip goes, focus moves to the next chip's ×, or the one before when it was the last. With no chips
          left, focus goes to the group, so it never falls back to the top of the page.
        </li>
        <li>
          A row of chips is a <code>ChipGroup</code>: a list with a name ("Tags", "Filters") that wraps onto more lines
          as it fills. It's what moves focus after a removal, so removable chips always sit in one.
        </li>
        <li>
          An icon can go before the words, such as a calendar on a date filter. It takes the chip's color.
        </li>
        <li>
          It's the height of a small control (28px, 36px for a finger), and the ×'s target is the chip's full height,
          above WCAG's 24px. A long label wraps rather than being cut off, so nothing is hidden.
        </li>
      </ul>
      <p>
        <strong>Chip or Badge.</strong> A Badge describes something else: "Live" beside a site's name, "3" on an inbox.
        It is read-only and never has a ×. A Chip is the thing itself, one of several someone chose, and usually can be
        removed. A chip that turns a filter on and off when pressed is a Toggle button, not a Chip.
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
              <td><code>ChipGroup</code></td>
              <td><code>&lt;beautiful-chips role="list"&gt;</code></td>
              <td>The row. Named by <code>aria-label</code> or <code>aria-labelledby</code>. Wraps, with 8px between chips.</td>
            </tr>
            <tr>
              <td><code>Chip</code></td>
              <td><code>&lt;beautiful-chip role="listitem"&gt;</code></td>
              <td>
                The pill. <code>data-color</code> carries the color, and is left out for neutral. Outside a group it has
                no role, and reads as its words.
              </td>
            </tr>
            <tr>
              <td>Icon</td>
              <td>an <code>&lt;svg&gt;</code> child before the words</td>
              <td>Optional. 16px, in the chip's color, hidden from screen readers.</td>
            </tr>
            <tr>
              <td>Remove button</td>
              <td><code>&lt;button aria-label="Remove …"&gt;</code></td>
              <td>
                Only with <code>onRemove</code>. Empty: the × is its <code>::after</code>, a mask in the chip's color,
                which reaches the chip's full height so the target is bigger than the circle you see.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Chip</h3>
      <PropsTable
        rows={[
          {
            name: "color",
            type: '"neutral" | "accent" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"',
            default: '"neutral"',
            description: "Badge's colors. Color sorts and groups; it never carries the meaning alone, the words do.",
          },
          {
            name: "onRemove",
            type: "() => void",
            default: "none",
            description: (
              <>
                Shows the × and runs when it is pressed, or on <kbd>Delete</kbd> or <kbd>Backspace</kbd>. Take the chip
                out of your list here; the group moves focus once it's gone.
              </>
            ),
          },
          {
            name: "removeLabel",
            type: "string",
            default: '"Remove " + the words',
            description: (
              <>
                The ×'s name. Needed only when the chip's children aren't plain text, such as a name with an icon of
                your own, or when the label should say more: "Remove filter Form: Contact us".
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The words, and an optional leading <svg>." },
        ]}
      />
      <h3>ChipGroup</h3>
      <PropsTable
        rows={[
          {
            name: "aria-label",
            type: "string",
            default: "none",
            description: (
              <>
                What the chips are: "Tags", "Filters", "People to invite". Give it this or{" "}
                <code>aria-labelledby</code>, pointing at a visible label.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The chips." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Chip, ChipGroup } from "beautiful-ui-solid";

const [tags, setTags] = createSignal(["Landing page", "Spring sale", "Newsletter"]);

<ChipGroup aria-label="Tags">
  <For each={tags()}>
    {(tag) => <Chip color="blue" onRemove={() => setTags(tags().filter((t) => t !== tag))}>{tag}</Chip>}
  </For>
</ChipGroup>`}</code>
      </pre>
      <p>
        Other attributes pass through to <code>&lt;beautiful-chip&gt;</code> and{" "}
        <code>&lt;beautiful-chips&gt;</code>: <code>id</code>, <code>class</code>, <code>title</code>,{" "}
        <code>aria-*</code>. A tag field, where you type and each entry becomes a chip, will be built from these with
        Combobox. Chip itself doesn't take text in.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        No APG pattern covers chips. These follow the APG's list semantics, and the removal keys of the mail apps
        people already know. Only the × takes focus, so a row of chips is one Tab stop per chip that can be removed,
        and none for a chip that can't.
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
              <td>Moves to the next or previous chip's ×. A chip without one is skipped.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>
              </td>
              <td>Press the ×: the chip is removed. The browser's own button keys.</td>
            </tr>
            <tr>
              <td>
                <kbd>Delete</kbd>, <kbd>Backspace</kbd>
              </td>
              <td>Remove the chip whose × has focus.</td>
            </tr>
            <tr>
              <td>After a removal</td>
              <td>
                Focus moves to the next chip's ×, or the previous one when the last chip went. With none left, the group
                takes focus and is read by its name.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                A group reads as a list with its name and its count: "Tags, list, 4 items". Each chip reads as its words.
                Its × reads "Remove Spring sale, button". The count drops as chips go, and focus landing on the next ×
                says where you are.
              </td>
            </tr>
            <tr>
              <td>Pointer</td>
              <td>
                The × darkens to a circle under the pointer. Clicking the chip outside the × does nothing: it isn't a
                button.
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
              <td>Rest</td>
              <td>The color's soft fill, its text, and a hairline ring in the color, so a pale chip shows on a white panel.</td>
            </tr>
            <tr>
              <td>× hover</td>
              <td>A circle of the chip's text color at 14% behind the ×, in 120ms. Only with a hovering pointer.</td>
            </tr>
            <tr>
              <td>× pressed</td>
              <td>The circle at 22%, and the × shrinks a little, as a Button does.</td>
            </tr>
            <tr>
              <td>× focus</td>
              <td>The kit's 2px accent ring, round, 2px out from the circle. Keyboard focus only, and it glides there.</td>
            </tr>
            <tr>
              <td>Long label</td>
              <td>Wraps onto a second line inside the chip, which keeps its round ends. Never cut off with an ellipsis.</td>
            </tr>
            <tr>
              <td>Can't be removed</td>
              <td>No ×. There is no disabled ×: a chip you can't remove just doesn't offer to.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> The fill is Badge's wash of the color (12% of the hue, 15% in dark
        mode) laid on a control's fill, with Badge's ink on it: the 800 of the hue in light mode and the 300 in dark,
        at 4.5:1 or more. In classic the control's fill is the raised surface, so the chip is opaque. On glass it is the
        frosted pane a secondary Button is, so the words hold 4.5:1 over the bright stage, where a see-through badge
        would not.
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
              <td><code>--tint</code>, <code>--tint-ink</code>, <code>--tint-edge</code></td>
              <td>the hue, its text and its hairline, set by <code>data-color</code> (<code>tints.css</code>, shared with Badge)</td>
            </tr>
            <tr>
              <td><code>--control-fill</code></td>
              <td>what the wash is laid on: the raised surface in classic, a frosted pane on glass</td>
            </tr>
            <tr>
              <td><code>--chip-height</code></td>
              <td>new: 1.75rem (28px), 2.25rem (36px) for a finger. The ends are rounded by half of it.</td>
            </tr>
            <tr><td><code>--text-sm</code>, <code>--leading-sm</code></td><td>the words: 14px on 20px, weight 500</td></tr>
            <tr><td><code>--space-1</code>, <code>--space-2</code>, <code>--space-3</code></td><td>icon gap, gap between chips, padding at the ends</td></tr>
            <tr><td><code>--control-icon</code></td><td>the icon and the ×'s box</td></tr>
            <tr><td><code>--control-blur</code>, <code>--control-saturate</code></td><td>the frost behind a chip on glass</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        A custom element name with no script is an ordinary element in every browser, so the static markup works with
        no JS. CSS masks, <code>color-mix()</code>, <code>light-dark()</code> and <code>:has()</code> are in every
        current browser. The removal keys and the focus move are the Solid component's.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's Chip for a small rounded label with a remove button. The removal keys and the focus move after a
        removal come from the recipient fields of mail apps, since no APG pattern covers them. WCAG 2.5.8 for the ×'s
        24px target and 1.4.1 for never meaning something by color alone.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode at the top.</p>
      <Example title="Removing, with the keys" name="chip/removing" />
      <Example title="Tags" name="chip/tags" />
      <Example title="Filters with icons" name="chip/filters" />
      <Example title="Every color" name="chip/colors" />
      <Example title="On glass and in a dialog" name="chip/glass" />
    </article>
  );
}
