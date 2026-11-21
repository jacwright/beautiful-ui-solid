import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Toaster, toast } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

// The docs examples, then the Solid Toaster the tests send toasts to through window.toast, a dialog
// to send them from, and a log of actions run.

declare global {
  interface Window {
    toast: typeof toast;
    log: string[];
  }
}
window.toast = toast;
window.log = [];

renderHarness("toast", () => (
  <>
    <Button id="before">Before</Button>
    <Button id="open-dialog" commandfor="share" command="show-modal">
      Share
    </Button>
    <dialog id="share" aria-labelledby="share-title">
      <h2 id="share-title">Share Spring launch</h2>
      <footer>
        <Button commandfor="share" command="close">
          Done
        </Button>
        <Button id="copy" onClick={() => toast("Link copied")}>
          Copy link
        </Button>
      </footer>
    </dialog>
    <Toaster id="stack" />
  </>
));
