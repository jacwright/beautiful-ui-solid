import { Divider, Text } from "beautiful-ui-solid";

export default function Soft() {
  return (
    <beautiful-demo-rows>
      <beautiful-demo-entry>
        <Text size="sm"><strong>Published the spring collection</strong></Text>
        <Text size="sm" tone="muted">2 hours ago, by your agent</Text>
      </beautiful-demo-entry>
      <Divider soft />
      <beautiful-demo-entry>
        <Text size="sm"><strong>Added the returns page</strong></Text>
        <Text size="sm" tone="muted">Yesterday, by Sam</Text>
      </beautiful-demo-entry>
      <Divider soft />
      <beautiful-demo-entry>
        <Text size="sm"><strong>Connected springlaunch.com</strong></Text>
        <Text size="sm" tone="muted">3 days ago, by Sam</Text>
      </beautiful-demo-entry>
    </beautiful-demo-rows>
  );
}
