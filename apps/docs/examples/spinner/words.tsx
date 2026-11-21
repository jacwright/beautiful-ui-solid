import { Spinner, Text } from "beautiful-ui-solid";

export default function Words() {
  return (
    <beautiful-demo-stack>
      <Text>
        <Spinner>Checking springlaunch.com</Spinner>
      </Text>
      <Text size="sm" tone="muted">
        <Spinner>Saving your changes</Spinner>
      </Text>
    </beautiful-demo-stack>
  );
}
