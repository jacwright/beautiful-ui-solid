import { Field, Label, Legend, Radio, RadioGroup } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <RadioGroup id="lead-publish" name="lead-publish" defaultValue="now">
      <Legend>Publish changes</Legend>
      <Field id="lead-publish-now">
        <Radio value="now" />
        <Label>Now</Label>
      </Field>
      <Field id="lead-publish-later">
        <Radio value="later" />
        <Label>At a time I pick</Label>
      </Field>
    </RadioGroup>
  );
}
