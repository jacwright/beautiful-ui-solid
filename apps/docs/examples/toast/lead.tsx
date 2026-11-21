import { fillToast } from "beautiful-ui-solid";
import { onSettled } from "solid-js";

// The toast is written by fillToast, as toast() writes it, in a stack that isn't a popover,
// so it shows in the page rather than in a corner. The stack names itself apart from the page's.
export default function Lead() {
  let list!: HTMLElement;
  onSettled(() => {
    const item = list.ownerDocument.createElement("beautiful-toast");
    fillToast(item, {
      message: "Spring launch is live",
      description: "Published to spring.example.com.",
      tone: "success",
      action: { label: "View" },
    });
    list.append(item);
  });
  return <beautiful-toaster ref={list} role="region" aria-label="A notification" aria-live="polite" />;
}
