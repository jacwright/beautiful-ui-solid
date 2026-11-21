import { fillToast, type ToastOptions } from "beautiful-ui-solid";
import { onSettled } from "solid-js";

// The toast is written by fillToast, as toast() writes it, in a stack that isn't a popover,
// so it shows in the page rather than in a corner. The stack names itself apart from the page's.
const toasts: ToastOptions[] = [{ message: "Spring launch was deleted", action: { label: "Undo" } }];

export default function Undo() {
  let list!: HTMLElement;
  onSettled(() => {
    for (const options of toasts) {
      const item = list.ownerDocument.createElement("beautiful-toast");
      fillToast(item, options);
      list.append(item);
    }
  });
  return <beautiful-toaster ref={list} role="region" aria-label="Notifications with an action" aria-live="polite" />;
}
