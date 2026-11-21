import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Dialog, DialogActions, DialogDescription, DialogTitle } from "beautiful-ui-solid";
import { createSignal, For, Show } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then dialogs a parent opens, which no example shows.

/** Opened from outside. Logs each close's value, and can refuse a close once, so the dialog opens again. */
function Controlled() {
  const [open, setOpen] = createSignal(false);
  const [refuse, setRefuse] = createSignal(false);
  const [log, setLog] = createSignal<string[]>([]);
  return (
    <beautiful-example data-example="controlled">
      <p id="log">{log().join(" ")}</p>
      <beautiful-demo-row>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Button onClick={() => setRefuse(true)}>Refuse the next close</Button>
      </beautiful-demo-row>
      <Dialog
        id="controlled"
        open={open()}
        onClose={(value) => {
          setLog((all) => [...all, value || "(none)"]);
          if (refuse()) setRefuse(false);
          else setOpen(false);
        }}
      >
        <DialogTitle>Publish 3 changes?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close from outside</Button>
          <Button commandfor="controlled" command="close" value="publish" variant="primary">
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </beautiful-example>
  );
}

/** A list whose Delete button leaves the page as its dialog opens, as a deleted row's would. */
function OpenerGone() {
  const [rows, setRows] = createSignal(["Spring launch", "Summer sale"]);
  const [deleting, setDeleting] = createSignal<string>();
  return (
    <beautiful-example data-example="opener-gone">
      <button type="button" id="before">
        Before
      </button>
      <For each={rows()}>
        {(row) => (
          <Button
            data-row={row}
            onClick={() => {
              setDeleting(row);
              setRows((all) => all.filter((other) => other !== row));
            }}
          >
            Delete {row}
          </Button>
        )}
      </For>
      <Dialog id="deleted" open={deleting() !== undefined} onClose={() => setDeleting(undefined)}>
        <DialogTitle>Deleted</DialogTitle>
        <Show when={deleting()}>{(name) => <DialogDescription>{name()} is gone.</DialogDescription>}</Show>
        <DialogActions>
          <Button commandfor="deleted" command="close">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </beautiful-example>
  );
}

renderHarness("dialog", () => (
  <>
    <Controlled />
    <OpenerGone />
  </>
));
