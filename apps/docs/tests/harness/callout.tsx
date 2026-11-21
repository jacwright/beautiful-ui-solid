import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Callout, CalloutTitle } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then blocks for the tests of what they don't show: dismissing and live.

function Dismissible() {
  const [shown, setShown] = createSignal(true);
  return (
    <beautiful-example data-example="dismissing">
      <button type="button" id="before">Before</button>
      <Show when={shown()}>
        <Callout id="dismissible" onDismiss={() => setShown(false)}>
          <CalloutTitle>Your site has a new home page editor</CalloutTitle>
          <p>Drag sections to reorder them.</p>
        </Callout>
      </Show>
      <button type="button" id="after">After</button>
      <Callout id="kept" tone="neutral" dismissLabel="Hide tip" onDismiss={() => {}}>
        <p>A page that keeps the callout gets it back.</p>
      </Callout>
      <Callout
        id="throws"
        tone="neutral"
        dismissLabel="Hide broken tip"
        onDismiss={() => {
          throw new Error("A handler that fails.");
        }}
      >
        <p>A handler that throws still lets the callout come back.</p>
      </Callout>
    </beautiful-example>
  );
}

function Live() {
  const [shown, setShown] = createSignal(false);
  return (
    <beautiful-example data-example="live">
      <button type="button" id="show-live" onClick={() => setShown(true)}>
        Show
      </button>
      <Show when={shown()}>
        <Callout id="live-danger" tone="danger" live>
          <p>2 pages didn't build.</p>
        </Callout>
        <Callout id="live-success" tone="success" live>
          <p>Spring launch is live.</p>
        </Callout>
        <Callout id="live-role" live role="log" class="custom" aria-label="Build">
          <p>Building.</p>
        </Callout>
      </Show>
    </beautiful-example>
  );
}

renderHarness("callout", () => (
  <>
    <Dismissible />
    <Live />
  </>
));
