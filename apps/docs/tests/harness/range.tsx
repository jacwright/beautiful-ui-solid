import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Field, Label, Range } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// After the docs examples, the blocks that test what no example shows.

const percent = (v: number) => `${v}%`;
const days = ["7 days", "30 days", "90 days", "1 year"];
const [heard, setHeard] = createSignal<number>();
const [changes, setChanges] = createSignal(0);
const [share, setShare] = createSignal(25);
const [limit, setLimit] = createSignal(100);

renderHarness("range", () => (
  <>
    <beautiful-example data-example="heard">
      <Field>
        <Label>Keep backups for</Label>
        <Range
          name="backups"
          max={3}
          value={1}
          format={(v) => days[v]!}
          marks={[0, 1, 2, 3]}
          onInput={(event) => setHeard(event.currentTarget.valueAsNumber)}
          onChange={() => setChanges(changes() + 1)}
        />
      </Field>
    </beautiful-example>
    <beautiful-example data-example="plain">
      <Field>
        <Label>Emails a month</Label>
        <Range name="sends" min={1000} max={50000} step={1000} value={10000} />
      </Field>
    </beautiful-example>
    <beautiful-example data-example="hidden">
      <Field>
        <Label>Volume</Label>
        <Range name="volume" showValue={false} />
      </Field>
    </beautiful-example>
    <beautiful-example data-example="reset">
      <form>
        <Field>
          <Label>Discount</Label>
          <Range name="discount" value={10} format={percent} />
        </Field>
        <button type="reset">Reset</button>
      </form>
    </beautiful-example>
    <beautiful-example data-example="controlled">
      <Field>
        <Label>Split</Label>
        <Range name="split" step={5} max={limit()} value={share()} format={percent} />
      </Field>
      <button id="raise-limit" type="button" onClick={() => setLimit(200)}>
        Raise the limit
      </button>
      <button id="set-split" type="button" onClick={() => setShare(13)}>
        Set 13
      </button>
    </beautiful-example>
    <beautiful-example data-example="inner-marks">
      <Field>
        <Label>Sharpness</Label>
        <Range name="inner" marks={[25, 50, 75]} />
      </Field>
    </beautiful-example>
    <p id="heard">{heard()}</p>
    <p id="changes">{changes()}</p>
  </>
));
