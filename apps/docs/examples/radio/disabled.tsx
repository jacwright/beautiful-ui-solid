import { Description, Field, Label, Legend, Radio, RadioGroup } from "beautiful-ui-solid";

export default function Disabled() {
  return (
    <>
      <RadioGroup id="billing-period" name="billing-period" defaultValue="monthly">
        <Legend>Billing period</Legend>
        <Description>You can switch at the end of any period.</Description>
        <Field id="billing-period-monthly">
          <Radio value="monthly" />
          <Label>Monthly, $29</Label>
        </Field>
        <Field id="billing-period-yearly">
          <Radio value="yearly" disabled />
          <Label>Yearly, $290</Label>
          <Description>Only a team owner can change the billing period.</Description>
        </Field>
      </RadioGroup>
      <RadioGroup id="region" name="region" defaultValue="eu" disabled>
        <Legend>Region</Legend>
        <Description>Set when the site was made. It can't move.</Description>
        <Field id="region-eu">
          <Radio value="eu" />
          <Label>Europe</Label>
        </Field>
        <Field id="region-us">
          <Radio value="us" />
          <Label>United States</Label>
        </Field>
      </RadioGroup>
    </>
  );
}
