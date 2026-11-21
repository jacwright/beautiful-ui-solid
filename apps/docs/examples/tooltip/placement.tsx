import { Button, Tooltip } from "beautiful-ui-solid";

export default function Placement() {
  return (
    <beautiful-demo-row>
      <Tooltip id="tip-above" content="Centered above. The default." anchor="top">
        <Button>Above</Button>
      </Tooltip>
      <Tooltip id="tip-below" content="Centered below" anchor="bottom">
        <Button>Below</Button>
      </Tooltip>
      <Tooltip id="tip-right" content="To the right" anchor="right">
        <Button>Beside</Button>
      </Tooltip>
      <Tooltip id="tip-left" content="To the left" anchor="left">
        <Button>Before</Button>
      </Tooltip>
    </beautiful-demo-row>
  );
}
