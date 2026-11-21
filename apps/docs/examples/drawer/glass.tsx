import { Button, Drawer, DrawerActions, DrawerBody, DrawerDescription, DrawerTitle, Field, Input, Label } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="site-settings" command="show-modal">Site settings</Button>
      </beautiful-demo-stage>
      <Drawer id="site-settings">
        <form method="dialog">
          <DrawerTitle>Site settings</DrawerTitle>
          <DrawerDescription>Changes go live on your next publish.</DrawerDescription>
          <DrawerBody>
            <Field id="site-settings-name">
              <Label>Name</Label>
              <Input name="name" value="Spring launch" />
            </Field>
            <Field id="site-settings-tagline">
              <Label>Tagline</Label>
              <Input name="tagline" value="Fresh flowers, delivered by Friday" />
            </Field>
          </DrawerBody>
          <DrawerActions>
            <Button commandfor="site-settings" command="close">Cancel</Button>
            <Button type="submit" value="save" variant="primary">Save</Button>
          </DrawerActions>
        </form>
      </Drawer>
    </>
  );
}
