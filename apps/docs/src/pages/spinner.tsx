import { Button, Spinner, Text } from "beautiful-ui-solid";
import { createSignal, onCleanup, Show } from "solid-js";
import { Example, PropsTable } from "../spec.tsx";

export default function SpinnerPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Spinner</h1>
      <p class="lede">Something is loading, and we can't say how long it will take.</p>
      <Example title="Spinner" hero name="spinner/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          A ring with an arc that turns, drawn in the color of the text it sits in, so it fits a line of text, a
          Button, a muted hint or a dialog with nothing to set. <code>color="accent"</code> draws it in the accent.
        </li>
        <li>
          It is a <code>role="status"</code> region, so a screen reader says its words when it appears, without
          moving focus. The words are "Loading" unless you say more, such as "Loading the entries". They are read and
          not shown, unless you pass them as children: then they show beside the ring.
        </li>
        <li>
          It waits 400ms before it shows, then fades in. Most loads finish sooner, and a spinner that flashes on and
          off for a moment reads as a glitch. Its words wait for the fade too, so a screen reader doesn't say "Loading" for a load
          that's already done. <code>delay={"{false}"}</code> shows it at once.
        </li>
        <li>
          Three sizes. <code>sm</code>, the default, is the size of the text around it. <code>md</code> is for a card
          or a panel, and <code>lg</code> for a whole page. At <code>md</code> and <code>lg</code>, shown words sit
          under the ring, centered.
        </li>
        <li>
          Under reduced motion it stops turning. The whole ring breathes in place instead, a slow fade, so it still
          reads as working.
        </li>
        <li>
          It is one element. The track and the arc are its <code>::before</code> and <code>::after</code>, drawn with
          CSS masks, so the static markup works with no JS: the CSS turns it.
        </li>
      </ul>
      <p>
        Use a Spinner when the wait has no measure. When it does, such as an upload's bytes, Progress shows how far
        along it is. Put the spinner where the content will be, at the size of the space it fills. Never inside an
        element marked <code>aria-busy="true"</code>: screen readers hold back everything a busy region says, the
        spinner's words too, until it isn't busy, and by then the spinner is gone.
      </p>

      <h2>Try the wait</h2>
      <p>
        Each button loads for as long as it says. The quick one finishes inside the wait, so no spinner ever shows.
      </p>
      <TryTheWait />

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
              <td><code>Spinner</code></td>
              <td><code>&lt;beautiful-spinner&gt;</code></td>
              <td>
                The region and its words, with <code>role="status"</code>. <code>data-size</code>, <code>data-color</code>, <code>data-label</code> and{" "}
                <code>data-delay</code> carry the props, and each is left out at its default.
              </td>
            </tr>
            <tr>
              <td>Track</td>
              <td><code>::before</code></td>
              <td>The whole ring, at 20% of the spinner's color, so the arc has a path to run on.</td>
            </tr>
            <tr>
              <td>Arc</td>
              <td><code>::after</code></td>
              <td>A little over a quarter of the ring, with round ends, at full color. One turn every 800ms.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        There is no element of its own for the words. When they are hidden, they are pushed out of the spinner's box
        and clipped, which keeps them in the accessibility tree.
      </p>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "label",
            type: "string",
            default: '"Loading"',
            description: "The words a screen reader hears. Say what is loading when the page has more than one.",
          },
          {
            name: "children",
            type: "JSX.Element",
            default: "none",
            description: "Words to show beside the ring. They take the place of label, and are read the same way.",
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg"',
            default: '"sm"',
            description: "sm is the size of the text around it (1em), md 32px, and lg 48px.",
          },
          {
            name: "color",
            type: '"neutral" | "accent"',
            default: '"neutral"',
            description: "Neutral is the color of the text it sits in. Shown words stay in the text color either way.",
          },
          {
            name: "delay",
            type: "boolean",
            default: "true",
            description: "Waits 400ms before it shows. false shows it at once, for a wait you know is long.",
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Spinner, Text } from "beautiful-ui-solid";

<section aria-label="Form entries">
  <Show when={entries()} fallback={<Spinner size="md">Loading the entries</Spinner>}>
    …
  </Show>
</section>

<Text size="sm" tone="muted">
  <Spinner>Saving your changes</Spinner>
</Text>`}</code>
      </pre>
      <p>
        Other attributes pass through to the element: <code>id</code>, <code>class</code>, <code>aria-*</code>, and
        event handlers.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        APG has no spinner pattern. It follows ARIA's <code>status</code> role, the live region for advice that isn't
        urgent, and WCAG 4.1.3, status messages heard without focus.
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
              <td>Passes over it. A spinner isn't something to act on, so it never takes focus.</td>
            </tr>
            <tr>
              <td>It appears</td>
              <td>
                After the wait, its words go into the region, and a screen reader says them once, politely: after
                whatever it is reading now. A region that appears with its words already in is often missed, so the
                component adds them after it.
              </td>
            </tr>
            <tr>
              <td>It goes away</td>
              <td>
                Nothing is said. What loaded speaks for itself where it sits.
              </td>
            </tr>
            <tr>
              <td>Reading the page</td>
              <td>A screen reader reaching it reads its words, such as "Loading the entries".</td>
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
              <td>Waiting</td>
              <td>
                For the first 400ms, nothing shows, and its words, read or shown, aren't in yet. The ring's space is
                held. Shown words come in as it fades in, so a spinner with words gets a line of its own, as in the
                examples.
              </td>
            </tr>
            <tr>
              <td>Turning</td>
              <td>It fades in over 320ms, and the arc turns at one turn every 800ms, at an even speed.</td>
            </tr>
            <tr>
              <td>Reduced motion</td>
              <td>The arc holds still, and the ring fades between 25% and full, once every 1.6s.</td>
            </tr>
            <tr>
              <td>Forced colors</td>
              <td>The ring is drawn in the system's text color.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> It looks the same in classic and glass, and in light and dark: it is drawn in
        the text's color, which each theme and mode already sets to read on its surface. The accent is the theme's, so
        on glass it is the deeper blue Link uses.
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
            <tr><td><code>--spinner-sm</code>, <code>--spinner-md</code>, <code>--spinner-lg</code></td><td>1em, 2rem, 3rem</td></tr>
            <tr><td><code>--motion-spin</code></td><td>800ms, one turn of the arc</td></tr>
            <tr><td><code>--spinner-delay</code></td><td>400ms, the wait before it shows</td></tr>
            <tr><td><code>--motion-enter</code>, <code>--ease-out</code></td><td>its fade in</td></tr>
            <tr><td><code>--space-2</code>, <code>--space-3</code></td><td>the gap to its shown words, beside and under the ring</td></tr>
            <tr><td><code>--color-accent</code></td><td>the accent color</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        CSS masks, the <code>rotate</code> property and <code>role="status"</code> are in every current browser. The
        wait before it shows is a CSS animation delay, so it holds with no JS too.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's spinner for a ring the size of its text (1em), set on its line like an icon and turning at an
        even speed. Ours is its own element with words for screen readers, where theirs draws on anything marked{" "}
        <code>aria-busy</code>. ARIA's <code>status</code> role and WCAG 4.1.3 for how it is heard.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Sizes" name="spinner/sizes" />
      <Example title="With its words" name="spinner/words" />
      <Example title="A panel that is loading" name="spinner/panel" />
      <Example title="Accent" name="spinner/accent" />
      <Example title="In a dialog" name="spinner/glass" />
    </article>
  );
}

/** Two loads, one inside the spinner's wait and one past it, to see the wait for yourself. */
function TryTheWait() {
  const [loading, setLoading] = createSignal<number>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

  function load(ms: number) {
    clearTimeout(timer);
    setLoading(ms);
    timer = setTimeout(() => setLoading(undefined), ms);
  }

  return (
    <beautiful-example-preview>
      <section class="demo-busy" aria-label="Page views">
        <Show when={loading()} fallback={<Text tone="muted">1,284 views this week</Text>}>
          <Text tone="muted">
            <Spinner size="md">Loading the page views</Spinner>
          </Text>
        </Show>
      </section>
      <beautiful-demo-row>
        <Button onClick={() => load(250)}>A quick load (250ms)</Button>
        <Button onClick={() => load(2500)}>A slow load (2.5s)</Button>
      </beautiful-demo-row>
    </beautiful-example-preview>
  );
}
