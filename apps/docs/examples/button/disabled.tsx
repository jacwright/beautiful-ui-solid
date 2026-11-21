import { Button } from "beautiful-ui-solid";

export default function Disabled() {
  return (
    <beautiful-demo-row>
      <Button variant="primary" disabled>Save draft</Button>
      <Button color="accent" disabled>Publish</Button>
      <Button variant="tertiary" color="danger" disabled>Delete site</Button>
    </beautiful-demo-row>
  );
}
