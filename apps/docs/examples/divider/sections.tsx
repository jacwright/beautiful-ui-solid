import { Divider, Heading, Text } from "beautiful-ui-solid";

export default function Sections() {
  return (
    <beautiful-demo-sections>
      <section>
        <Heading level={2} size="sm">Domain</Heading>
        <Text size="sm" tone="muted">Visitors reach the site at springlaunch.com, and www sends them there.</Text>
      </section>
      <Divider />
      <section>
        <Heading level={2} size="sm">Forms</Heading>
        <Text size="sm" tone="muted">Each submission is emailed to the team, with spam filtered out.</Text>
      </section>
      <Divider />
      <section>
        <Heading level={2} size="sm">Analytics</Heading>
        <Text size="sm" tone="muted">Visits are counted without cookies, so the site needs no consent banner.</Text>
      </section>
    </beautiful-demo-sections>
  );
}
