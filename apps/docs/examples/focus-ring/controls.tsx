import { Button, Checkbox, Field, Input, Label, Legend, Link, Radio, RadioGroup } from "beautiful-ui-solid";

export default function Controls() {
  return (
    <beautiful-demo-stack>
      <p>Your site is live at <Link href="#focus-ring">spring-launch.example.com</Link>. Rename it or change who can see it.</p>
      <Field id="focus-site-name">
        <Label>Site name</Label>
        <Input name="site-name" value="Spring launch" />
      </Field>
      <RadioGroup id="focus-visibility" name="visibility" defaultValue="anyone">
        <Legend>Who can see it</Legend>
        <Field id="focus-anyone">
          <Radio value="anyone" />
          <Label>Anyone with the link</Label>
        </Field>
        <Field id="focus-team">
          <Radio value="team" />
          <Label>Only the team</Label>
        </Field>
      </RadioGroup>
      <Field id="focus-index">
        <Checkbox name="index" checked />
        <Label>Let search engines list it</Label>
      </Field>
      <beautiful-demo-row>
        <Button variant="tertiary">Cancel</Button>
        <Button>Preview</Button>
        <Button variant="primary" color="accent">Save changes</Button>
      </beautiful-demo-row>
    </beautiful-demo-stack>
  );
}
