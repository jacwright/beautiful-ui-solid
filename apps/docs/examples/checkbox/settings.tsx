import { Checkbox, Description, Field, Fieldset, Label, Legend } from "beautiful-ui-solid";

export default function Settings() {
  return (
    <Fieldset id="site-settings">
      <Legend>Spring launch</Legend>
      <Description>These take effect the next time you publish.</Description>
      <Field id="setting-search">
        <Checkbox name="search" checked />
        <Label>Show in search results</Label>
        <Description>Lets Google and Bing list the site's pages.</Description>
      </Field>
      <Field id="setting-forms">
        <Checkbox name="forms" checked />
        <Label>Accept form submissions</Label>
      </Field>
      <Field id="setting-password">
        <Checkbox name="password" />
        <Label>Ask for a password on the preview</Label>
        <Description>Only people you share the password with can open the preview link.</Description>
      </Field>
    </Fieldset>
  );
}
