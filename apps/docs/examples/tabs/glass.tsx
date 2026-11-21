import { Button, Dialog, DialogActions, DialogBody, DialogTitle, Tab, TabList, TabPanel, Tabs } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="share-spring" command="show-modal">Share</Button>
      </beautiful-demo-stage>
      <Dialog id="share-spring">
        <DialogTitle>Share Spring launch</DialogTitle>
        <DialogBody>
          <Tabs id="share">
            <TabList aria-label="Ways to share">
              <Tab>Invite</Tab>
              <Tab>Link</Tab>
              <Tab>Embed</Tab>
            </TabList>
            <TabPanel>
              <p>Invite a teammate to edit the site. They get an email with a link to sign in.</p>
            </TabPanel>
            <TabPanel>
              <p>Anyone with the preview link can see the draft before it goes live.</p>
            </TabPanel>
            <TabPanel>
              <p>Paste the waitlist form into another site with one line of code.</p>
            </TabPanel>
          </Tabs>
        </DialogBody>
        <DialogActions>
          <Button commandfor="share-spring" command="close">Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
