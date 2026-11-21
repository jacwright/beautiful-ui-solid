import { Spinner, Text } from "beautiful-ui-solid";

export default function Accent() {
  return (
    <beautiful-demo-row>
      <Spinner size="md" color="accent" label="Loading the preview" />
      <Text>
        <Spinner color="accent">Building Spring launch</Spinner>
      </Text>
    </beautiful-demo-row>
  );
}
