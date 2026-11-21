import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Field, Label, Listbox, ListboxOption } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The examples in examples/listbox/, then a form that sends, checks and resets its lists, and logs
// what changed.

function FormExample() {
  const [log, setLog] = createSignal<string[]>([]);
  const note = (entry: string) => setLog((all) => [...all, entry]);
  const [topics, setTopics] = createSignal<string[]>(["payments"]);
  return (
    <beautiful-example data-example="form">
      <p id="log">{log().join(" | ")}</p>
      <form
        id="form"
        class="demo-form"
        onSubmit={(event) => {
          event.preventDefault();
          note(`sent ${new URLSearchParams(new FormData(event.currentTarget) as never).toString()}`);
        }}
      >
        <Field id="plan">
          <Label>Plan</Label>
          <Listbox name="plan" required placeholder="Pick a plan" onChange={(value) => note(`plan ${value}`)}>
            <ListboxOption value="hobby">Hobby</ListboxOption>
            <ListboxOption value="pro">Pro</ListboxOption>
            <ListboxOption value="team">Team</ListboxOption>
          </Listbox>
        </Field>
        <Field id="region">
          <Label>Region</Label>
          <Listbox name="region" defaultValue="eu" onChange={(value) => note(`region ${value}`)}>
            <ListboxOption value="us">US</ListboxOption>
            <ListboxOption value="eu">Europe</ListboxOption>
          </Listbox>
        </Field>
        <Field id="topics">
          <Label>Topics</Label>
          <Listbox
            name="topics"
            multiple
            value={topics()}
            onChange={(value) => {
              setTopics(value);
              note(`topics ${value.join(",")}`);
            }}
          >
            <ListboxOption value="payments">Payments</ListboxOption>
            <ListboxOption value="refunds">Refunds</ListboxOption>
            <ListboxOption value="disputes">Disputes</ListboxOption>
          </Listbox>
        </Field>
        <footer>
          <Button type="reset">Reset</Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </footer>
      </form>
    </beautiful-example>
  );
}

renderHarness("listbox", () => <FormExample />);
