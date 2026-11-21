import { Description, ErrorMessage, Field, Label, Select } from "beautiful-ui-solid";

export default function States() {
  return (
    <form>
      <Field id="report-metric">
        <Label>Metric</Label>
        <Select name="metric" placeholder="Choose a metric" required>
          <option value="visits">Visits</option>
          <option value="signups">Sign-ups</option>
          <option value="revenue">Revenue</option>
        </Select>
        <ErrorMessage>Choose an option.</ErrorMessage>
      </Field>
      <Field id="billing-currency">
        <Label>Currency</Label>
        <Description>Set by your first invoice. Contact us to change it.</Description>
        <Select name="currency" disabled>
          <option value="usd">US dollar</option>
          <option value="eur">Euro</option>
        </Select>
      </Field>
      <Field id="member-role">
        <Label>Role</Label>
        <Select name="role" value="editor">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="owner" disabled>
            Owner, transfer from Settings
          </option>
        </Select>
      </Field>
    </form>
  );
}
