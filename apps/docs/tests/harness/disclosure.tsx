import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Disclosure, Text } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then a block for the open and onToggle tests.

const [open, setOpen] = createSignal(false);
const [heard, setHeard] = createSignal<boolean[]>([]);
const [heardFirst, setHeardFirst] = createSignal<boolean[]>([]);

renderHarness("disclosure", () => (
  <beautiful-example data-example="controlled">
    <button id="open-it" type="button" onClick={() => setOpen(!open())}>
      Toggle from outside
    </button>
    <Disclosure
      id="controlled"
      name="settings"
      class="spaced"
      aria-describedby="open-it"
      summary="Danger zone"
      open={open()}
      onToggle={(next) => {
        setHeard([...heard(), next]);
        setOpen(next);
      }}
      data-heard={heard().join(",")}
    >
      <Text>Delete this site and everything in it.</Text>
    </Disclosure>
    <Disclosure
      id="open-at-first"
      summary="Open at first"
      open
      onToggle={(next) => setHeardFirst([...heardFirst(), next])}
      data-heard={heardFirst().join(",")}
    >
      <Text>Nobody pressed anything yet.</Text>
    </Disclosure>
  </beautiful-example>
));
