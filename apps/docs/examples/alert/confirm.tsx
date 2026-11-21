import { Alert, AlertActions, AlertDescription, AlertTitle, Button } from "beautiful-ui-solid";

// Cancel has autofocus, so the markup focuses it with no JS too.
export default function Confirm() {
  return (
    <>
      <Button commandfor="unpublish" command="show-modal">
        Unpublish site
      </Button>
      <Alert id="unpublish">
        <AlertTitle>Unpublish this site?</AlertTitle>
        <AlertDescription>
          Visitors will see a not-found page until you publish it again. Your files stay as they are.
        </AlertDescription>
        <AlertActions>
          <Button commandfor="unpublish" command="close" autofocus>
            Cancel
          </Button>
          <Button commandfor="unpublish" command="close" value="unpublish" variant="primary" color="danger">
            Unpublish
          </Button>
        </AlertActions>
      </Alert>
    </>
  );
}
