import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Description, Field, Label, Legend, Radio, RadioGroup } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples of Radio (examples/radio/) come first, from renderHarness. The blocks after them are for the tests
// that hold a value, send and reset a form.

const Option = (props: { id: string; value: string; label: string; description?: string; disabled?: boolean }) => (
  <Field id={props.id}>
    <Radio value={props.value} disabled={props.disabled} />
    <Label>{props.label}</Label>
    {props.description && <Description>{props.description}</Description>}
  </Field>
);

function Controlled() {
  const [plan, setPlan] = createSignal("monthly");
  return (
    <>
      <form id="plan-form">
        <RadioGroup id="plan" name="plan" value={plan()} onChange={setPlan}>
          <Legend>Plan</Legend>
          <Option id="plan-monthly" value="monthly" label="Monthly" />
          <Option id="plan-yearly" value="yearly" label="Yearly" />
        </RadioGroup>
        <button type="reset">Reset plan</button>
      </form>
      <output id="plan-now">{plan()}</output>
      <button type="button" onClick={() => setPlan("yearly")}>
        Choose yearly
      </button>
    </>
  );
}

function Requiring() {
  const [required, setRequired] = createSignal(true);
  return (
    <form id="req-form">
      <RadioGroup id="req" name="req" required={required()}>
        <Legend>Contact by</Legend>
        <Option id="req-email" value="email" label="Email" />
        <Option id="req-phone" value="phone" label="Phone" />
      </RadioGroup>
      <button>Send contact</button>
      <button type="button" onClick={() => setRequired(false)}>
        Stop requiring
      </button>
    </form>
  );
}

/** A page that refuses every choice: the group shows what the page holds. */
function Refusing() {
  return (
    <RadioGroup id="locked" name="locked" value="monthly" onChange={() => {}}>
      <Legend>Locked plan</Legend>
      <Option id="locked-monthly" value="monthly" label="Locked monthly" />
      <Option id="locked-yearly" value="yearly" label="Locked yearly" />
    </RadioGroup>
  );
}

const [heard, setHeard] = createSignal<string[]>([]);

renderHarness("radio", () => (
  <>
    <beautiful-example data-example="controlled">
      <Controlled />
    </beautiful-example>
    <beautiful-example data-example="refusing">
    <Refusing />
  </beautiful-example>
  <beautiful-example data-example="requiring">
      <Requiring />
    </beautiful-example>
    <beautiful-example data-example="send">
      <form id="send-form">
        <RadioGroup id="send-role" name="role" required>
          <Legend>Role</Legend>
          <Option id="send-editor" value="editor" label="Editor" />
          <Option id="send-owner" value="owner" label="Owner" />
        </RadioGroup>
        <RadioGroup id="send-size" name="size" defaultValue="m" onChange={(value) => setHeard((now) => [...now, value])}>
          <Legend>Size</Legend>
          <Option id="send-s" value="s" label="Small" />
          <Option id="send-m" value="m" label="Medium" />
          <Option id="send-l" value="l" label="Large" />
        </RadioGroup>
        <button>Invite</button>
        <button type="reset">Reset</button>
      </form>
      <output id="sent" />
      <output id="heard">{JSON.stringify(heard())}</output>
    </beautiful-example>
  </>
));

// The send form shows what it would send, instead of leaving the page.
for (const id of ["send-form", "req-form"]) {
  document.getElementById(id)!.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    document.getElementById("sent")!.textContent = JSON.stringify([...data]);
  });
}
