import { Badge } from "beautiful-ui-solid";

export default function Strong() {
  return (
    <beautiful-demo-row>
      <Badge variant="strong">Draft</Badge>
      <Badge color="accent" variant="strong">New</Badge>
      <Badge color="red" variant="strong">Failed</Badge>
      <Badge color="orange" variant="strong">Overdue</Badge>
      <Badge color="yellow" variant="strong">Pending</Badge>
      <Badge color="green" variant="strong">Paid</Badge>
      <Badge color="teal" variant="strong">Synced</Badge>
      <Badge color="blue" variant="strong">Scheduled</Badge>
      <Badge color="purple" variant="strong">Beta</Badge>
      <Badge color="pink" variant="strong">Featured</Badge>
    </beautiful-demo-row>
  );
}
