import { Alert, AlertActions, AlertBody, AlertDescription, AlertTitle, Button, Field, Input, Label } from "beautiful-ui-solid";

// Cancel has autofocus, so the markup focuses it with no JS too.
export default function WithBody() {
  return (
    <>
      <Button commandfor="delete-site" command="show-modal">
        Delete site
      </Button>
      <Alert id="delete-site">
        <form method="dialog">
          <AlertTitle>Delete Spring launch?</AlertTitle>
          <AlertDescription>This deletes the site, its files and its form submissions. You can't undo it.</AlertDescription>
          <AlertBody>
            <Field id="delete-site-confirm">
              <Label>
                Type <strong>spring-launch</strong> to confirm
              </Label>
              <Input name="confirm" required pattern="spring-launch" autocomplete="off" />
            </Field>
          </AlertBody>
          <AlertActions>
            <Button commandfor="delete-site" command="close" autofocus>
              Cancel
            </Button>
            <Button type="submit" value="delete" variant="primary" color="danger">
              Delete site
            </Button>
          </AlertActions>
        </form>
      </Alert>
    </>
  );
}
