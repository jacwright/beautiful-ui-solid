import { Description, Field, Fieldset, Label, Legend, Switch } from "beautiful-ui-solid";

export default function Settings() {
  return (
    <Fieldset id="alerts">
      <Legend>Email me when</Legend>
      <Description>The emails go to the address you sign in with.</Description>
      <Field id="alerts-form">
        <Label>A visitor sends a form</Label>
        <Description>With what they wrote, so you can reply from your inbox.</Description>
        <Switch name="alerts" value="form" checked />
      </Field>
      <Field id="alerts-payment">
        <Label>A payment fails</Label>
        <Description>Sent the moment it happens, so you can update the card.</Description>
        <Switch name="alerts" value="payment" checked />
      </Field>
      <Field id="alerts-weekly">
        <Label>Every Monday, with last week's visits</Label>
        <Switch name="alerts" value="weekly" />
      </Field>
    </Fieldset>
  );
}
