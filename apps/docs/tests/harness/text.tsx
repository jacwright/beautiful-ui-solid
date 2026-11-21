import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Text } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

renderHarness("text", () => (
  <beautiful-example data-example="attributes">
    <Text id="described" tone="muted" size="sm">
      Shown under the field.
    </Text>
    <Text tone="default">The default tone, which leaves data-tone out.</Text>
  </beautiful-example>
));
