import { Spinner, Text } from "beautiful-ui-solid";

export default function Panel() {
  return (
    <section class="demo-busy" aria-label="Form entries">
      <Text tone="muted">
        <Spinner size="md">Loading the entries</Spinner>
      </Text>
    </section>
  );
}
