import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "beautiful-ui-solid";

export default function Scrolling() {
  return (
    <>
      <Button commandfor="changelog" command="show-modal">
        What's new
      </Button>
      <Dialog id="changelog">
        <DialogTitle>What's new</DialogTitle>
        <DialogDescription>Changes from the last three releases.</DialogDescription>
        <DialogBody>
          <h3>October</h3>
          <p>
            Sites deploy in half the time. Previews now get their own link for every branch, so you can share a change
            before it goes live.
          </p>
          <p>Forms can send a copy of each submission to a second address.</p>
          <h3>September</h3>
          <p>
            Scheduled releases: queue a change and pick the minute it goes live. Several releases can change the same
            page in order.
          </p>
          <p>Redirects accept a status code on every rule, and the dashboard shows which rules matched in the last day.</p>
          <p>The asset library takes video and PDF files as well as images.</p>
          <h3>August</h3>
          <p>Custom domains are on the way. Until then, every site gets a stable address that never changes.</p>
          <p>Broken links show up as warnings after each deploy, with the page and the line they came from.</p>
          <p>The editor keeps unsaved drafts when you switch between pages.</p>
        </DialogBody>
        <DialogActions>
          <Button commandfor="changelog" command="close">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
