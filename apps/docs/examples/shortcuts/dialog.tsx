import { type ActionList, ariaKeys, Button, Dialog, DialogActions, DialogBody, DialogTitle, Field, Label, shortcuts, Text, Switch } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

/** An open dialog is a wall: the page's N doesn't reach into it, and its ⌘S works only inside it. */
export default function DialogWall() {
  const [said, say] = createSignal("Press N for a new site. Open the settings: N does nothing there, and ⌘S saves.");
  let dialog: HTMLDialogElement | undefined;

  const sites: ActionList = [{ id: "new-site", label: "New site", keys: "N", run: () => say("Started a new site.") }];
  const save = () => {
    say("Saved the settings.");
    dialog?.close();
  };
  const settings: ActionList = [{ id: "save", label: "Save", keys: "Mod+S", run: save }];

  return (
    <beautiful-demo-stack ref={shortcuts(sites, undefined, { label: "Sites" })}>
      <Button commandfor="shortcuts-settings" command="show-modal" aria-keyshortcuts="N">
        Site settings
      </Button>
      <Dialog
        id="shortcuts-settings"
        ref={(el: HTMLDialogElement) => {
          dialog = el;
          shortcuts(settings, undefined, { label: "Settings" })(el);
        }}
      >
        <DialogTitle>Site settings</DialogTitle>
        <DialogBody>
          <Field id="shortcuts-search">
            <Label>Show in search engines</Label>
            <Switch name="search" checked />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button commandfor="shortcuts-settings" command="close">
            Cancel
          </Button>
          <Button variant="primary" aria-keyshortcuts={ariaKeys("Mod+S")} onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Text role="status">{said()}</Text>
    </beautiful-demo-stack>
  );
}
