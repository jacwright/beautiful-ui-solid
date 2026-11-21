import { Heading, Text } from "beautiful-ui-solid";

export default function Levels() {
  return (
    <beautiful-demo-outline>
      <Heading>Settings</Heading>
      <Heading level={2}>Domains</Heading>
      <Text tone="muted">Where people find your site. The first one is where the others send visitors.</Text>
      <Heading level={3}>springlaunch.com</Heading>
      <Text size="sm" tone="muted">Connected 3 days ago. Its certificate renews on its own.</Text>
      <Heading level={4}>DNS records</Heading>
      <Text size="sm" tone="muted">One <code>CNAME</code> record, found and checked.</Text>
    </beautiful-demo-outline>
  );
}
