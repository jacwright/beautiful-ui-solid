import { Description, Field, Label, Progress } from "beautiful-ui-solid";

export default function Percent() {
  return (
    <>
      <Field id="contact-import">
        <Label>Importing contacts</Label>
        <Progress value={42} max={100} />
      </Field>
      <Field id="image-resize">
        <Label>Resizing images</Label>
        <Progress value={100} max={100} />
        <Description>Done. Every image has a phone and a desktop size.</Description>
      </Field>
    </>
  );
}
