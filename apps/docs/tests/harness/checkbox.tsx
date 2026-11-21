import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Checkbox, Field, Label } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

// The docs examples, then a block for the tests that send and reset a form.

renderHarness("checkbox", () => (
  <beautiful-example data-example="send">
    <form id="send-form">
      <Field id="send-terms">
        <Checkbox name="terms" value="yes" required />
        <Label>I agree to the Terms of Service</Label>
      </Field>
      <Field id="send-news">
        <Checkbox name="news" defaultChecked />
        <Label>Send me product news</Label>
      </Field>
      <button>Create site</button>
      <button type="reset">Reset</button>
    </form>
    <output id="sent" />
    <Field id="stays-mixed">
      <Checkbox indeterminate />
      <Label>Stays mixed</Label>
    </Field>
  </beautiful-example>
));

// The send form shows what it would send, instead of leaving the page.
document.getElementById("send-form")!.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget as HTMLFormElement);
  document.getElementById("sent")!.textContent = JSON.stringify([...data]);
});
