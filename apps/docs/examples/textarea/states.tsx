import { Description, ErrorMessage, Field, Label, Textarea } from "beautiful-ui-solid";

export default function States() {
  return (
    <form>
      <Field id="cancel-reason">
        <Label>Why are you cancelling?</Label>
        <Textarea name="reason" maxlength={500} required />
        <ErrorMessage>Fill this in.</ErrorMessage>
      </Field>
      <Field id="visitor-message">
        <Label>Message from the visitor</Label>
        <Description>Sent through the contact form on November 2.</Description>
        <Textarea
          name="message"
          readonly
          value="Do you have group pricing? We're a team of eight and would like to move our three sites over before the spring launch."
        />
      </Field>
      <Field id="internal-notes">
        <Label>Internal notes</Label>
        <Description>Only an owner can edit notes.</Description>
        <Textarea name="notes" disabled value="Moved from the old host in October." />
      </Field>
    </form>
  );
}
