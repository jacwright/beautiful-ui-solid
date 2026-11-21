import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Field, Label, Meter, Text } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The examples in examples/meter/, then a block for the tests that change its value and its odd props.

const [used, setUsed] = createSignal(2);

renderHarness("meter", () => (
  <beautiful-example data-example="live">
    <Field id="live-storage">
      <Label>Used</Label>
      <Meter value={used()} max={5} low={4} high={4.75} optimum={0} />
    </Field>
    <Field id="hidden-value">
      <Label>Hidden value</Label>
      <Meter value={30} hideValue />
    </Field>
    <Meter value={3} max={0} aria-label="Odd max" />
    <Meter value={Number.NaN} aria-label="Odd value" />
    <Meter value={3} max={10} valueText="" aria-label="Empty words" />
    <Meter value={150} min={50} max={250} aria-label="Offset range" />
    <Meter value={150} min={120} aria-label="High min" />
    <Meter value={2} aria-label="Described" aria-describedby="described-note" />
    <p id="described-note">A note about it.</p>
    <Text>
      <button id="to-four" type="button" onClick={() => setUsed(4.2)}>
        Four
      </button>
      <button id="to-full" type="button" onClick={() => setUsed(5)}>
        Full
      </button>
    </Text>
  </beautiful-example>
));
