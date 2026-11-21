import { Field, Label, Legend, Radio, RadioGroup } from "beautiful-ui-solid";

export default function Group() {
  return (
    <RadioGroup id="visibility" name="visibility" defaultValue="anyone">
      <Legend>Who can see Spring launch</Legend>
      <Field id="visibility-anyone">
        <Radio value="anyone" />
        <Label>Anyone with the link</Label>
      </Field>
      <Field id="visibility-team">
        <Radio value="team" />
        <Label>Only the team</Label>
      </Field>
      <Field id="visibility-me">
        <Radio value="me" />
        <Label>Only me</Label>
      </Field>
    </RadioGroup>
  );
}
