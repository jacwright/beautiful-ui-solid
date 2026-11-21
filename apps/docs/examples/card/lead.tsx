import { Button, Card, Heading, Text } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Card as="section" aria-labelledby="lead-card-title">
      <hgroup>
        <Heading level={3} id="lead-card-title">
          Spring launch
        </Heading>
        <Text>Live at spring-launch.example.com.</Text>
      </hgroup>
      <Text>3 pages and one form. 1,284 visits since it went live on Monday.</Text>
      <footer>
        <Button>Open site</Button>
      </footer>
    </Card>
  );
}
