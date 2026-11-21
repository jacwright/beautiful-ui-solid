import { Button, Field, Label, Legend, Radio, RadioGroup } from "beautiful-ui-solid";

/** Send with nothing chosen: the group shows its error and focus goes to the first option. */
export default function Error() {
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <RadioGroup id="role" name="role" required>
        <Legend>Role</Legend>
        <Field id="role-editor">
          <Radio value="editor" />
          <Label>Editor</Label>
        </Field>
        <Field id="role-owner">
          <Radio value="owner" />
          <Label>Owner</Label>
        </Field>
      </RadioGroup>
      <Button type="submit" variant="primary">Send</Button>
    </form>
  );
}
