import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Divider, Heading, Text } from "beautiful-ui-solid";

export default function InDialog() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="launch-settings" command="show-modal">Site settings</Button>
      </beautiful-demo-stage>
      <Dialog id="launch-settings">
        <DialogTitle>Site settings</DialogTitle>
        <DialogDescription>Changes apply the next time you publish.</DialogDescription>
        <DialogBody>
          <Heading level={3}>Domain</Heading>
          <Text>Visitors reach the site at <code>springlaunch.com</code>, and <code>www</code> sends them there.</Text>
          <Divider />
          <Heading level={3}>Forms</Heading>
          <Text>Each submission is emailed to the team, with spam filtered out.</Text>
          <Divider />
          <Heading level={3}>Analytics</Heading>
          <Text>Visits are counted without cookies, so the site needs no consent banner.</Text>
        </DialogBody>
        <DialogActions>
          <Button commandfor="launch-settings" command="close">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
