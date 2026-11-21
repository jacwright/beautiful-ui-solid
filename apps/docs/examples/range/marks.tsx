import { Description, Field, Label, Range } from "beautiful-ui-solid";

const days = ["7 days", "30 days", "90 days", "1 year"];

export default function Marks() {
  return (
    <Field id="log-days">
      <Label>Keep logs for</Label>
      <Description>Older entries are deleted each night.</Description>
      <Range name="logs" max={3} value={1} format={(v) => days[v]!} marks={[0, 1, 2, 3]} />
    </Field>
  );
}
