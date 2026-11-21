import { Description, Field, Input, Label } from "beautiful-ui-solid";

export default function Phone() {
  return (
    <Field>
      <Label>Phone</Label>
      <Description>Start with + for a number in another country.</Description>
      <Input type="tel" name="phone" autocomplete="tel" />
    </Field>
  );
}
