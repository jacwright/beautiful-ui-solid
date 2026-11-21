import { Button, Description, Field, Label, Select } from "beautiful-ui-solid";

export default function Checking() {
  return (
    <form class="demo-form" onSubmit={(event) => event.preventDefault()}>
      <Field>
        <Label>Plan</Label>
        <Description>You can change plans at any time.</Description>
        <Select name="plan" placeholder="Choose a plan" required>
          <option value="starter">Starter, $9 a month</option>
          <option value="pro">Pro, $29 a month</option>
          <option value="business">Business, $99 a month</option>
        </Select>
      </Field>
      <Field>
        <Label>Billing</Label>
        <Select name="billing" value="yearly">
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly, two months free</option>
        </Select>
      </Field>
      <footer>
        <Button type="submit" variant="primary" color="accent">
          Upgrade
        </Button>
      </footer>
    </form>
  );
}
