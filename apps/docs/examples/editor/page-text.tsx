import { Editor } from "beautiful-ui-solid-editor";
import { Description, Field, Label } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

// A line of a page's text: bold, italic, code and links. Enter adds no line. Saved as HTML.
export default function PageText() {
  const [headline, setHeadline] = createSignal<unknown>("Coffee roasted <strong>this week</strong>, at your door by Friday");
  return (
    <beautiful-demo-stack>
      <Field>
        <Label>Headline</Label>
        <Editor preset="inline" format="html" value={headline()} onChange={setHeadline} placeholder="Say what the page is about" />
        <Description>The big line at the top of the home page.</Description>
      </Field>
      <p>
        <small>Saved as: {String(headline())}</small>
      </p>
    </beautiful-demo-stack>
  );
}
