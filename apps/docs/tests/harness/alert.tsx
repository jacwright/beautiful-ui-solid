import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Alert, AlertActions, AlertBody, AlertDescription, AlertTitle, Button, Field, Input, Label } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, which write autofocus on Cancel so they work with no JS, then the blocks that
// test what the component does without it.

/**
 * Open from the start with ?ask, as a page that asks on arrival would: a modal alert makes the
 * rest of the harness inert. Logs each close's value.
 */
function AtOnce() {
  const [open, setOpen] = createSignal(new URLSearchParams(location.search).has("ask"));
  const [log, setLog] = createSignal<string[]>([]);
  return (
    <beautiful-example data-example="at-once">
      <p id="log">{log().join(" ")}</p>
      <Button onClick={() => setOpen(true)}>Ask again</Button>
      <Alert
        id="leave"
        open={open()}
        onClose={(value) => {
          setLog((all) => [...all, value || "(none)"]);
          setOpen(false);
        }}
      >
        <AlertTitle>Leave without saving?</AlertTitle>
        <AlertDescription>Your edits to the home page will be lost.</AlertDescription>
        <AlertActions>
          <Button commandfor="leave" command="close">
            Stay
          </Button>
          <Button commandfor="leave" command="close" value="leave" variant="primary" color="danger">
            Leave
          </Button>
        </AlertActions>
      </Alert>
    </beautiful-example>
  );
}

renderHarness("alert", () => (
  <>
    <beautiful-example data-example="field-first">
      <Button commandfor="rename-team" command="show-modal">
        Rename team
      </Button>
      <Alert id="rename-team" size="md">
        <AlertTitle>Rename the team?</AlertTitle>
        <AlertDescription>Everyone on it sees the new name at once.</AlertDescription>
        <AlertBody>
          <Field id="rename-team-name">
            <Label>Name</Label>
            <Input name="name" value="Spring" autofocus />
          </Field>
        </AlertBody>
        <AlertActions>
          <Button commandfor="rename-team" command="close">
            Cancel
          </Button>
          <Button commandfor="rename-team" command="close" value="rename" variant="primary">
            Rename
          </Button>
        </AlertActions>
      </Alert>
    </beautiful-example>
    <beautiful-example data-example="unmarked">
      <Button commandfor="archive" command="show-modal">
        Archive site
      </Button>
      <Alert id="archive">
        <AlertTitle>Archive Spring launch?</AlertTitle>
        <AlertDescription>It goes offline, and you can bring it back for six months.</AlertDescription>
        <AlertActions>
          <Button commandfor="archive" command="close">
            Cancel
          </Button>
          <Button commandfor="archive" command="close" value="archive" variant="primary" color="danger">
            Archive
          </Button>
        </AlertActions>
      </Alert>
    </beautiful-example>
    <AtOnce />
  </>
));
