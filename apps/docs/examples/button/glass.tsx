import { Button } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <beautiful-demo-row>
        <Button variant="tertiary">Cancel</Button>
        <Button>Preview</Button>
        <Button variant="primary" color="accent">Publish</Button>
      </beautiful-demo-row>
    </beautiful-demo-stage>
  );
}
