import { Field, Label, Select } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Field id="lead-redirect-kind">
      <Label>Redirect</Label>
      <Select name="status">
        <option value="301">Permanent, 301</option>
        <option value="302">Temporary, 302</option>
      </Select>
    </Field>
  );
}
