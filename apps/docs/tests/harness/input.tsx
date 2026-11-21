import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { DatePicker, Description, ErrorMessage, Field, Input, Label } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The examples in examples/input/, then the blocks for the tests that type, send and reset.

/** A password rule of the page's own: 12 characters, with a letter and a number. */
const passwordRule = (value: string) =>
  !/[a-z]/i.test(value) || !/\d/.test(value) ? "Mix letters and numbers." : undefined;

/** A field whose error the page sets, as a server's answer would. */
function Taken() {
  const [taken, setTaken] = createSignal(false);
  return (
    <>
      <Field id="taken">
        <Label>Subdomain</Label>
        <Input name="subdomain" required />
        <Show when={taken()}>
          <ErrorMessage>That subdomain is taken.</ErrorMessage>
        </Show>
      </Field>
      <button type="button" onClick={() => setTaken((now) => !now)}>
        Toggle taken
      </button>
    </>
  );
}

renderHarness("input", () => (
  <>
    <form data-validating>
      <Field id="v-email">
        <Label>Email</Label>
        <Input type="email" name="email" required />
      </Field>
      <Field id="v-website">
        <Label>Website</Label>
        <Input type="url" name="website" />
      </Field>
      <Field id="v-password">
        <Label>Password</Label>
        <Description>12 characters or more, with letters and numbers.</Description>
        <Input type="password" name="password" minlength="12" validate={passwordRule} required />
      </Field>
      <Field id="v-seats">
        <Label>Seats</Label>
        <Input type="number" name="seats" min="5" step="5" value="5" />
      </Field>
      <Field id="v-phone">
        <Label>Phone</Label>
        <Input type="tel" name="phone" country="US" />
      </Field>
      <Field id="v-phone-nz">
        <Label>Phone in New Zealand</Label>
        <Input type="tel" name="phone-nz" country="NZ" />
      </Field>
      <Field id="v-launch">
        <Label>Launch date</Label>
        <Description>Any day in November or December 2026.</Description>
        <DatePicker name="launch" value="2026-11-20" min="2026-11-01" max="2026-12-31" locale="en-US" required />
      </Field>
      <Field id="v-renewal">
        <Label>Renewal date in the UK</Label>
        <DatePicker name="renewal" locale="en-GB" />
      </Field>
      <Taken />
      <button>Save</button>
      <button type="reset">Start over</button>
    </form>
    <Input name="alone" aria-label="Outside a field" required />
  </>
));
