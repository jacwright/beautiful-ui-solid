import { Checkbox, Description, ErrorMessage, Field, Label } from "beautiful-ui-solid";

export default function States() {
  return (
    <form>
      <Field id="accept-terms">
        <Checkbox name="terms" required />
        <Label>I agree to the Terms of Service</Label>
        <ErrorMessage>Check this box to go on.</ErrorMessage>
      </Field>
      <Field id="daily-backups">
        <Checkbox name="backups" checked disabled />
        <Label>Back up the site every day</Label>
        <Description>Included with every paid plan.</Description>
      </Field>
      <Field id="custom-code">
        <Checkbox name="code" disabled />
        <Label>Allow custom code in pages</Label>
        <Description>Your team's owner turned this off.</Description>
      </Field>
    </form>
  );
}
