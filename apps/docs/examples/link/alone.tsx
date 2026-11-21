import { Link, Text } from "beautiful-ui-solid";

export default function Alone() {
  return (
    <beautiful-demo-stack>
      <Text size="lg">
        <Link href="#plans">Compare every plan</Link>
      </Text>
      <Text>
        <Link href="#export">Export the entries as CSV</Link>
      </Text>
      <Text size="sm">
        <Link href="#reset">Forgot your password?</Link>
      </Text>
    </beautiful-demo-stack>
  );
}
