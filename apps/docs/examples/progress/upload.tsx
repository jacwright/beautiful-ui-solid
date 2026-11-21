import { Description, Field, Label, Progress } from "beautiful-ui-solid";

export default function Upload() {
  return (
    <Field id="photo-upload">
      <Label>Uploading 12 photos</Label>
      <Progress value={5} max={12} valueText="5 of 12" />
      <Description>About a minute left.</Description>
    </Field>
  );
}
