import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Field, Label, Select } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";
import { renderHarness } from "./examples.tsx";

// After the docs examples, the blocks for the tests that pick, send and reset.

/** A select whose value the page sets, to check a value from the parent moves the select. */
function Controlled() {
  const [range, setRange] = createSignal("30");
  return (
    <section data-controlled>
      <Select name="range" aria-label="Date range" value={range()} onChange={(event) => setRange(event.currentTarget.value)}>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </Select>
      <output>{range()}</output>
      <button type="button" onClick={() => setRange("90")}>
        Show 90 days
      </button>
    </section>
  );
}

/** A select whose options the page loads after it's on the page, with its value set first. */
function Late() {
  const [plans, setPlans] = createSignal<string[]>([]);
  return (
    <form data-late>
      <Select name="plan" aria-label="Loaded plan" value="pro" placeholder="Choose a plan">
        <For each={plans()}>{(plan) => <option value={plan}>{plan}</option>}</For>
      </Select>
      <button type="button" onClick={() => setPlans(["starter", "pro", "business"])}>
        Load plans
      </button>
      <button type="reset">Reset</button>
    </form>
  );
}

renderHarness("select", () => (
  <>
    <form data-validating>
      <Field id="v-plan">
        <Label>Plan</Label>
        <Select name="plan" placeholder="Choose a plan" required>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </Select>
      </Field>
      <Field id="v-country">
        <Label>Country</Label>
        <Select name="country" value="ca">
          <option value="us">United States</option>
          <option value="ca">Canada</option>
          <option value="gb">United Kingdom</option>
        </Select>
      </Field>
      <button>Save</button>
      <button type="reset">Start over</button>
    </form>
    <Controlled />
    <Late />
    <select multiple aria-label="Several sites">
      <option>Spring launch</option>
      <option>Docs</option>
    </select>
  </>
));
