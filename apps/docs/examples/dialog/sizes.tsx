import { Button, Dialog, DialogActions, DialogTitle } from "beautiful-ui-solid";

export default function Sizes() {
  return (
    <>
      <Button commandfor="size-sm" command="show-modal">
        sm
      </Button>
      <Button commandfor="size-md" command="show-modal">
        md
      </Button>
      <Button commandfor="size-lg" command="show-modal">
        lg
      </Button>
      <Button commandfor="size-xl" command="show-modal">
        xl
      </Button>
      <Dialog id="size-sm" size="sm">
        <DialogTitle>Small: 24rem</DialogTitle>
        <DialogActions>
          <Button commandfor="size-sm" command="close">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog id="size-md" size="md">
        <DialogTitle>Medium: 32rem, the default</DialogTitle>
        <DialogActions>
          <Button commandfor="size-md" command="close">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog id="size-lg" size="lg">
        <DialogTitle>Large: 42rem</DialogTitle>
        <DialogActions>
          <Button commandfor="size-lg" command="close">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog id="size-xl" size="xl">
        <DialogTitle>Extra large: 56rem</DialogTitle>
        <DialogActions>
          <Button commandfor="size-xl" command="close">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
