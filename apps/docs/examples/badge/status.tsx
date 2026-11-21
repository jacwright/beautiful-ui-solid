import { Badge } from "beautiful-ui-solid";

export default function Status() {
  return (
    <beautiful-demo-row>
      <Badge color="green" dot>
        Live
      </Badge>
      <Badge color="yellow" dot>
        Building
      </Badge>
      <Badge color="red" dot>
        Build failed
      </Badge>
      <Badge dot>Offline</Badge>
    </beautiful-demo-row>
  );
}
