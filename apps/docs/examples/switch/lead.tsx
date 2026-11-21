import { Field, Label, Switch } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Field id="lead-cookie-notice">
      <Label>Show a cookie notice</Label>
      <Switch name="cookie-notice" checked />
    </Field>
  );
}
