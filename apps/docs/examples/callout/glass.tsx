import { Button, Callout, CalloutActions, CalloutTitle, Text } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <beautiful-demo-stack>
        <Callout tone="success">
          <CalloutTitle>Spring launch is live</CalloutTitle>
          <Text>Visitors see the new pages now. The old ones are kept for 30 days.</Text>
        </Callout>
        <Callout tone="warning">
          <CalloutTitle>Your card expires on 30 November</CalloutTitle>
          <Text>Update it before then, so your sites stay online.</Text>
          <CalloutActions>
            <Button href="#billing">Update card</Button>
          </CalloutActions>
        </Callout>
      </beautiful-demo-stack>
    </beautiful-demo-stage>
  );
}
