import {
  Button,
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "beautiful-ui-solid";

export default function DeployDetails() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="deploy-details" command="show-modal">
          Deploy details
        </Button>
      </beautiful-demo-stage>
      <Dialog id="deploy-details">
        <DialogTitle>Deploy 214</DialogTitle>
        <DialogDescription>Published to springlaunch.com by Maya.</DialogDescription>
        <DialogBody>
          <DescriptionList>
            <DescriptionTerm>Started</DescriptionTerm>
            <DescriptionDetails>November 3, 2026 at 9:40 AM</DescriptionDetails>
            <DescriptionTerm>Took</DescriptionTerm>
            <DescriptionDetails>38 seconds</DescriptionDetails>
            <DescriptionTerm>Pages changed</DescriptionTerm>
            <DescriptionDetails>3 of 24</DescriptionDetails>
            <DescriptionTerm>Version</DescriptionTerm>
            <DescriptionDetails>
              <code>4f9c2a1</code>
            </DescriptionDetails>
          </DescriptionList>
        </DialogBody>
        <DialogActions>
          <Button commandfor="deploy-details" command="close">
            Close
          </Button>
          <Button href="#deploy-214" variant="primary">
            View the site
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
