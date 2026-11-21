import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { buildSchema, Editor, type EditorHandle, fromHTML, parse, presets, serialize, toHTML } from "beautiful-ui-solid-editor";
import { markdown } from "beautiful-ui-solid-editor/markdown";
import { Description, Field, Label } from "beautiful-ui-solid";
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { embeds, fakeUpload } from "../../src/pages/editor-live.tsx";

// One editor per preset, with their handles and the formats on window for the spec to drive, and
// each one's last saved value shown, as an app would store it.

declare global {
  interface Window {
    editors: Record<string, EditorHandle>;
    formats: {
      /** Reads a value in a format into the preset's schema and writes it back out. */
      roundTrip(preset: "inline" | "text" | "post", value: unknown, format: "json" | "html" | "markdown" | "text", to?: "json" | "html" | "markdown" | "text"): unknown;
      /** The HTML the schema keeps of some HTML. */
      cleanHTML(preset: "inline" | "text" | "post", html: string): string;
    };
  }
}

window.editors = {};
const schemas = { inline: buildSchema(presets.inline), text: buildSchema(presets.text), post: buildSchema(presets.post) };
window.formats = {
  roundTrip: (preset, value, format, to = format) => serialize(parse(value, format, schemas[preset], markdown), to, markdown),
  cleanHTML: (preset, html) => toHTML(fromHTML(html, schemas[preset])),
};

function Saved(props: { name: string; value: unknown }) {
  return (
    <output id={`${props.name}-saved`}>{typeof props.value === "string" ? props.value : JSON.stringify(props.value)}</output>
  );
}

function App() {
  const [inline, setInline] = createSignal<unknown>("Coffee roasted <strong>this week</strong>");
  const [text, setText] = createSignal<unknown>("<p>Hi Sam,</p><p>Thanks for joining.</p>");
  const [post, setPost] = createSignal<unknown>("## Fridays\n\nRoasted on Friday, at your door by Monday.\n");
  return (
    <>
      <beautiful-example data-example="inline">
        <Field>
          <Label>Headline</Label>
          <Editor preset="inline" format="html" value={inline()} onChange={setInline} ref={(h) => (window.editors.inline = h)} placeholder="Say what the page is about" />
          <Description>The big line at the top of the home page.</Description>
        </Field>
        <Saved name="inline" value={inline()} />
      </beautiful-example>
      <beautiful-example data-example="text">
        <Field>
          <Label>Message</Label>
          <Editor preset="text" format="html" value={text()} onChange={setText} menus={{ toolbar: true }} ref={(h) => (window.editors.text = h)} />
        </Field>
        <Saved name="text" value={text()} />
      </beautiful-example>
      <beautiful-example data-example="post">
        <Editor
          preset="post"
          format="markdown"
          value={post()}
          onChange={setPost}
          upload={fakeUpload}
          embeds={embeds}
          aria-label="Post"
          ref={(h) => (window.editors.post = h)}
        />
        <Saved name="post" value={post()} />
      </beautiful-example>
      <beautiful-example data-example="read-only">
        <Editor preset="text" format="html" value="<p>Read only.</p>" readOnly aria-label="Notes" />
      </beautiful-example>
    </>
  );
}

render(() => <App />, document.getElementById("app")!);
