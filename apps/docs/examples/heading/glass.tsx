import { Button, Heading, Text } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <beautiful-demo-hero>
        <Heading size="display">Launch the spring collection</Heading>
        <Text size="lg">New colors, lighter fabrics, and free returns until June.</Text>
        <beautiful-demo-row>
          <Button href="#shop" variant="primary">Shop the collection</Button>
          <Button href="#lookbook">See the lookbook</Button>
        </beautiful-demo-row>
      </beautiful-demo-hero>
    </beautiful-demo-stage>
  );
}
