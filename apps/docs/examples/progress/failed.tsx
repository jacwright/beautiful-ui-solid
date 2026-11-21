import { ErrorMessage, Field, Label, Progress } from "beautiful-ui-solid";

export default function Failed() {
  return (
    <Field id="photo-retry">
      <Label>Uploading 12 photos</Label>
      <Progress value={7} max={12} valueText="7 of 12" />
      <ErrorMessage>The connection dropped after 7 photos. Try again to send the other 5.</ErrorMessage>
    </Field>
  );
}
