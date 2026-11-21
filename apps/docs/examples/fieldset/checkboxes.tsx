import { Checkbox, Description, Field, Fieldset, Label, Legend } from "beautiful-ui-solid";

export default function Checkboxes() {
  return (
    <Fieldset id="notify">
      <Legend>Email me when</Legend>
      <Description>The emails go to the address you sign in with.</Description>
      <Field id="notify-form">
        <Checkbox name="notify" value="form" checked />
        <Label>A visitor sends a form</Label>
      </Field>
      <Field id="notify-payment">
        <Checkbox name="notify" value="payment" checked />
        <Label>A payment fails</Label>
        <Description>Sent the moment it happens, so you can update the card.</Description>
      </Field>
      <Field id="notify-weekly">
        <Checkbox name="notify" value="weekly" />
        <Label>Every Monday, with last week's visits</Label>
      </Field>
    </Fieldset>
  );
}
