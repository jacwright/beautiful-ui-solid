import { Button, Description, Field, Label, Textarea } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";

export default function Reply() {
  const [sent, setSent] = createSignal(false);
  return (
    <form
      class="demo-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
      onInput={() => setSent(false)}
    >
      <Field>
        <Label>Reply to Maya</Label>
        <Description>Press ⌘ + Enter, or Ctrl + Enter, to send it.</Description>
        <Textarea name="message" maxlength={280} required />
      </Field>
      <footer>
        <Show when={sent()}>
          <p role="status" class="demo-sent">Sent.</p>
        </Show>
        <Button type="submit" variant="primary" color="accent">
          Send reply
        </Button>
      </footer>
    </form>
  );
}
