import {
  Button,
  Description,
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
  Field,
  Label,
  Switch,
} from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="site-settings" command="show-modal">Site settings</Button>
      </beautiful-demo-stage>
      <Dialog id="site-settings">
        <form method="dialog">
          <DialogTitle>Spring launch settings</DialogTitle>
          <DialogDescription>Changes take effect on the next publish.</DialogDescription>
          <DialogBody>
            <Field id="search-engines">
              <Label>Show in search results</Label>
              <Description>Lets Google and Bing list the site's pages.</Description>
              <Switch name="indexed" checked />
            </Field>
            <Field id="site-comments">
              <Label>Comments on posts</Label>
              <Description>Each comment waits for you to approve it.</Description>
              <Switch name="comments" />
            </Field>
            <Field id="site-analytics">
              <Label>Count visits</Label>
              <Switch name="analytics" checked />
            </Field>
          </DialogBody>
          <DialogActions>
            <Button commandfor="site-settings" command="close">Cancel</Button>
            <Button type="submit" value="save" variant="primary" color="accent">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
