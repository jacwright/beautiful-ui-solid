import { Example, PropsTable } from "../spec.tsx";

export default function LinkPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Link</h1>
      <p class="lede">Text that takes you somewhere else: another page, a spot on this one, or another site.</p>
      <Example title="Link" hero name="link/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a native <code>&lt;a href&gt;</code>. The browser does the rest: Enter follows it, a middle click or
          Cmd-click opens it in a new tab, a right click offers to copy it, and screen readers list it with the page's
          links.
        </li>
        <li>
          It is in the accent color and always underlined, so it never depends on color alone to be found. The
          underline sits at 40% of the link's color, a little below the letters, and skips their descenders. On hover
          and press it turns solid.
        </li>
        <li>
          <code>color="neutral"</code> takes the color of the text around it, for a link that shouldn't pull the eye:
          a footnote, a timestamp's "See every version", a muted hint. The underline is what marks it.
        </li>
        <li>
          It takes the size of where it sits, as Text does. The same Link works inside a sentence, on a line of its
          own, in small print and in a dialog.
        </li>
        <li>
          A link with <code>target="_blank"</code> gets a small arrow after its words, and screen readers hear "opens
          in a new tab". Both come from CSS, so there is no extra element and nothing to remember.
        </li>
        <li>
          Its corners are rounded 3px (<code>--radius-xs</code>), so the focus ring around it is too, and the moving
          focus ring turns smoothly from a button's corners into a link's. A link that wraps keeps that on each line.
        </li>
        <li>
          The CSS styles every <code>&lt;a href&gt;</code>, so a static page gets the look with no JS. It skips an{" "}
          <code>&lt;a&gt;</code> with no <code>href</code>, which isn't a link, and a link styled as a Button (
          <code>data-button</code>). Every rule is wrapped in <code>:where()</code>, so its specificity is 0, and a
          Navbar or Sidebar restyles its links with any selector.
        </li>
      </ul>
      <p>
        A link that looks like a button is Button with an <code>href</code>. Use a Link to go somewhere and a Button to
        do something: "Publish" is a button even when it ends on a new page.
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
              <td><code>Link</code></td>
              <td><code>&lt;a href&gt;</code></td>
              <td>
                The link. <code>data-color</code> carries the prop, and is left out for the default accent.
              </td>
            </tr>
            <tr>
              <td>Underline</td>
              <td>the text's own decoration</td>
              <td>1px (thicker in large text), 0.2em below the baseline, at 40% of the link's color. Solid on hover.</td>
            </tr>
            <tr>
              <td>New-tab arrow</td>
              <td><code>::after</code></td>
              <td>
                Only with <code>target="_blank"</code>. An arrow drawn with a CSS mask in the link's color, 0.75em, with
                alt text for screen readers. It sits outside the underline, and never wraps onto a line away from the last word.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "href",
            type: "string",
            description: "Where it goes. Required: without one it isn't a link, and it isn't styled as one.",
          },
          {
            name: "color",
            type: '"accent" | "neutral"',
            default: '"accent"',
            description: "Neutral takes the color of the text around it, and keeps the underline.",
          },
          {
            name: "target",
            type: "string",
            default: "none",
            description: (
              <>
                <code>"_blank"</code> opens a new tab and shows the arrow. The browser adds{" "}
                <code>rel="noopener"</code> on its own, so the page it opens can't reach back into ours.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The words. They say where it goes, not \"click here\"." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Link, Text } from "beautiful-ui-solid";

<Text>
  Your site is live. <Link href="/sites/spring-launch/preview">Open the preview</Link>
</Text>
<Text size="sm" tone="muted">
  Published 2 hours ago. <Link href="/versions" color="neutral">See every version</Link>
</Text>`}</code>
      </pre>
      <p>
        Other attributes pass through to the <code>&lt;a&gt;</code>: <code>id</code>, <code>class</code>,{" "}
        <code>download</code>, <code>rel</code>, <code>aria-*</code>, and event handlers. Solid Router follows a plain{" "}
        <code>&lt;a&gt;</code> on its own, so Link needs no router version: an app's links move between its pages
        without a reload.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        From the APG Link pattern. A native <code>&lt;a href&gt;</code> meets all of it, so Link adds no script.
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
              <td>Moves focus to the link and on, in the order of the page. The focus ring shows.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>
                Follows the link. Space doesn't: it scrolls the page, as on every link. That's one way a link and a
                button differ.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Shift</kbd>+<kbd>F10</kbd> or the menu key
              </td>
              <td>The browser's menu for links: open in a new tab, copy the address.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read "link" and its words, list it with the page's links, and say "visited" when it is. With{" "}
                <code>target="_blank"</code>, the name ends "(opens in a new tab)".
              </td>
            </tr>
            <tr>
              <td>Touch</td>
              <td>
                A link is as tall as its words. WCAG's 24px target size makes an exception for links in text. Links
                that stand in a list, as in a Navbar or Sidebar, get a full-size target from that component.
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
              <td>The accent color (or the text's, for neutral), underlined at 40%.</td>
            </tr>
            <tr>
              <td>Hover and press</td>
              <td>The underline turns solid in 120ms. Nothing else moves, so the words never shift.</td>
            </tr>
            <tr>
              <td>Focus</td>
              <td>The kit's 2px accent ring, 2px out, with 3px corners. Keyboard focus only.</td>
            </tr>
            <tr>
              <td>Visited</td>
              <td>
                Looks the same. In an app, a link you've visited is the same place you go every day, so a second color
                says nothing. Screen readers still announce it.
              </td>
            </tr>
            <tr>
              <td>Wrapped onto two lines</td>
              <td>Each line keeps its own rounded corners, and the focus ring draws around each line.</td>
            </tr>
            <tr>
              <td>No <code>href</code></td>
              <td>
                Not a link: plain text that can't be focused. A link you can't follow yet should be text until it can.
                There is no disabled link.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> The accent is blue 600 on light and blue 400 on dark. On glass it is a step
        further from the glass, as with Button's colored text: blue 700 on light and blue 300 on dark, so it holds
        4.5:1 over whatever shows through. Otherwise classic and glass look the same: a link is text.
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
            <tr><td><code>--color-accent</code></td><td>the link's color. Glass sets a deeper one.</td></tr>
            <tr><td><code>--radius-xs</code></td><td>0.1875rem (3px), from the moving focus ring: the least rounding on anything focusable.</td></tr>
            <tr><td><code>--motion-quick</code>, <code>--ease-out</code></td><td>the underline's change on hover</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        <code>&lt;a href&gt;</code> and its keys work everywhere. <code>text-underline-offset</code>,{" "}
        <code>color-mix()</code>, <code>:any-link</code> and CSS masks are in every current browser. The arrow's alt
        text (<code>content: "" / "…"</code>) is in Chrome, Safari 17.4 and Firefox 128. An older browser shows the
        arrow and says nothing for it.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's Anchor for one link style on every <code>&lt;a&gt;</code> at zero specificity, an underline
        offset from the text, and a solid underline on hover. Catalyst's TextLink for a link that takes the text's
        color, underlined at a fraction of it, which is our neutral. The APG Link pattern for the keys, and WCAG 1.4.1
        for never marking a link by color alone.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component live, then its code, then the markup it renders. Switch the theme and mode
        with T and M, or the toggles at the bottom right.
      </p>
      <Example title="In text" name="link/text" />
      <Example title="Neutral" name="link/neutral" />
      <Example title="On its own" name="link/alone" />
      <Example title="Opens a new tab" name="link/new-tab" />
      <Example title="In a dialog" name="link/glass" />
    </article>
  );
}
