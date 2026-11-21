import { Button, Dialog, DialogActions, DialogDescription, DialogTitle } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="publish" command="show-modal">
          Publish changes
        </Button>
      </beautiful-demo-stage>
      <Dialog id="publish">
        <DialogTitle>Publish 3 changes?</DialogTitle>
        <DialogDescription>
          The home page, the pricing page and one image go live now. Visitors see them on their next visit.
        </DialogDescription>
        <DialogActions>
          <Button commandfor="publish" command="close">
            Not yet
          </Button>
          <Button commandfor="publish" command="close" value="publish" variant="primary">
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
