import { Button, Tooltip } from "beautiful-ui-solid";

export default function Describe() {
  return (
    <beautiful-demo-row>
      <Tooltip id="tip-publish" content="Puts your changes live on spring-launch.com">
        <Button variant="primary" color="accent">
          Publish
        </Button>
      </Tooltip>
      <Tooltip id="tip-preview" content="Opens a private link you can share before you publish">
        <Button>Preview</Button>
      </Tooltip>
    </beautiful-demo-row>
  );
}
