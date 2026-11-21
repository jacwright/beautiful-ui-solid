import { Badge, Heading, Text } from "beautiful-ui-solid";

export default function InText() {
  return (
    <beautiful-demo-stack>
      <Heading level={3}>
        Form submissions <Badge color="accent">12 new</Badge>
      </Heading>
      <Text>
        Spring launch <Badge color="purple">Beta</Badge> goes out to every visitor on Friday, and the pricing page
        stays <Badge>Draft</Badge> until then.
      </Text>
      <Text size="sm" tone="muted">
        Plan{" "}
        <Badge color="green" variant="strong">
          Pro
        </Badge>{" "}
        renews on December 1.
      </Text>
    </beautiful-demo-stack>
  );
}
