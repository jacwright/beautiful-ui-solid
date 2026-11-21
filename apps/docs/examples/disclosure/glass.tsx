import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Disclosure, Text } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="publish-changes" command="show-modal">
          Publish
        </Button>
      </beautiful-demo-stage>
      <Dialog id="publish-changes">
        <DialogTitle>Publish Spring launch?</DialogTitle>
        <DialogDescription>Everyone who visits the site sees these changes right away.</DialogDescription>
        <DialogBody>
          <Disclosure summary="3 pages changed">
            <Text tone="muted">Home, Pricing and Contact. You can roll back any time from Versions.</Text>
          </Disclosure>
        </DialogBody>
        <DialogActions>
          <Button commandfor="publish-changes" command="close">
            Cancel
          </Button>
          <Button commandfor="publish-changes" command="close" variant="primary">
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
