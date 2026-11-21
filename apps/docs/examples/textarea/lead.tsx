import { Field, Label, Textarea } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Field id="lead-reviewer-note">
      <Label>A note for reviewers</Label>
      <Textarea name="note" rows={3} placeholder="What changed, and why" />
    </Field>
  );
}
