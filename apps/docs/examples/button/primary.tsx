import { Button } from "beautiful-ui-solid";

export default function Primary() {
  return (
    <beautiful-demo-row>
      <Button variant="primary">Save draft</Button>
      <Button variant="primary" color="accent">Publish</Button>
      <Button variant="primary" color="danger">Delete site</Button>
    </beautiful-demo-row>
  );
}
