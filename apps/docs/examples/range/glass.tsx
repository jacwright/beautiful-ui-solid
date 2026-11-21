import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Field, Label, Range } from "beautiful-ui-solid";

const after = ["1 hour", "6 hours", "1 day", "1 week"];

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="roll-out" command="show-modal">
          Roll out the new version
        </Button>
      </beautiful-demo-stage>
      <Dialog id="roll-out">
        <form method="dialog">
          <DialogTitle>Roll out the new version</DialogTitle>
          <DialogDescription>
            Send some visitors to the new version first, and watch its numbers before everyone sees it.
          </DialogDescription>
          <DialogBody>
            <Field id="roll-out-share">
              <Label>Visitors who see it</Label>
              <Range name="share" step={5} value={40} format={(v) => `${v}%`} />
            </Field>
            <Field id="roll-out-hours">
              <Label>Promote it after</Label>
              <Range name="hours" max={3} value={2} format={(v) => after[v]!} marks={[0, 1, 2, 3]} />
            </Field>
          </DialogBody>
          <DialogActions>
            <Button commandfor="roll-out" command="close">
              Cancel
            </Button>
            <Button type="submit" value="roll-out" variant="primary" color="accent">
              Start roll-out
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
