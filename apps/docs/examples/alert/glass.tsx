import { Alert, AlertActions, AlertDescription, AlertTitle, Button } from "beautiful-ui-solid";

// Cancel has autofocus, so the markup focuses it with no JS too.
export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="discard" command="show-modal">
          Discard changes
        </Button>
      </beautiful-demo-stage>
      <Alert id="discard">
        <AlertTitle>Discard 3 changes?</AlertTitle>
        <AlertDescription>The home page, the pricing page and one image go back to what is live now.</AlertDescription>
        <AlertActions>
          <Button commandfor="discard" command="close" autofocus>
            Keep editing
          </Button>
          <Button commandfor="discard" command="close" value="discard" variant="primary" color="danger">
            Discard
          </Button>
        </AlertActions>
      </Alert>
    </>
  );
}
