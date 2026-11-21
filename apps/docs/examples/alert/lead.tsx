import { Alert, AlertActions, AlertDescription, AlertTitle, Button } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <>
      <Button commandfor="lead-discard" command="show-modal">
        Discard changes
      </Button>
      <Alert id="lead-discard">
        <AlertTitle>Discard 3 changes?</AlertTitle>
        <AlertDescription>The home page, the pricing page and one image go back to what is live now.</AlertDescription>
        <AlertActions>
          <Button commandfor="lead-discard" command="close" autofocus>
            Keep editing
          </Button>
          <Button commandfor="lead-discard" command="close" value="discard" variant="primary" color="danger">
            Discard
          </Button>
        </AlertActions>
      </Alert>
    </>
  );
}
