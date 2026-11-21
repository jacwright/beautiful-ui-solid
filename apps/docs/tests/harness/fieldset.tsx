import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Description, ErrorMessage, Field, Input, Label } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The blocks no example covers: an error and a disabled state that change, a made-up id, the
// field's own aria-describedby links, and a control outside any field.

/** A field whose error comes and goes, and which can be disabled, for the tests that change them. */
function Changing() {
  const [error, setError] = createSignal<string>();
  const [disabled, setDisabled] = createSignal(false);
  return (
    <>
      <Field id="changing" disabled={disabled()}>
        <Label>Subdomain</Label>
        <Input name="subdomain" />
        <Show when={error()}>
          <ErrorMessage>{error()}</ErrorMessage>
        </Show>
      </Field>
      <button type="button" onClick={() => setError((now) => (now ? undefined : "That subdomain is taken."))}>
        Toggle error
      </button>
      <button type="button" onClick={() => setDisabled((now) => !now)}>
        Toggle disabled
      </button>
    </>
  );
}

renderHarness("fieldset", () => (
  <section data-changing>
    <Changing />
    <Field>
      <Label>Made-up id</Label>
      <Description>Its id is unique.</Description>
      <Input name="unnamed" />
    </Field>
    <Field id="own-links">
      <Label>Bio</Label>
      <Description id="bio-help">Shown on your author page.</Description>
      <Input name="bio" aria-describedby="bio-count" />
      <ErrorMessage>Keep it under 160 characters.</ErrorMessage>
      <p id="bio-count">164 of 160</p>
    </Field>
    <Input name="alone" aria-label="Outside a field" />
  </section>
));
