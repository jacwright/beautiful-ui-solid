import { Editor } from "beautiful-ui-solid-editor";
import { Field, Label } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Field>
      <Label>Page title</Label>
      <Editor preset="inline" format="html" value="Coffee roasted <strong>this week</strong>" placeholder="The page's title" />
    </Field>
  );
}
