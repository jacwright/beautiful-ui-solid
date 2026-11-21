import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Field, Label, Textarea } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Textarea class="demo-note" name="note" aria-label="Note on this page" placeholder="Jot a note on this page" />
        <Button commandfor="reply" command="show-modal">Reply to Maya</Button>
      </beautiful-demo-stage>
      <Dialog id="reply">
        <form method="dialog">
          <DialogTitle>Reply to Maya Chen</DialogTitle>
          <DialogDescription>Your reply goes to maya@northwind.example, from the site's address.</DialogDescription>
          <DialogBody>
            <Field id="reply-message">
              <Label>Message</Label>
              <Textarea
                name="message"
                rows={5}
                required
                value="Hi Maya, group pricing starts at five seats. I've sent the details to your email, and I'm happy to set up a call this week."
              />
            </Field>
          </DialogBody>
          <DialogActions>
            <Button commandfor="reply" command="close">Cancel</Button>
            <Button type="submit" value="send" variant="primary" color="accent">Send reply</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
