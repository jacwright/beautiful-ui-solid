import { Button } from "beautiful-ui-solid";

export default function Tertiary() {
  return (
    <beautiful-demo-row>
      <Button variant="tertiary">Save draft</Button>
      <Button variant="tertiary" color="accent">Publish</Button>
      <Button variant="tertiary" color="danger">Delete site</Button>
    </beautiful-demo-row>
  );
}
