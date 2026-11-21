import { Button, Drawer, DrawerBody, DrawerTitle } from "beautiful-ui-solid";

export default function Sides() {
  return (
    <>
      <beautiful-demo-row>
        <Button commandfor="side-start" command="show-modal">Start</Button>
        <Button commandfor="side-end" command="show-modal">End</Button>
        <Button commandfor="side-top" command="show-modal">Top</Button>
        <Button commandfor="side-bottom" command="show-modal">Bottom</Button>
      </beautiful-demo-row>
      <Drawer id="side-start" side="start">
        <DrawerTitle>From the start</DrawerTitle>
        <DrawerBody>
          <p>The left edge in a left-to-right language. A side drawer is the screen's full height.</p>
        </DrawerBody>
      </Drawer>
      <Drawer id="side-end" side="end">
        <DrawerTitle>From the end</DrawerTitle>
        <DrawerBody>
          <p>The right edge in a left-to-right language, and the default.</p>
        </DrawerBody>
      </Drawer>
      <Drawer id="side-top" side="top">
        <DrawerTitle>From the top</DrawerTitle>
        <DrawerBody>
          <p>The screen's full width, and as tall as what it holds.</p>
        </DrawerBody>
      </Drawer>
      <Drawer id="side-bottom" side="bottom">
        <DrawerTitle>From the bottom</DrawerTitle>
        <DrawerBody>
          <p>In reach of a thumb on a phone. It clears the home indicator.</p>
        </DrawerBody>
      </Drawer>
    </>
  );
}
