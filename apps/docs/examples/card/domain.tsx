import { Button, Card, Heading, Text } from "beautiful-ui-solid";

export default function Domain() {
  return (
    <Card as="section" aria-labelledby="domain-title">
      <hgroup>
        <Heading level={3} id="domain-title">
          Domain
        </Heading>
        <Text>Where visitors find the site.</Text>
      </hgroup>
      <Text>
        Visitors reach the site at <code>springlaunch.com</code>, and <code>www</code> sends them there. Its certificate
        renews on its own.
      </Text>
      <footer>
        <Button>Change domain</Button>
      </footer>
    </Card>
  );
}
