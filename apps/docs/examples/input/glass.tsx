import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Field, Input, InputGroup, Label } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <InputGroup class="demo-search">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="m13 13 3.5 3.5" /></svg>
          <Input type="search" name="q" value="pricing" aria-label="Search the site" />
        </InputGroup>
        <Button commandfor="add-domain" command="show-modal">Add a domain</Button>
      </beautiful-demo-stage>
      <Dialog id="add-domain">
        <form method="dialog">
          <DialogTitle>Add a custom domain</DialogTitle>
          <DialogDescription>Visitors reach Spring launch at this address once its DNS points here.</DialogDescription>
          <DialogBody>
            <Field id="new-domain">
              <Label>Domain</Label>
              <Input name="domain" value="springlaunch.com" autocomplete="off" required />
            </Field>
            <Field id="new-domain-note">
              <Label>
                Note <small>Optional</small>
              </Label>
              <Input name="note" placeholder="For the summer campaign" />
            </Field>
          </DialogBody>
          <DialogActions>
            <Button commandfor="add-domain" command="close">Cancel</Button>
            <Button type="submit" value="add" variant="primary" color="accent">Add domain</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
