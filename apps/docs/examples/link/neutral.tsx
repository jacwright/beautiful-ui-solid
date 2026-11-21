import { Link, Text } from "beautiful-ui-solid";

export default function Neutral() {
  return (
    <beautiful-demo-stack>
      <Text>
        Forms keep their entries for 90 days.{" "}
        <Link href="#retention" color="neutral">
          Change how long
        </Link>
      </Text>
      <Text size="sm" tone="muted">
        Published 2 hours ago with <code>sites.publish</code>.{" "}
        <Link href="#history" color="neutral">
          See every version
        </Link>
      </Text>
    </beautiful-demo-stack>
  );
}
