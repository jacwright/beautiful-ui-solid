import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Field, Label, Meter } from "beautiful-ui-solid";

export default function InDialog() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Starter plan</p>
        <Button commandfor="plan-usage" command="show-modal">See usage</Button>
      </beautiful-demo-stage>
      <Dialog id="plan-usage">
        <DialogTitle>Starter plan usage</DialogTitle>
        <DialogDescription>What your sites have used this month. The counts start again on December 1.</DialogDescription>
        <DialogBody>
          <Field id="plan-storage">
            <Label>Storage</Label>
            <Meter value={3.2} max={5} low={4} high={4.75} optimum={0} valueText="3.2 GB of 5 GB" />
          </Field>
          <Field id="plan-emails">
            <Label>Emails</Label>
            <Meter value={8700} max={10000} low={8000} high={9500} optimum={0} valueText="8,700 of 10,000" />
          </Field>
          <Field id="plan-bandwidth">
            <Label>Bandwidth</Label>
            <Meter value={18} max={100} low={80} high={95} optimum={0} valueText="18 GB of 100 GB" />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button commandfor="plan-usage" command="close">Close</Button>
          <Button commandfor="plan-usage" command="close" variant="primary">Upgrade</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
