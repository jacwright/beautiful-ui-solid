import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Popover, PopoverButton, PopoverPanel, Text } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// After the docs examples, a popover a parent opens, which no example shows.

function Controlled() {
  const [open, setOpen] = createSignal(false);
  const [log, setLog] = createSignal<string[]>([]);
  return (
    <beautiful-example data-example="controlled">
      <beautiful-demo-row>
        <Button onClick={() => setOpen(true)}>Open from outside</Button>
        <Popover
          id="controlled"
          open={open()}
          onToggle={(next) => {
            setOpen(next);
            setLog((all) => [...all, next ? "open" : "closed"]);
          }}
        >
          <PopoverButton ref={(el) => (el.dataset.ref = "button")}>Usage</PopoverButton>
          <PopoverPanel ref={(el) => (el.dataset.ref = "panel")}>
            <p>
              <strong>12,400 requests this month</strong>
            </p>
            <Text tone="muted">Your plan includes 50,000. The count resets on the 1st.</Text>
            <footer>
              <Button variant="tertiary" onClick={() => setOpen(false)}>
                Close from outside
              </Button>
            </footer>
          </PopoverPanel>
        </Popover>
      </beautiful-demo-row>
      <p id="toggles">{log().join(" ")}</p>
    </beautiful-example>
  );
}

renderHarness("popover", () => <Controlled />);
