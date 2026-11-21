import {
  Button,
  Description,
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
  Field,
  Input,
  Label,
  Select,
} from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Select class="demo-range" name="range" aria-label="Date range" value="30">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 12 months</option>
        </Select>
        <Button commandfor="invite-member" command="show-modal">
          Invite a teammate
        </Button>
      </beautiful-demo-stage>
      <Dialog id="invite-member">
        <form method="dialog">
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>They get an email with a link to join Northwind.</DialogDescription>
          <DialogBody>
            <Field id="invite-email">
              <Label>Email</Label>
              <Input type="email" name="email" placeholder="name@example.com" required />
            </Field>
            <Field id="invite-role">
              <Label>Role</Label>
              <Description>Editors can change sites. Viewers can only look.</Description>
              <Select name="role" value="editor">
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </Select>
            </Field>
          </DialogBody>
          <DialogActions>
            <Button commandfor="invite-member" command="close">
              Cancel
            </Button>
            <Button type="submit" value="invite" variant="primary" color="accent">
              Send invite
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
