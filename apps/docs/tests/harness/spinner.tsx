import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Spinner } from "beautiful-ui-solid";
import { render } from "@solidjs/web";
import { createSignal, Show } from "solid-js";
import { renderHarness } from "./examples.tsx";

// After the docs examples, the blocks for the tests of the wait and of the props.

const [loading, setLoading] = createSignal(false);

/** Renders a Spinner into a box that isn't on the page yet, and adds the box a moment later. */
function addDetached() {
  const box = document.createElement("beautiful-example");
  render(() => <Spinner label="Loading the report" />, box);
  setTimeout(() => document.getElementById("detached")!.append(box), 50);
}

renderHarness("spinner", () => (
  <>
    <beautiful-example data-example="started">
      <button type="button" id="start" onClick={() => setLoading((on) => !on)}>
        Preview
      </button>
      <beautiful-example id="started">
        <Show when={loading()}>
          <Spinner label="Loading the preview" />
        </Show>
      </beautiful-example>
    </beautiful-example>
    <beautiful-example data-example="attributes">
      <Spinner id="at-once" delay={false} size="sm" color="neutral" label="Publishing" />
      <Spinner id="passed" class="custom" data-region="entries" />
      <Spinner id="falsy" label="Saving">
        {false}
        {null}
      </Spinner>
      <button type="button" id="detached-add" onClick={addDetached}>
        Add a report
      </button>
      <beautiful-example id="detached" />
      <beautiful-example id="closed-panel" hidden>
        <Spinner label="Loading the tab" />
      </beautiful-example>
    </beautiful-example>
  </>
));
