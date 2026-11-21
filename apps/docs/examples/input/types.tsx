import { Field, Input, Label } from "beautiful-ui-solid";

export default function Types() {
  return (
    <form>
      <Field id="visits-goal">
        <Label>Monthly visits goal</Label>
        <Input type="number" name="goal" value="5000" min="0" step="500" inputmode="numeric" autocomplete="off" />
      </Field>
      <Field id="support-phone">
        <Label>
          Support phone <small>Optional</small>
        </Label>
        <Input type="tel" name="phone" placeholder="+1 555 010 0199" autocomplete="off" />
      </Field>
    </form>
  );
}
