import { Description, Field, Input, Label } from "beautiful-ui-solid";

export default function Fields() {
  return (
    <form>
      <Field id="site-name">
        <Label>Site name</Label>
        <Input name="name" value="Spring launch" autocomplete="off" />
      </Field>
      <Field id="owner-email">
        <Label>Owner's email</Label>
        <Description>We send receipts and sign-in links here.</Description>
        <Input type="email" name="email" placeholder="you@example.com" autocomplete="email" />
      </Field>
      <Field id="new-password">
        <Label>Password</Label>
        <Input type="password" name="password" autocomplete="new-password" />
      </Field>
    </form>
  );
}
