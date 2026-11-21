import { Badge } from "beautiful-ui-solid";

export default function Colors() {
  return (
    <beautiful-demo-row>
      <Badge>Draft</Badge>
      <Badge color="accent">New</Badge>
      <Badge color="red">Failed</Badge>
      <Badge color="orange">Overdue</Badge>
      <Badge color="yellow">Pending</Badge>
      <Badge color="green">Paid</Badge>
      <Badge color="teal">Synced</Badge>
      <Badge color="blue">Scheduled</Badge>
      <Badge color="purple">Beta</Badge>
      <Badge color="pink">Featured</Badge>
    </beautiful-demo-row>
  );
}
