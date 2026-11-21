import { DatePicker, Description, Field, Label } from "beautiful-ui-solid";

export default function LaunchDate() {
  return (
    <Field>
      <Label>Launch date</Label>
      <Description>Any day in November or December 2026.</Description>
      <DatePicker name="launch" value="2026-11-20" min="2026-11-01" max="2026-12-31" />
    </Field>
  );
}
