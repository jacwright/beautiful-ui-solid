import { Checkbox, Field, Label } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Field id="lead-form-emails">
      <Checkbox name="form-emails" checked />
      <Label>Email me when a form is sent</Label>
    </Field>
  );
}
