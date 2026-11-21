import { Text } from "beautiful-ui-solid";

export default function Muted() {
  return (
    <beautiful-demo-stack>
      <Text tone="muted">
        No submissions yet. A form on any page sends its entries here, with <strong>spam filtered out</strong>.
      </Text>
      <Text size="sm" tone="muted">
        Last published <strong>2 hours ago</strong> with <code>sites.publish</code>.
      </Text>
    </beautiful-demo-stack>
  );
}
