import { Field, Label, Range } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Field id="lead-zoom">
      <Label>Zoom</Label>
      <Range name="zoom" min={25} max={200} step={25} value={100} format={(v) => `${v}%`} />
    </Field>
  );
}
