import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, List, ListItem } from "beautiful-ui-solid";

export default function InDialog() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="publish-changes" command="show-modal">Publish</Button>
      </beautiful-demo-stage>
      <Dialog id="publish-changes">
        <DialogTitle>Publish 3 changes</DialogTitle>
        <DialogDescription>These pages go live on springlaunch.com.</DialogDescription>
        <DialogBody>
          <List variant="rows">
            <ListItem
              start={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h7l3 3v11H5z" /><path d="M12 3v3h3" /></svg>}
              description="/"
              end="Edited"
            >
              Home
            </ListItem>
            <ListItem
              start={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h7l3 3v11H5z" /><path d="M12 3v3h3" /></svg>}
              description="/pricing/"
              end="New"
            >
              Pricing
            </ListItem>
            <ListItem
              start={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h7l3 3v11H5z" /><path d="M12 3v3h3" /></svg>}
              description="/blog/launch-notes/"
              end="New"
            >
              Launch notes
            </ListItem>
          </List>
        </DialogBody>
        <DialogActions>
          <Button commandfor="publish-changes" command="close">Cancel</Button>
          <Button commandfor="publish-changes" command="close" variant="primary">Publish</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
