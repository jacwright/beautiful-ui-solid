import { Description, Field, Fieldset, Input, Label, Legend } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Fieldset id="lead-site">
      <Legend>Site</Legend>
      <Field id="lead-site-name">
        <Label>Site name</Label>
        <Description>Shown in the browser tab and in search results.</Description>
        <Input name="name" value="Spring launch" autocomplete="off" />
      </Field>
    </Fieldset>
  );
}
