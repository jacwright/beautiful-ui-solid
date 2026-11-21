import { Button, Checkbox, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Field, Input, Label } from "beautiful-ui-solid";

export default function InDialog() {
  return (
    <>
      <Button commandfor="notify-settings" command="show-modal">Notification settings</Button>
      <Dialog id="notify-settings">
        <form method="dialog">
          <DialogTitle>Notification settings</DialogTitle>
          <DialogDescription>Pick what we email you about. The list scrolls.</DialogDescription>
          <DialogBody>
            <Field id="notify-email">
              <Label>Send to</Label>
              <Input name="email" type="email" value="team@spring-launch.com" autofocus />
            </Field>
            <Field id="notify-deploys">
              <Checkbox name="deploys" checked />
              <Label>A deploy finishes</Label>
            </Field>
            <Field id="notify-failures">
              <Checkbox name="failures" checked />
              <Label>A deploy fails</Label>
            </Field>
            <Field id="notify-forms">
              <Checkbox name="forms" />
              <Label>A form gets a submission</Label>
            </Field>
            <Field id="notify-links">
              <Checkbox name="links" />
              <Label>A link breaks</Label>
            </Field>
            <Field id="notify-domains">
              <Checkbox name="domains" />
              <Label>A domain needs attention</Label>
            </Field>
            <Field id="notify-invites">
              <Checkbox name="invites" checked />
              <Label>Someone joins the team</Label>
            </Field>
            <Field id="notify-billing">
              <Checkbox name="billing" checked />
              <Label>An invoice is ready</Label>
            </Field>
            <Field id="notify-usage">
              <Checkbox name="usage" />
              <Label>Usage passes 80% of the plan</Label>
            </Field>
            <Field id="notify-digest">
              <Checkbox name="digest" />
              <Label>A weekly summary</Label>
            </Field>
          </DialogBody>
          <DialogActions>
            <Button commandfor="notify-settings" command="close">Cancel</Button>
            <Button type="submit" value="save" variant="primary">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
