import { Example, PropsTable } from "../spec.tsx";

export default function CalloutPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Callout</h1>
      <p class="lede">A notice in the page's flow: something to know about what's on the screen, read in passing.</p>
      <Example title="Callout" hero name="callout/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It sits in the page with the content it's about, and never covers it or takes focus. That is what sets it
          apart from <a href="/alert">Alert</a>, which stops the page for a decision, and from Toast, which floats in
          for a moment and goes.
        </li>
        <li>
          It is a <code>&lt;beautiful-callout role="note"&gt;</code>, so a screen reader reads it where it sits, as a
          note. No element fits: an <code>&lt;aside&gt;</code> is a landmark of the page, so every callout would be
          listed with the page's regions.
        </li>
        <li>
          Five tones: <strong>info</strong>, the default, <strong>success</strong>, <strong>warning</strong>,{" "}
          <strong>danger</strong> and <strong>neutral</strong>. The tone tints the fill and the edge, and picks the
          icon: a circled i, a circled tick, a triangle, a circled ! and a note. The text stays the text color in every tone, so it
          keeps its contrast, and the shape of the icon tells the tones apart without the color.
        </li>
        <li>
          A <strong>title</strong> on the first line, in <code>&lt;strong&gt;</code>, says what the notice is in
          words. The icon is decorative, so the title is where a screen reader hears "warning": "Your card expires
          on 30 November". A short callout can be one line of text with no title.
        </li>
        <li>
          Under the title, any text: paragraphs, a list, code, links. Under that, an optional row of{" "}
          <strong>actions</strong>, which are Buttons.
        </li>
        <li>
          <code>onDismiss</code> adds a × at the end of the first line. It fades the callout out, then calls{" "}
          <code>onDismiss</code> for the page to remove it, and to remember that it was dismissed if it should stay
          gone. If the × had focus, focus moves to the next thing after the callout, not to the top of the page.
        </li>
        <li>
          <code>live</code> is for a callout that appears after something the person did, such as a failed publish.
          It is read out as it arrives: at once for warning and danger (<code>role="alert"</code>), after what's
          being read for the others (<code>role="status"</code>). It fades in and drops into place as it arrives. A
          callout that is on the page from the start is still, and isn't read out until the reader gets to it.
        </li>
        <li>
          On glass it is a pane of tinted glass, frosted as densely as a secondary Button and lit the same way, so
          its text holds 4.5:1 over anything. In classic it lies flat on the page with no shadow.
        </li>
        <li>
          The markup works with no JS, for static pages: everything but the × and <code>live</code> is CSS.
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
              <td>
                <code>Callout</code>
              </td>
              <td>
                <code>&lt;beautiful-callout role="note"&gt;</code>
              </td>
              <td>
                The notice. <code>data-tone</code> carries <code>tone</code>, and is left out at info. Its{" "}
                <code>::before</code> draws the icon, so the icon adds no node.
              </td>
            </tr>
            <tr>
              <td>
                <code>CalloutTitle</code>
              </td>
              <td>
                <code>&lt;strong&gt;</code>
              </td>
              <td>What the notice is, in a few words. Optional.</td>
            </tr>
            <tr>
              <td>children</td>
              <td>
                <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code>, anything
              </td>
              <td>
                The text. Use plain <code>&lt;p&gt;</code>s or <a href="/text">Text</a>: a callout sets its own
                size, 14px.
              </td>
            </tr>
            <tr>
              <td>
                <code>CalloutActions</code>
              </td>
              <td>
                <code>&lt;beautiful-callout-actions&gt;</code>
              </td>
              <td>A row of Buttons under the text. It wraps on a narrow screen.</td>
            </tr>
            <tr>
              <td>The ×</td>
              <td>
                <code>&lt;button data-dismiss data-variant="tertiary"&gt;</code>
              </td>
              <td>
                Drawn by <code>onDismiss</code>, named "Dismiss" for screen readers. It is as big as any Button, and
                reaches into the padding so it doesn't push the first line down.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "tone",
            type: '"info" | "success" | "warning" | "danger" | "neutral"',
            default: '"info"',
            description: "The tint of the fill and the edge, and the icon.",
          },
          {
            name: "live",
            type: "boolean",
            default: "false",
            description: (
              <>
                Read out as it appears: <code>role="alert"</code> for warning and danger, <code>role="status"</code>{" "}
                for the others. Set it on a callout the page adds after an action, not on one that's there from the
                start.
              </>
            ),
          },
          {
            name: "onDismiss",
            type: "() => void | Promise<unknown>",
            default: "none",
            description: (
              <>
                Draws the ×. Called once the callout has faded out. Remove it then, or when the promise it returns
                settles, and keep it removed if it should stay gone. A callout the page keeps fades back in.
              </>
            ),
          },
          { name: "dismissLabel", type: "string", default: '"Dismiss"', description: "The ×'s name for screen readers." },
          { name: "children", type: "JSX.Element", description: "CalloutTitle, the text, and CalloutActions." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Button, Callout, CalloutActions, CalloutTitle } from "beautiful-ui-solid";

<Callout tone="warning">
  <CalloutTitle>Your card expires on 30 November</CalloutTitle>
  <p>Update it before then, so your sites stay online.</p>
  <CalloutActions>
    <Button href="/billing">Update card</Button>
  </CalloutActions>
</Callout>`}</code>
      </pre>
      <p>
        Other attributes pass through to <code>&lt;beautiful-callout&gt;</code>: <code>id</code>, <code>class</code>,{" "}
        <code>aria-*</code>, and <code>role</code>, which wins over the one <code>live</code> picks. A page can draw
        its own icon by setting <code>--callout-icon</code> to an SVG <code>url()</code>, as a mask.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        There is no APG pattern for a callout. It is a note (<code>role="note"</code>), or a live region (
        <code>role="status"</code> or <code>role="alert"</code>) when <code>live</code> is set.
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
                <kbd>Tab</kbd>
              </td>
              <td>
                Passes over the callout itself, and stops on the links and Buttons in it, then on the ×, in that
                order.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>, <kbd>Space</kbd> on the ×
              </td>
              <td>
                Fades the callout out and calls <code>onDismiss</code>. Focus moves to the next focusable thing after
                the callout, or the one before it when nothing follows, inside its dialog or popover when it is in one. If the person has moved focus elsewhere while it faded, focus stays there.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read it in the page's order as a note, title first. The icon is drawn by CSS, so it is never read.
              </td>
            </tr>
            <tr>
              <td>
                <code>live</code>
              </td>
              <td>
                The callout is read out as the page adds it: warning and danger at once, as an alert, and the others
                after what's being read, as a status. Add the whole callout at once, as <code>&lt;Show&gt;</code>{" "}
                does, so it's read once and in full. The region goes in empty and its words follow a frame later,
                because a screen reader can miss a live region that arrives already full.
              </td>
            </tr>
            <tr>
              <td>Zoom and text size</td>
              <td>The text wraps at 400% zoom with no sideways scroll, and a long word or path breaks.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Tone:</strong> info is the accent blue, success green, warning amber, danger red, and neutral grey.
          The fill is a hint of the tone over the pane: in light mode 3% over the raised fill in classic and 4% over the frosted control fill on glass, and in dark mode 8% and 10%. A pale tint over white reads much stronger than one over near-black, so light takes less, and both modes look alike: a plain pane whose edge and icon carry the tone.
          The edge is 30% of the tone over the control's edge.
        </li>
        <li>
          <strong>Mode:</strong> each tone is a light-dark pair, deeper on light and paler on dark. On glass the
          tones are a step further from the glass, as the accent's and danger's are, because the page shows through.
        </li>
        <li>
          <strong>Arriving:</strong> a <code>live</code> callout fades in and drops 8px into place over 320ms.
        </li>
        <li>
          <strong>Dismissed:</strong> it fades out and rises 4px over 180ms, then the page removes it. Under reduced
          motion both only fade.
        </li>
        <li>
          <strong>Reduced transparency:</strong> glass falls back to classic's flat callout.
        </li>
      </ul>

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
              <td>
                <code>--color-success</code>, <code>--color-warning</code>
              </td>
              <td>
                Green and amber, 4.5:1 on the canvas in both modes so text may use them too. Classic #15803d / #4ade80
                and #b45309 / #fbbf24, glass #166534 / #86efac and #92400e / #fcd34d. New.
              </td>
            </tr>
            <tr>
              <td>
                <code>--callout-tint-light</code>, <code>--callout-tint-dark</code>
              </td>
              <td>How much of the tone is in the fill: 3% and 8% in classic, 4% and 10% on glass. New.</td>
            </tr>
            <tr>
              <td>
                <code>--callout-edge</code>
              </td>
              <td>How much of the tone is in the edge: 30%. New.</td>
            </tr>
            <tr>
              <td>
                <code>--callout-shadow</code>
              </td>
              <td>None in classic, the control's lift on glass. New.</td>
            </tr>
            <tr>
              <td>
                <code>--control-fill</code>, <code>--control-edge</code>, <code>--control-blur</code>,{" "}
                <code>--control-sheen</code>, <code>--control-rim</code>
              </td>
              <td>The pane under the tint: a secondary Button's.</td>
            </tr>
            <tr>
              <td>
                <code>--space-3</code>, <code>--space-4</code>, <code>--radius-lg</code>
              </td>
              <td>12px from the top and bottom, 16px from the sides, 12px between icon and text. Corners 12px.</td>
            </tr>
            <tr>
              <td>
                <code>--text-sm</code>, <code>--leading-sm</code>
              </td>
              <td>14px text on 20px lines. The icon is 20px, one line tall, so it sits level with the title.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        The callout is a grid with a masked <code>::before</code>, in every current browser. The arrival uses{" "}
        <code>@starting-style</code>: a browser without it shows a live callout at once, with no fade.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's Callout for the note role, the icon beside the text and a title above it, and a tone that tints
        the fill and the edge. Tailwind Plus's inline alerts for actions under the text and a × to dismiss. Its
        colored text isn't taken: here the words stay the text color, so every tone reads alike.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Tones" name="callout/tones" />
      <Example title="With actions" name="callout/actions" />
      <Example title="One line" name="callout/brief" />
      <Example title="On glass" name="callout/glass" />
      <Example title="In a dialog" name="callout/dialog" />
      <Example title="Dismissible" name="callout/dismiss" />
      <Example title="Read out as it appears" name="callout/live" />
    </article>
  );
}
