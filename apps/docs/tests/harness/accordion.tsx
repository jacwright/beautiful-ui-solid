import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Accordion, Disclosure, Text } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then the blocks that test what no example shows.

// For the keys and onKeyDown tests.
const [keys, setKeys] = createSignal<string[]>([]);

renderHarness("accordion", () => (
  <>
    <beautiful-example data-example="unnamed">
      <Accordion id="first-group" class="spaced" aria-label="First" onKeyDown={(event) => setKeys([...keys(), event.key])} data-keys={keys().join(",")}>
        <Disclosure summary="One">
          <Text>First group, one.</Text>
          <Accordion id="nested">
            <Disclosure summary="Inner one">
              <Text>Nested.</Text>
            </Disclosure>
            <Disclosure summary="Inner two">
              <Text>Nested.</Text>
            </Disclosure>
          </Accordion>
        </Disclosure>
        <Disclosure summary="Two">
          <Text>First group, two.</Text>
          <Disclosure id="inner-plain" summary="More detail">
            <Text>A plain Disclosure in an item's panel.</Text>
          </Disclosure>
        </Disclosure>
        <Disclosure summary="Own name" name="own">
          <Text>Its own name.</Text>
        </Disclosure>
      </Accordion>
      <Accordion
        id="second-group"
        onKeyDown={(event) => {
          if (event.key === "End") event.preventDefault();
        }}
      >
        <Disclosure summary="Three">
          <Text>Second group, three.</Text>
        </Disclosure>
        <Disclosure summary="Four">
          <Text>Second group, four.</Text>
        </Disclosure>
      </Accordion>
    </beautiful-example>
  </>
));
