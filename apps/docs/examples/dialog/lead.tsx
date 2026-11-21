import { Button, Dialog, DialogActions, DialogDescription, DialogTitle } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <>
      <Button commandfor="lead-publish" command="show-modal">
        Publish changes
      </Button>
      <Dialog id="lead-publish">
        <DialogTitle>Publish 3 changes?</DialogTitle>
        <DialogDescription>
          The home page, the pricing page and one image go live now. Visitors see them on their next visit.
        </DialogDescription>
        <DialogActions>
          <Button commandfor="lead-publish" command="close">
            Not yet
          </Button>
          <Button commandfor="lead-publish" command="close" value="publish" variant="primary">
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
