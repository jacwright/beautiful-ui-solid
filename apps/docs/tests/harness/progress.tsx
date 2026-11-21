import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { ErrorMessage, Field, Label, Progress, Text } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";
import { renderHarness } from "./examples.tsx";

// After the docs examples, a bar whose value changes and the edge cases, which no example shows.

const [sent, setSent] = createSignal<number>();
const [failed, setFailed] = createSignal(false);

renderHarness("progress", () => (
  <beautiful-example data-example="live">
    <Field id="live-upload">
      <Label>Uploading</Label>
      <Progress value={sent()} max={10} />
      <Show when={failed()}>
        <ErrorMessage>It stopped.</ErrorMessage>
      </Show>
    </Field>
    <Field id="hidden-value">
      <Label>Hidden value</Label>
      <Progress value={30} hideValue />
    </Field>
    <Progress value={3} max={0} aria-label="Odd max" />
    <Progress value={Number.NaN} aria-label="Odd value" />
    <Progress value={3} max={10} valueText="" aria-label="Empty words" />
    <Text>
      <button id="start" type="button" onClick={() => setSent(0)}>
        Start
      </button>
      <button id="to-four" type="button" onClick={() => setSent(4)}>
        Four
      </button>
      <button id="to-wait" type="button" onClick={() => setSent(undefined)}>
        Wait
      </button>
      <button id="fail" type="button" onClick={() => setFailed(true)}>
        Fail
      </button>
    </Text>
  </beautiful-example>
));
