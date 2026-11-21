import { Badge } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <beautiful-demo-row>
      <Badge>Draft</Badge>
      <Badge color="green">Paid</Badge>
      <Badge color="red">Failed</Badge>
    </beautiful-demo-row>
  );
}
