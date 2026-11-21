import { Description, Field, Label, Switch } from "beautiful-ui-solid";

export default function Neutral() {
  return (
    <>
      <Field id="compact-rows">
        <Label>Compact rows</Label>
        <Description>Fit more sites on the screen. Only on this device.</Description>
        <Switch name="compact" color="neutral" checked />
      </Field>
      <Field id="show-drafts">
        <Label>Show drafts in the list</Label>
        <Switch name="drafts" color="neutral" />
      </Field>
    </>
  );
}
