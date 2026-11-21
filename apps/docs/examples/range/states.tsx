import { Description, Field, Label, Range } from "beautiful-ui-solid";

export default function States() {
  return (
    <form>
      <Field id="sample-rate">
        <Label>Sessions to record</Label>
        <Range name="sample" value={0} format={(v) => (v ? `${v}%` : "None")} />
      </Field>
      <Field id="seat-count">
        <Label>Seats</Label>
        <Description>Only an owner can change the plan.</Description>
        <Range name="seats" min={1} max={50} value={12} disabled />
      </Field>
    </form>
  );
}
