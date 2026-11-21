import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Link, Text } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The examples in examples/link/, then a block for the tests of the attributes and handlers it passes on.

const [clicks, setClicks] = createSignal(0);

renderHarness("link", () => (
  <beautiful-example data-example="attributes">
    <Text>
      <Link id="download" href="#entries" download="entries.csv" color="accent" aria-describedby="download-size">
        Download the entries
      </Link>{" "}
      <small id="download-size">(2 MB)</small>
    </Text>
    <Text>
      <Link
        id="counted"
        href="#counted"
        data-clicks={clicks()}
        onClick={(event) => {
          event.preventDefault();
          setClicks(clicks() + 1);
        }}
      >
        Count a click
      </Link>
    </Text>
  </beautiful-example>
));
