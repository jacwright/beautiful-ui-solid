import { Button, Callout, CalloutTitle, Text } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";

export default function Dismiss() {
  const [shown, setShown] = createSignal(true);
  return (
    <beautiful-demo-stack>
      <Show
        when={shown()}
        fallback={
          <Button variant="tertiary" onClick={() => setShown(true)}>
            Show the callout again
          </Button>
        }
      >
        <Callout onDismiss={() => setShown(false)}>
          <CalloutTitle>Your site has a new home page editor</CalloutTitle>
          <Text>Drag sections to reorder them, and change any text in place.</Text>
        </Callout>
      </Show>
      <beautiful-demo-row>
        <Button>Open the editor</Button>
      </beautiful-demo-row>
    </beautiful-demo-stack>
  );
}
