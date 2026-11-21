import { Button, Callout, CalloutActions, CalloutTitle, Text } from "beautiful-ui-solid";

export default function Actions() {
  return (
    <beautiful-demo-stack>
      <Callout tone="danger">
        <CalloutTitle>2 pages didn't build</CalloutTitle>
        <ul>
          <li>
            <code>src/pages/pricing.astro</code>, line 14: <code>plans</code> is not defined.
          </li>
          <li>
            <code>src/pages/blog/[slug].astro</code> needs a <code>getStaticPaths()</code>.
          </li>
        </ul>
        <CalloutActions>
          <Button>View the build log</Button>
          <Button href="#builds" variant="tertiary">
            How builds work
          </Button>
        </CalloutActions>
      </Callout>
      <Callout tone="warning">
        <CalloutTitle>Your card expires on 30 November</CalloutTitle>
        <Text>Update it before then, so your sites stay online.</Text>
        <CalloutActions>
          <Button href="#billing">Update card</Button>
        </CalloutActions>
      </Callout>
    </beautiful-demo-stack>
  );
}
