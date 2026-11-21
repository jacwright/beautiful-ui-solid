import { Description, ErrorMessage, Field, Input, Label } from "beautiful-ui-solid";

export default function States() {
  return (
    <form>
      <Field id="custom-domain">
        <Label>Custom domain</Label>
        <Description>The address visitors type, such as springlaunch.com.</Description>
        <Input name="domain" value="springlaunch" />
        <ErrorMessage>Add the ending, such as .com or .org.</ErrorMessage>
      </Field>
      <Field id="site-address">
        <Label>Site address</Label>
        <Description>Set when the site was made. It can't change.</Description>
        <Input name="address" value="spring-launch.example.com" readonly />
      </Field>
      <Field id="team-name">
        <Label>Team name</Label>
        <Description>Only an owner can rename the team.</Description>
        <Input name="team" value="Northwind" disabled />
      </Field>
    </form>
  );
}
