import {
  Button,
  Description,
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
  Field,
  Label,
  Progress,
} from "beautiful-ui-solid";

export default function InDialog() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="publish-progress" command="show-modal">
          Publish
        </Button>
      </beautiful-demo-stage>
      <Dialog id="publish-progress">
        <DialogTitle>Publishing Spring launch</DialogTitle>
        <DialogDescription>You can close this. Publishing carries on, and we'll tell you when it's live.</DialogDescription>
        <DialogBody>
          <Field id="publish-pages">
            <Label>Pages</Label>
            <Progress value={3} max={8} valueText="3 of 8" />
          </Field>
          <Field id="publish-images">
            <Label>Images</Label>
            <Progress />
            <Description>Making a phone and a desktop size of each.</Description>
          </Field>
        </DialogBody>
        <DialogActions>
          <Button commandfor="publish-progress" command="close">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
