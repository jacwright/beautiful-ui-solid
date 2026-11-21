import { Button, Callout, CalloutActions, CalloutTitle, Text } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";

export default function Live() {
  const [result, setResult] = createSignal<"published" | "failed">();
  // A new result replaces the last callout with a new one, so it is read out again.
  const publish = (next: "published" | "failed") => {
    setResult(undefined);
    requestAnimationFrame(() => setResult(next));
  };
  return (
    <beautiful-demo-stack>
      <beautiful-demo-row>
        <Button variant="primary" color="accent" onClick={() => publish("published")}>
          Publish
        </Button>
        <Button onClick={() => publish("failed")}>Publish with errors</Button>
      </beautiful-demo-row>
      <Show when={result() === "published"}>
        <Callout tone="success" live onDismiss={() => setResult(undefined)}>
          <CalloutTitle>Spring launch is live</CalloutTitle>
          <Text>Visitors see the new pages now.</Text>
        </Callout>
      </Show>
      <Show when={result() === "failed"}>
        <Callout tone="danger" live onDismiss={() => setResult(undefined)}>
          <CalloutTitle>2 pages didn't build</CalloutTitle>
          <Text>The rest of the site is live. Fix the pages and publish again.</Text>
          <CalloutActions>
            <Button>View the build log</Button>
          </CalloutActions>
        </Callout>
      </Show>
    </beautiful-demo-stack>
  );
}
