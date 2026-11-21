import { Description, Field, Label, Meter } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Field id="lead-storage-used">
      <Label>Storage</Label>
      <Meter value={3.2} max={5} low={4} high={4.75} optimum={0} valueText="3.2 GB of 5 GB" />
      <Description>Images and files across your sites. Your plan includes 5 GB.</Description>
    </Field>
  );
}
