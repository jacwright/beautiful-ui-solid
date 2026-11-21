import { Badge, Button, Card, Description, Field, Heading, Input, Label, Switch, Text } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <beautiful-demo-stage>
      <Card as="form" aria-labelledby="home-site-title" onSubmit={(event) => event.preventDefault()}>
        <hgroup>
          <Heading level={3} id="home-site-title">
            Spring launch <Badge color="green" dot>Live</Badge>
          </Heading>
          <Text>springlaunch.com</Text>
        </hgroup>
        <Field>
          <Label>Site name</Label>
          <Input name="name" value="Spring launch" />
        </Field>
        <Field>
          <Switch name="comments" checked />
          <Label>Comments on posts</Label>
          <Description>Visitors sign in with their email to comment.</Description>
        </Field>
        <footer>
          <Button type="button" variant="tertiary">Cancel</Button>
          <Button type="submit" variant="primary">Save</Button>
        </footer>
      </Card>
    </beautiful-demo-stage>
  );
}
