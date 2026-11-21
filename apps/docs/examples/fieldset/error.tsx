import { Description, ErrorMessage, Field, Input, Label } from "beautiful-ui-solid";

export default function WithError() {
  return (
    <Field id="custom-domain">
      <Label>Custom domain</Label>
      <Description>The address visitors type, such as springlaunch.com.</Description>
      <Input name="domain" value="spring launch.com" />
      <ErrorMessage>A domain can't have spaces.</ErrorMessage>
    </Field>
  );
}
