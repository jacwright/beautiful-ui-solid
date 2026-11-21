import { Description, Field, Label, Legend, Radio, RadioGroup } from "beautiful-ui-solid";

export default function Descriptions() {
  return (
    <RadioGroup id="publish-when" name="publish-when" defaultValue="now">
      <Legend>Publish changes</Legend>
      <Description>Applies to every page on the site.</Description>
      <Field id="publish-when-now">
        <Radio value="now" />
        <Label>Right away</Label>
        <Description>Visitors see a change the moment you save it.</Description>
      </Field>
      <Field id="publish-when-review">
        <Radio value="review" />
        <Label>After a teammate approves</Label>
        <Description>Each change waits in Pending until someone else on the team approves it.</Description>
      </Field>
      <Field id="publish-when-schedule">
        <Radio value="schedule" />
        <Label>On a schedule</Label>
        <Description>Changes go out together, every weekday at 9 am.</Description>
      </Field>
    </RadioGroup>
  );
}
