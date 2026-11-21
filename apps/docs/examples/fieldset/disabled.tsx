import { Description, Field, Fieldset, Input, Label, Legend } from "beautiful-ui-solid";

export default function Disabled() {
  return (
    <Fieldset id="billing-address" disabled>
      <Legend>Billing address</Legend>
      <Description>Only a team owner can change it.</Description>
      <Field id="billing-street">
        <Label>Street</Label>
        <Input name="street" value="12 Harbour Street" />
      </Field>
      <Field id="billing-city">
        <Label>City</Label>
        <Input name="city" value="Wellington" />
      </Field>
    </Fieldset>
  );
}
