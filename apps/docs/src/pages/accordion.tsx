import { Example, PropsTable } from "../spec.tsx";

export default function AccordionPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Accordion</h1>
      <p class="lede">A stack of Disclosures where opening one closes the one that was open.</p>
      <Example title="Accordion" hero name="accordion/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a list of native <code>&lt;details&gt;</code> that share a <code>name</code>. The browser keeps one of
          them open at a time: opening one closes the other, and closing the open one leaves them all closed. It works
          with no JS.
        </li>
        <li>
          It suits a short set of answers or sections that each make sense alone: questions on a pricing page, the
          sections of a settings form, the details behind a plan change. One open at a time keeps the screen short, and
          the page under it close.
        </li>
        <li>
          Each item is a Disclosure, with its tint, its turning chevron and its panel that grows and fades. The group
          adds the look of a list: a hairline between items, and each summary across the whole row with its chevron at
          the end, where an eye down the list finds it.
        </li>
        <li>
          The summary's words line up with the panel's and with the text around the group. Its tint reaches out 8px on
          each side and floats clear of the hairlines, so the line never cuts through it.
        </li>
        <li>
          A row is 40px tall, a step taller than a control, and its words are the size of the text around it, so a list of questions reads as rows of text rather than buttons. It is 48px where the
          pointer is a finger.
        </li>
        <li>
          <code>multiple</code> drops the shared name, so several can be open together: the same look, for sections
          someone may want to compare.
        </li>
        <li>
          The Solid component adds the arrow keys from the APG Accordion pattern: Up and Down move between the
          summaries, Home and End go to the first and last. A static page without JS keeps Tab, Enter and Space.
        </li>
      </ul>
      <p>
        One line that shows more is Disclosure. A choice between views that replace each other in place is Tabs. A
        site's sidebar of sections is Sidebar.
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
              <td><code>Accordion</code></td>
              <td><code>&lt;beautiful-accordion&gt;</code></td>
              <td>
                Holds the items, draws the hairlines between them, and gives each the shared name. It handles the arrow
                keys.
              </td>
            </tr>
            <tr>
              <td>Item</td>
              <td>
                <code>Disclosure</code>, a <code>&lt;details name&gt;</code>
              </td>
              <td>
                One question or section. Its summary is the button, and everything after it is the panel. A Disclosure
                inside an Accordion takes the group's name with no prop.
              </td>
            </tr>
            <tr>
              <td>Hairline</td>
              <td>
                <code>border-block-start</code> on each item after the first
              </td>
              <td>
                Divider's hairline: 1px of the text color at 10%. None above the first item or under the last, so the
                group sits in a card, a dialog or a page with no doubled lines.
              </td>
            </tr>
            <tr>
              <td>Chevron</td>
              <td><code>summary::after</code></td>
              <td>Disclosure's, moved to the end of the row.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <p>
        <strong>Accordion</strong>
      </p>
      <PropsTable
        rows={[
          {
            name: "multiple",
            type: "boolean",
            default: "false",
            description: "Lets several items be open together. Without it, opening one closes the one that was open.",
          },
          {
            name: "name",
            type: "string",
            default: "a unique name",
            description: (
              <>
                The name its items share. The browser keeps one open per name across the page, so two accordions need
                two names. Set it only to match markup that already has one.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", default: "none", description: "The items: Disclosures." },
        ]}
      />
      <p>
        <strong>Disclosure</strong>, as an item: <code>summary</code>, <code>open</code> and <code>onToggle</code> as on
        its own page. An item's <code>name</code> comes from the group, and its own <code>name</code> wins.
      </p>
      <pre tabindex="0">
        <code>{`import { Accordion, Disclosure, Text } from "beautiful-ui-solid";

<Accordion>
  <Disclosure summary="Can I use my own domain?">
    <Text tone="muted">Yes. Add it under Domains…</Text>
  </Disclosure>
  <Disclosure summary="What happens if I cancel?" open={fromCancelLink()}>
    <Text tone="muted">Your site stays online…</Text>
  </Disclosure>
</Accordion>

<Accordion multiple>…</Accordion>`}</code>
      </pre>
      <p>
        Other attributes pass through to the <code>&lt;beautiful-accordion&gt;</code>: <code>id</code>,{" "}
        <code>class</code>, <code>aria-*</code>, and event handlers.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the APG Accordion pattern. The native <code>&lt;details&gt;</code> gives each item its button, its expanded
        state and its keys. The Solid component adds the arrow keys, which APG lists as optional.
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
              <td>Moves through the summaries, and into the open panel. A closed panel's contents are skipped.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd>
              </td>
              <td>
                Opens the item, and closes the one that was open. On the open item, closes it. Focus stays on the
                summary.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>↓</kbd>, <kbd>↑</kbd>
              </td>
              <td>
                On a summary, move focus to the next or previous summary, and wrap from the last to the first. Solid
                component only.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Home</kbd>, <kbd>End</kbd>
              </td>
              <td>On a summary, move focus to the first or last summary. Solid component only.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read each summary as a button with "collapsed" or "expanded", as Disclosure's. A closed panel's contents
                aren't read.
              </td>
            </tr>
            <tr>
              <td>Find in page, a link to inside it</td>
              <td>Open that item and close the open one, in Chrome and Edge.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        APG puts each button in a heading. A heading inside a <code>&lt;summary&gt;</code> loses its role, since a
        button's contents are read as its name, so the summaries carry no heading. A page that needs its questions in
        the outline gives the group a heading above it.
      </p>

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
              <td>All closed</td>
              <td>The summaries alone, with hairlines between them and every chevron pointing down.</td>
            </tr>
            <tr>
              <td>One open</td>
              <td>Its chevron points up and its panel shows. The hairline under it moves down with the panel.</td>
            </tr>
            <tr>
              <td>Switching</td>
              <td>
                The open panel shrinks and fades out over 160ms while the new one grows and fades in over 240ms, so the
                rows under them barely move.
              </td>
            </tr>
            <tr>
              <td>Hover, press, focus</td>
              <td>Disclosure's: a 6% tint, 9% on press, and the kit's 2px accent ring around the summary.</td>
            </tr>
            <tr>
              <td>Several open</td>
              <td>
                With <code>multiple</code>, or when markup sets <code>open</code> on more than one: each panel shows.
                Without <code>multiple</code>, the browser keeps only the first.
              </td>
            </tr>
            <tr>
              <td>Reduced motion</td>
              <td>The panels open and close at once and fade. The chevrons flip without turning.</td>
            </tr>
            <tr>
              <td>Disabled</td>
              <td>There is none, as for Disclosure. Leave out an item nobody can open.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> Classic and glass look the same: an accordion is text and hairlines on
        whatever it sits on. The hairline and the tint are shares of the text color, so they suit light and dark and let
        glass show through.
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
              <td><code>--accordion-row</code></td>
              <td>New. 40px, and 48px under a finger: the summary's least height.</td>
            </tr>
            <tr>
              <td><code>--hairline-width</code>, <code>--color-hairline</code></td>
              <td>the line between items, as Divider's</td>
            </tr>
            <tr>
              <td><code>--space-1</code></td>
              <td>the gap between a summary's tint and the hairlines</td>
            </tr>
            <tr>
              <td><code>--space-3</code></td>
              <td>the space under an open panel, before the next hairline</td>
            </tr>
            <tr>
              <td><code>--motion-expand</code>, <code>--motion-collapse</code></td>
              <td>Disclosure's: 240ms and 160ms</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        A shared <code>name</code> on <code>&lt;details&gt;</code> keeps one open in Chrome 120, Safari 17.2 and Firefox
        130. An older browser lets several open, which still works. The panel's growth is Disclosure's, with the same
        support.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's Accordion, which is also <code>&lt;details name&gt;</code>, for the group's hairlines and the
        chevron at the end of the row. The APG Accordion pattern for the keys. Headless UI and Catalyst have no
        Accordion.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Questions" name="accordion/questions" />
      <Example title="Sections of a settings form" name="accordion/settings" />
      <Example title="Several open together" name="accordion/together" />
      <Example title="In a dialog" name="accordion/glass" />
    </article>
  );
}
