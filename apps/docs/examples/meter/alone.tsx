import { Meter, Text } from "beautiful-ui-solid";

export default function Alone() {
  return (
    <beautiful-demo-stack class="demo-narrow">
      <Text>Spring launch</Text>
      <Meter value={18} max={100} low={80} high={95} optimum={0} aria-label="Bandwidth this month" valueText="18 GB of 100 GB" />
      <Text size="sm" tone="muted">
        18 GB of 100 GB bandwidth this month.
      </Text>
    </beautiful-demo-stack>
  );
}
