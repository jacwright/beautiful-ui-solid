import { Button, Card, Checkbox, Field, Fieldset, Heading, Label, Text } from "beautiful-ui-solid";

export default function Settings() {
  return (
    <Card as="form" aria-labelledby="notify-title">
      <hgroup>
        <Heading level={3} id="notify-title">
          Notifications
        </Heading>
        <Text>The emails go to the address you sign in with.</Text>
      </hgroup>
      <Fieldset aria-labelledby="notify-title">
        <Field id="card-notify-form">
          <Checkbox name="notify" value="form" checked />
          <Label>A visitor sends a form</Label>
        </Field>
        <Field id="card-notify-payment">
          <Checkbox name="notify" value="payment" checked />
          <Label>A payment fails</Label>
        </Field>
        <Field id="card-notify-weekly">
          <Checkbox name="notify" value="weekly" />
          <Label>Every Monday, with last week's visits</Label>
        </Field>
      </Fieldset>
      <footer>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </footer>
    </Card>
  );
}
