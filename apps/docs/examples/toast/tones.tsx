import { fillToast, type ToastOptions } from "beautiful-ui-solid";
import { onSettled } from "solid-js";

// The toasts are written by fillToast, as toast() writes them, in a stack that isn't a popover,
// so they show in the page rather than in a corner. The stack names itself apart from the page's.
const toasts: ToastOptions[] = [
  { message: "Changes saved" },
  { message: "Domain connected", description: "springlaunch.com now points at Spring launch.", tone: "success" },
  {
    message: "Couldn't publish Spring launch",
    description: "The contact form has no submit button.",
    tone: "danger",
    action: { label: "Show me" },
  },
];

export default function Tones() {
  let list!: HTMLElement;
  onSettled(() => {
    for (const options of toasts) {
      const item = list.ownerDocument.createElement("beautiful-toast");
      fillToast(item, options);
      list.append(item);
    }
  });
  return <beautiful-toaster ref={list} role="region" aria-label="Notifications in each tone" aria-live="polite" />;
}
