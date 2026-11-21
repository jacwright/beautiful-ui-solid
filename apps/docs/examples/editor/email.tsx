import { Editor } from "beautiful-ui-solid-editor";
import { Field, Label } from "beautiful-ui-solid";

const welcome = `<p>Hi Sam,</p><p>Thanks for joining <strong>Harbor Coffee</strong>. Your first bag ships on Monday, and here is what happens next:</p><ul><li><p>We roast it the Friday before, so it's at its best when it lands.</p></li><li><p>You can skip or change a delivery from <a href="https://example.com/account">your account</a>.</p></li></ul><p>See you soon,<br>Ava</p>`;

// An email: paragraphs, lists, quotes and links, with the fixed toolbar over the text.
export default function Email() {
  return (
    <Field>
      <Label>Message</Label>
      <Editor preset="text" format="html" value={welcome} menus={{ toolbar: true }} />
    </Field>
  );
}
