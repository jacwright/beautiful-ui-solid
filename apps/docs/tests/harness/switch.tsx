import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Field, Label, Switch } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

const [heard, setHeard] = createSignal("");
const [on, setOn] = createSignal(true);
const [loaded, setLoaded] = createSignal(false);

renderHarness("switch", () => (
  <section data-changing>
    <form id="settings-form">
      <Field id="indexed">
        <Label>Show in search results</Label>
        <Switch name="indexed" value="yes" checked />
      </Field>
      <Field id="comments">
        <Label>Comments on posts</Label>
        <Switch name="comments" onChange={(checked, event) => setHeard(`${checked} ${event.type}`)} />
      </Field>
      <Field id="controlled">
        <Label>Controlled</Label>
        <Switch name="controlled" checked={on()} onChange={setOn} />
      </Field>
      <Field id="saved">
        <Label>Saved setting</Label>
        <Switch name="saved" checked={loaded()} onChange={setLoaded} />
      </Field>
      <button type="reset">Reset</button>
    </form>
    <button id="turn-off" type="button" onClick={() => setOn(false)}>
      Turn it off
    </button>
    <button id="load-saved" type="button" onClick={() => setLoaded(true)}>
      Load saved
    </button>
    <Switch aria-label="Outside a field" />
    <Switch aria-label="Needs a look" aria-invalid="true" checked />
    <p id="heard">{heard()}</p>
    <p id="on">{String(on())}</p>
  </section>
));
