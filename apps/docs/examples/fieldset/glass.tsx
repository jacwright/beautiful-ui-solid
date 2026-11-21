import { Button, Description, Dialog, DialogActions, DialogBody, DialogTitle, Field, Input, Label, Select } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="invite" command="show-modal">Invite a teammate</Button>
      </beautiful-demo-stage>
      <Dialog id="invite">
        <form method="dialog">
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogBody>
            <Field id="invite-email">
              <Label>Email</Label>
              <Input type="email" name="email" required />
            </Field>
            <Field id="invite-role">
              <Label>Role</Label>
              <Description>Editors change the site. Owners also manage billing and the team.</Description>
              <Select name="role">
                <option>Editor</option>
                <option>Owner</option>
              </Select>
            </Field>
          </DialogBody>
          <DialogActions>
            <Button commandfor="invite" command="close">Cancel</Button>
            <Button type="submit" value="invite" variant="primary">Send invite</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
