import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Badge } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then a block for the props no example shows.

const [clicks, setClicks] = createSignal(0);

renderHarness("badge", () => (
  <beautiful-example data-example="attributes">
    <Badge id="explicit" color="neutral" variant="soft" title="Not published yet">
      Draft
    </Badge>
    <Badge id="counted" color="blue" data-clicks={clicks()} onClick={() => setClicks(clicks() + 1)}>
      Count a click
    </Badge>
  </beautiful-example>
));
