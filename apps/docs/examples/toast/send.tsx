import { Button, Dialog, DialogActions, DialogDescription, DialogTitle, toast } from "beautiful-ui-solid";

// These send real toasts to the page's Toaster, which is once near the root of the app.
export default function Send() {
  const copied = () => toast("Link copied");
  const deleted = () =>
    toast({
      message: "Spring launch was deleted",
      action: { label: "Undo", onClick: () => toast({ message: "Spring launch is back", tone: "success" }) },
    });
  function publish() {
    const shown = toast({ message: "Publishing Spring launch…", duration: Number.POSITIVE_INFINITY });
    setTimeout(
      () =>
        shown.update({
          message: "Spring launch is live",
          description: "Published to spring.example.com.",
          tone: "success",
          action: { label: "View" },
        }),
      1500,
    );
  }
  const failed = () =>
    toast({
      message: "Couldn't publish Spring launch",
      description: "The contact form has no submit button.",
      tone: "danger",
      action: { label: "Show me" },
    });

  return (
    <>
      <Button onClick={copied}>Copy link</Button>
      <Button onClick={deleted}>Delete site</Button>
      <Button onClick={publish}>Publish</Button>
      <Button onClick={failed}>Fail to publish</Button>
      <Button commandfor="toast-share" command="show-modal">Open a dialog</Button>
      <Dialog id="toast-share" closedby="any">
        <DialogTitle>Share Spring launch</DialogTitle>
        <DialogDescription>Anyone with the link can see it. It isn't listed anywhere.</DialogDescription>
        <DialogActions>
          <Button commandfor="toast-share" command="close">Done</Button>
          <Button variant="primary" color="accent" onClick={copied}>
            Copy link
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
