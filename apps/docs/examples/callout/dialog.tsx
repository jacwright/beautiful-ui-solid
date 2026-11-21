import { Button, Callout, CalloutTitle, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Text } from "beautiful-ui-solid";

export default function InADialog() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="publish-site" command="show-modal">Publish</Button>
      </beautiful-demo-stage>
      <Dialog id="publish-site">
        <DialogTitle>Publish Spring launch?</DialogTitle>
        <DialogDescription>3 pages and 2 images go live at springlaunch.com.</DialogDescription>
        <DialogBody>
          <Callout tone="warning">
            <CalloutTitle>2 pages have no title</CalloutTitle>
            <Text>
              Search engines will show their address instead. Add a title to <code>/about</code> and <code>/faq</code> first.
            </Text>
          </Callout>
        </DialogBody>
        <DialogActions>
          <Button commandfor="publish-site" command="close">Cancel</Button>
          <Button commandfor="publish-site" command="close" value="publish" variant="primary" color="accent">
            Publish anyway
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
