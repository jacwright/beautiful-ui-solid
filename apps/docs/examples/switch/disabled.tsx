import { Description, Field, Label, Switch } from "beautiful-ui-solid";

export default function Disabled() {
  return (
    <>
      <Field id="custom-domain-https">
        <Label>Always use HTTPS</Label>
        <Description>Every site is served over HTTPS. You can't turn it off.</Description>
        <Switch name="https" checked disabled />
      </Field>
      <Field id="password-protect">
        <Label>Password-protect the site</Label>
        <Description>On the Business plan.</Description>
        <Switch name="password" disabled />
      </Field>
    </>
  );
}
