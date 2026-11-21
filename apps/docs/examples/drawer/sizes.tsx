import { Button, Drawer, DrawerActions, DrawerTitle } from "beautiful-ui-solid";

export default function Sizes() {
  return (
    <>
      <beautiful-demo-row>
        <Button commandfor="drawer-sm" command="show-modal">Small</Button>
        <Button commandfor="drawer-md" command="show-modal">Medium</Button>
        <Button commandfor="drawer-lg" command="show-modal">Large</Button>
      </beautiful-demo-row>
      <Drawer id="drawer-sm" size="sm">
        <DrawerTitle>Small, 20rem</DrawerTitle>
        <DrawerActions>
          <Button commandfor="drawer-sm" command="close">Close</Button>
        </DrawerActions>
      </Drawer>
      <Drawer id="drawer-md" size="md">
        <DrawerTitle>Medium, 28rem</DrawerTitle>
        <DrawerActions>
          <Button commandfor="drawer-md" command="close">Close</Button>
        </DrawerActions>
      </Drawer>
      <Drawer id="drawer-lg" size="lg">
        <DrawerTitle>Large, 40rem</DrawerTitle>
        <DrawerActions>
          <Button commandfor="drawer-lg" command="close">Close</Button>
        </DrawerActions>
      </Drawer>
    </>
  );
}
