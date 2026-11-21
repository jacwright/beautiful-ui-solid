import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Skeleton } from "beautiful-ui-solid";

export default function InDialog() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="site-analytics" command="show-modal">
          Site analytics
        </Button>
      </beautiful-demo-stage>
      <Dialog id="site-analytics">
        <DialogTitle>Site analytics</DialogTitle>
        <DialogDescription>Visits to springlaunch.com over the last 30 days.</DialogDescription>
        {/* The body is the region that is loading, so it is busy and says what for, as a SkeletonGroup does. */}
        <DialogBody aria-busy="true">
          <beautiful-visually-hidden>Loading the numbers</beautiful-visually-hidden>
          <Skeleton shape="rect" height="8rem" />
          <h3>Top pages</h3>
          <Skeleton lines={3} />
        </DialogBody>
        <DialogActions>
          <Button commandfor="site-analytics" command="close">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
