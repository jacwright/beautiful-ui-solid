import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Field, Input, Label } from "beautiful-ui-solid";

export default function Form() {
  return (
    <>
      <Button commandfor="rename-site" command="show-modal">
        Rename site
      </Button>
      <Dialog id="rename-site">
        <form method="dialog">
          <DialogTitle>Rename site</DialogTitle>
          <DialogDescription>The new name shows on your dashboard. The site's address stays the same.</DialogDescription>
          <DialogBody>
            <Field id="rename-site-name">
              <Label>Name</Label>
              <Input name="name" value="Spring launch" required autofocus />
            </Field>
          </DialogBody>
          <DialogActions>
            <Button commandfor="rename-site" command="close">
              Cancel
            </Button>
            <Button type="submit" value="rename" variant="primary">
              Rename
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
