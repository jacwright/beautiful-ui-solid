import { Button, Tooltip } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <beautiful-demo-row>
      <Tooltip id="lead-tip-duplicate" content="Makes a draft copy of this page">
        <Button>Duplicate</Button>
      </Tooltip>
    </beautiful-demo-row>
  );
}
