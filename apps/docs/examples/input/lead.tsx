import { Field, Input, Label } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Field id="lead-owner-email">
      <Label>Email</Label>
      <Input type="email" name="email" placeholder="you@example.com" autocomplete="email" />
    </Field>
  );
}
