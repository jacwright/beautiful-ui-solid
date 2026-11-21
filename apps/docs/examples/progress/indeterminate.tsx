import { Description, Field, Label, Progress } from "beautiful-ui-solid";

export default function Indeterminate() {
  return (
    <Field id="site-build">
      <Label>Building Spring launch</Label>
      <Progress />
      <Description>This usually takes under a minute.</Description>
    </Field>
  );
}
