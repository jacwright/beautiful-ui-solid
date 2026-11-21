import { Button, Drawer, DrawerBody, DrawerDescription, DrawerTitle } from "beautiful-ui-solid";

export default function Activity() {
  return (
    <>
      <Button commandfor="activity" command="show-modal">Activity</Button>
      <Drawer id="activity" size="sm">
        <DrawerTitle>Activity</DrawerTitle>
        <DrawerDescription>Everything that changed on Spring launch this week.</DrawerDescription>
        <DrawerBody>
          <h3>Today</h3>
          <p>Sam published 3 changes: the home page, the pricing page and one image.</p>
          <p>A visitor sent the contact form.</p>
          <h3>Yesterday</h3>
          <p>The writer agent drafted a post, Spring arrangements under $40, and asked for a review.</p>
          <p>Sam renamed the site from Spring sale to Spring launch.</p>
          <p>The preview for the pricing branch got its own link.</p>
          <h3>Monday</h3>
          <p>A scheduled release went live at 9:00.</p>
          <p>Two broken links showed up after the deploy, both on the about page.</p>
          <p>Sam fixed both links and published again.</p>
          <h3>Sunday</h3>
          <p>The asset library took 12 new photos.</p>
          <p>A redirect from /sale to /spring matched 140 visits.</p>
        </DrawerBody>
      </Drawer>
    </>
  );
}
