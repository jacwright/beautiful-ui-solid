import { Button, Drawer, DrawerActions, DrawerBody, DrawerTitle, Text } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <>
      <Button commandfor="lead-details" command="show-modal">
        Details
      </Button>
      <Drawer id="lead-details">
        <DrawerTitle>Spring launch</DrawerTitle>
        <DrawerBody>
          <Text>Published 2 hours ago: 3 pages, 14 images and one form.</Text>
        </DrawerBody>
        <DrawerActions>
          <Button commandfor="lead-details" command="close">
            Close
          </Button>
        </DrawerActions>
      </Drawer>
    </>
  );
}
