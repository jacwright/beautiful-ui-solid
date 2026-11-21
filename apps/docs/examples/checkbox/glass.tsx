import { Button, Checkbox, Description, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Field, Label } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="delete-site" command="show-modal" color="danger">
          Delete site
        </Button>
      </beautiful-demo-stage>
      <Dialog id="delete-site">
        <form method="dialog">
          <DialogTitle>Delete Spring launch?</DialogTitle>
          <DialogDescription>The site goes offline right away, and its address is freed for anyone.</DialogDescription>
          <DialogBody>
            <Field id="delete-submissions">
              <Checkbox name="submissions" />
              <Label>Also delete its 214 form submissions</Label>
              <Description>Left unchecked, they stay in Forms for 30 days.</Description>
            </Field>
            <Field id="delete-tell-team">
              <Checkbox name="notify" checked />
              <Label>Email the team that it's gone</Label>
            </Field>
          </DialogBody>
          <DialogActions>
            <Button commandfor="delete-site" command="close">
              Cancel
            </Button>
            <Button type="submit" value="delete" variant="primary" color="danger">
              Delete site
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
