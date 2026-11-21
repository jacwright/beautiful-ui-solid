import { Description, Field, Label, Meter } from "beautiful-ui-solid";

export default function Levels() {
  return (
    <>
      <Field id="sites-used">
        <Label>Sites</Label>
        <Meter value={3} max={10} low={8} high={9.5} optimum={0} valueText="3 of 10" />
      </Field>
      <Field id="emails-sent">
        <Label>Emails this month</Label>
        <Meter value={8700} max={10000} low={8000} high={9500} optimum={0} valueText="8,700 of 10,000" />
        <Description>Sending pauses at 10,000. The count starts again on December 1.</Description>
      </Field>
      <Field id="storage-full">
        <Label>Storage</Label>
        <Meter value={4.9} max={5} low={4} high={4.75} optimum={0} valueText="4.9 GB of 5 GB" />
        <Description>Almost full. New uploads stop at 5 GB, so upgrade or delete what you don't need.</Description>
      </Field>
    </>
  );
}
