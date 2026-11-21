import { Progress, Text } from "beautiful-ui-solid";

export default function Alone() {
  return (
    <beautiful-demo-stack class="demo-narrow">
      <p>Set up Spring launch</p>
      <Progress value={3} max={5} aria-label="Setup" valueText="3 of 5 steps" />
      <Text size="sm" tone="muted">
        3 of 5 steps done. Next, add your domain.
      </Text>
    </beautiful-demo-stack>
  );
}
