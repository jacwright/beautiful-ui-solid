import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Link, Text } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="publish-spring" command="show-modal">Publish</Button>
      </beautiful-demo-stage>
      <Dialog id="publish-spring">
        <DialogTitle>Publish Spring launch?</DialogTitle>
        <DialogDescription>Everyone who visits the site sees these changes right away.</DialogDescription>
        <DialogBody>
          <Text>
            Three pages changed since the last publish. <Link href="#changes">Review the changes</Link>
          </Text>
          <Text tone="muted">
            You can roll back any time from{" "}
            <Link href="#versions" color="neutral">
              Versions
            </Link>
            .
          </Text>
        </DialogBody>
        <DialogActions>
          <Button commandfor="publish-spring" command="close">Cancel</Button>
          <Button commandfor="publish-spring" command="close" variant="primary">Publish</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
