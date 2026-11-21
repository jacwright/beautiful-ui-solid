import { Callout, Link, Text } from "beautiful-ui-solid";

export default function Brief() {
  return (
    <beautiful-demo-stack>
      <Callout>
        <Text>Changes you make here go live the next time you publish.</Text>
      </Callout>
      <Callout tone="neutral">
        <Text>
          Form submissions are kept for 90 days. <Link href="#export">Export them</Link> to keep them longer.
        </Text>
      </Callout>
    </beautiful-demo-stack>
  );
}
