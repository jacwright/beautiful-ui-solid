import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Text } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="connect-domain" command="show-modal">Connect a domain</Button>
      </beautiful-demo-stage>
      <Dialog id="connect-domain">
        <DialogTitle>Connect springlaunch.com</DialogTitle>
        <DialogDescription>Add one record where you bought the domain. We check for it every few minutes.</DialogDescription>
        <DialogBody>
          <Text>
            Add a <code>CNAME</code> record for <code>www</code> that points to <code>sites.example.com</code>.
          </Text>
          <Text tone="muted">
            Most registrars apply it within minutes. Some take <strong>up to 48 hours</strong>.
          </Text>
        </DialogBody>
        <DialogActions>
          <Button commandfor="connect-domain" command="close">Later</Button>
          <Button commandfor="connect-domain" command="close" variant="primary">Check now</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
