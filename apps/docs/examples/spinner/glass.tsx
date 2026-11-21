import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Spinner, Text } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="connect-domain" command="show-modal">
          Connect a domain
        </Button>
      </beautiful-demo-stage>
      <Dialog id="connect-domain">
        <DialogTitle>Connect springlaunch.com</DialogTitle>
        <DialogDescription>Add the CNAME record at your registrar. We check for it every few seconds.</DialogDescription>
        <DialogBody>
          <Text>
            <Spinner>Looking for the CNAME record</Spinner>
          </Text>
        </DialogBody>
        <DialogActions>
          <Button commandfor="connect-domain" command="close">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
