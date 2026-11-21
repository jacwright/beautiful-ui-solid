import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Field, Label, Textarea } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

/** A rule of the page's own: no links in a message. */
const noLinks = (value: string) => (/https?:\/\//.test(value) ? "Leave out links." : undefined);

/** A field whose value the page sets, as a draft loaded from a server would. */
function Draft() {
  const [draft, setDraft] = createSignal("");
  return (
    <>
      <Field id="v-draft">
        <Label>Draft</Label>
        <Textarea name="draft" maxlength={40} value={draft()} />
      </Field>
      <button type="button" onClick={() => setDraft("Line one\nLine two\nLine three\nLine four\nLine five")}>
        Load the draft
      </button>
    </>
  );
}

/** Notes which button sent the form, and stops it, so the test can read it. */
function sent(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.dataset.sent = (event.submitter as HTMLButtonElement | null)?.value || "form";
}

renderHarness("textarea", () => (
  <>
    <form id="live" onSubmit={sent}>
      <Field id="v-message">
        <Label>Message</Label>
        <Textarea name="message" maxlength={20} validate={noLinks} required />
      </Field>
      <Field id="v-short">
        <Label>Short note</Label>
        <Textarea name="short" rows={1} />
      </Field>
      <Draft />
      <button type="button" value="cancel">
        Cancel
      </button>
      <button name="action" value="send">
        Send
      </button>
      <button type="reset">Start over</button>
    </form>
    <form id="held" onSubmit={sent}>
      <Textarea name="held" aria-label="Held" />
      <fieldset disabled>
        <button value="send">Send</button>
      </fieldset>
    </form>
    <form id="own-keys" onSubmit={sent}>
      <Textarea
        name="own"
        aria-label="Own keys"
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.ctrlKey) event.preventDefault();
        }}
      />
      <button value="send">Send</button>
    </form>
    <form id="scripted" onSubmit={sent}>
      <Textarea name="scripted" aria-label="Scripted" />
      <input name="first" aria-label="First" />
      <input name="last" aria-label="Last" />
    </form>
    <Textarea name="alone" aria-label="Outside a field" maxlength={10} />
  </>
));
