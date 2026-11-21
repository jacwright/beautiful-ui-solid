import { Button, Divider } from "beautiful-ui-solid";

export default function Vertical() {
  return (
    <beautiful-demo-row>
      <Button>Undo</Button>
      <Button>Redo</Button>
      <Divider orientation="vertical" />
      <Button>Preview</Button>
      <Button variant="primary">Publish</Button>
    </beautiful-demo-row>
  );
}
