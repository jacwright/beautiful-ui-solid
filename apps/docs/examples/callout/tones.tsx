import { Callout, CalloutTitle, Text } from "beautiful-ui-solid";

export default function Tones() {
  return (
    <beautiful-demo-stack>
      <Callout>
        <CalloutTitle>Domains take up to a day to connect</CalloutTitle>
        <Text>We check springlaunch.com every few minutes, and email you when it's live.</Text>
      </Callout>
      <Callout tone="success">
        <CalloutTitle>Spring launch is live</CalloutTitle>
        <Text>Visitors see the new pages now. The old ones are kept for 30 days.</Text>
      </Callout>
      <Callout tone="warning">
        <CalloutTitle>Your card expires on 30 November</CalloutTitle>
        <Text>Update it before then, so your sites stay online.</Text>
      </Callout>
      <Callout tone="danger">
        <CalloutTitle>2 pages didn't build</CalloutTitle>
        <Text>The rest of the site is live. Fix the pages and publish again.</Text>
      </Callout>
      <Callout tone="neutral">
        <CalloutTitle>Drafts stay private</CalloutTitle>
        <Text>Only your team sees a page until you publish it.</Text>
      </Callout>
    </beautiful-demo-stack>
  );
}
