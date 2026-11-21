import { Badge, Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Text } from "beautiful-ui-solid";

export default function InADialog() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="site-status" command="show-modal">Site status</Button>
      </beautiful-demo-stage>
      <Dialog id="site-status">
        <DialogTitle>
          Spring launch{" "}
          <Badge color="green" dot>
            Live
          </Badge>
        </DialogTitle>
        <DialogDescription>Published 2 hours ago from the main branch.</DialogDescription>
        <DialogBody>
          <Text>
            Pricing page <Badge color="yellow">Pending review</Badge>
          </Text>
          <Text>
            Contact form <Badge color="red">2 failed</Badge>
          </Text>
          <Text>
            Plan{" "}
            <Badge color="green" variant="strong">
              Pro
            </Badge>
          </Text>
        </DialogBody>
        <DialogActions>
          <Button commandfor="site-status" command="close">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
