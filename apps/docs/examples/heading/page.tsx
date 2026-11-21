import { Button, Heading } from "beautiful-ui-solid";

export default function Page() {
  return (
    <header class="demo-header">
      <Heading>Spring launch</Heading>
      <beautiful-demo-row>
        <Button>Preview</Button>
        <Button variant="primary">Publish</Button>
      </beautiful-demo-row>
    </header>
  );
}
