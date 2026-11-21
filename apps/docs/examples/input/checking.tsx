import { Button, Description, Field, Input, Label } from "beautiful-ui-solid";

/** A password rule of the page's own. minlength checks the length first. */
const passwordRule = (value: string) =>
  !/[a-z]/i.test(value) || !/\d/.test(value) ? "Mix letters and numbers." : undefined;

export default function Checking() {
  return (
    <form class="demo-form" onSubmit={(event) => event.preventDefault()}>
      <Field>
        <Label>Email</Label>
        <Input type="email" name="email" autocomplete="email" required />
      </Field>
      <Field>
        <Label>
          Website <small>Optional</small>
        </Label>
        <Description>Type it as you like: springlaunch.com gets its https://.</Description>
        <Input type="url" name="website" autocomplete="url" />
      </Field>
      <Field>
        <Label>Password</Label>
        <Description>12 characters or more, with letters and numbers.</Description>
        <Input type="password" name="password" autocomplete="new-password" minlength="12" validate={passwordRule} required />
      </Field>
      <footer>
        <Button type="submit" variant="primary" color="accent">
          Create account
        </Button>
      </footer>
    </form>
  );
}
