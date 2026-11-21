import { Description, Field, Fieldset, Input, Label, Legend, Select, Textarea } from "beautiful-ui-solid";

export default function Fields() {
  return (
    <Fieldset id="site-details">
      <Legend>Site details</Legend>
      <Description>These show on your dashboard and in search results.</Description>
      <Field id="site-name">
        <Label>Site name</Label>
        <Input name="name" value="Spring launch" />
      </Field>
      <Field id="site-summary">
        <Label>Summary <small>Optional</small></Label>
        <Description>One or two sentences. Search results show it under the name.</Description>
        <Textarea name="summary" />
      </Field>
      <Field id="site-language">
        <Label>Language</Label>
        <Select name="language">
          <option>English</option>
          <option>Español</option>
          <option>Français</option>
        </Select>
      </Field>
    </Fieldset>
  );
}
