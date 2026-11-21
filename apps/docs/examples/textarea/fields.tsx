import { Description, Field, Label, Textarea } from "beautiful-ui-solid";

export default function Fields() {
  return (
    <form>
      <Field id="search-description">
        <Label>Search description</Label>
        <Description>Search results show it under the page's title.</Description>
        <Textarea
          name="description"
          maxlength={160}
          value="Spring launch pages, pricing and sign-up for the new season. Free for the first month."
        />
      </Field>
      <Field id="team-note">
        <Label>
          Note to the team <small>Optional</small>
        </Label>
        <Textarea name="note" placeholder="What changed, and why" />
      </Field>
    </form>
  );
}
