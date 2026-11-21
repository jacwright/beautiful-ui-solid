import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Drawer, DrawerActions, DrawerTitle } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The one block no example covers: a drawer a parent opens, which logs each close.

/** Opened from outside. Logs each close's value. */
function Controlled() {
  const [open, setOpen] = createSignal(false);
  const [log, setLog] = createSignal<string[]>([]);
  return (
    <beautiful-example data-example="controlled">
      <p id="log">{log().join(" ")}</p>
      <Button onClick={() => setOpen(true)}>Open filters</Button>
      <Drawer
        id="filters"
        side="start"
        open={open()}
        onClose={(value) => {
          setLog((all) => [...all, value || "(none)"]);
          setOpen(false);
        }}
      >
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerActions>
          <Button onClick={() => setOpen(false)}>Close from outside</Button>
          <Button commandfor="filters" command="close" value="apply" variant="primary">
            Apply
          </Button>
        </DrawerActions>
      </Drawer>
    </beautiful-example>
  );
}

renderHarness("drawer", () => <Controlled />);
