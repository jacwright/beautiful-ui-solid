import {
  Accordion,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
  Disclosure,
  Text,
} from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="plan-questions" command="show-modal">Change plan</Button>
      </beautiful-demo-stage>
      <Dialog id="plan-questions">
        <DialogTitle>Move to the Pro plan?</DialogTitle>
        <DialogDescription>$29 a month for this site, from today.</DialogDescription>
        <DialogBody>
          <Accordion name="plan">
            <Disclosure summary="What changes today?" open>
              <Text tone="muted">The site stays online for good, and the visitor cap is lifted.</Text>
            </Disclosure>
            <Disclosure summary="Can I move back later?">
              <Text tone="muted">Yes, at the end of any month. Nothing on the site is lost.</Text>
            </Disclosure>
          </Accordion>
        </DialogBody>
        <DialogActions>
          <Button commandfor="plan-questions" command="close">Cancel</Button>
          <Button commandfor="plan-questions" command="close" variant="primary">Move to Pro</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
