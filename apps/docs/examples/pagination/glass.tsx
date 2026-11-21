import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Pagination, Text } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="spring-versions" command="show-modal">See versions</Button>
      </beautiful-demo-stage>
      <Dialog id="spring-versions">
        <DialogTitle>Versions of Spring launch</DialogTitle>
        <DialogDescription>Every publish, newest first. Roll back to any of them.</DialogDescription>
        <DialogBody>
          <Text>
            <strong>Version 21</strong> · Pricing page and one image · 2 hours ago
          </Text>
          <Text>
            <strong>Version 20</strong> · Home page headline · Yesterday
          </Text>
          <Text>
            <strong>Version 19</strong> · New signup form · Oct 30
          </Text>
          <Text>
            <strong>Version 18</strong> · Footer links · Oct 28
          </Text>
          <Text>
            <strong>Version 17</strong> · Blog post: Spring is here · Oct 27
          </Text>
          <Pagination page={1} count={5} href={(page) => `#versions-${page}`} aria-label="Version pages" />
        </DialogBody>
        <DialogActions>
          <Button commandfor="spring-versions" command="close">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
