import { Button, Field, Input, Label, Select } from "beautiful-ui-solid";

export default function Row() {
  return (
    <form class="demo-fields-row">
      <Field id="redirect-from">
        <Label>From</Label>
        <Input name="from" value="/summer" />
      </Field>
      <Field id="redirect-kind">
        <Label>Kind</Label>
        <Select name="status">
          <option value="301">Permanent, 301</option>
          <option value="302">Temporary, 302</option>
        </Select>
      </Field>
      <Button type="submit" variant="primary" color="accent">
        Add redirect
      </Button>
    </form>
  );
}
