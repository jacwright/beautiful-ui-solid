import { fillToast, type ToastOptions } from "beautiful-ui-solid";
import { onSettled } from "solid-js";

// The toasts are written by fillToast, as toast() writes them, in a stack that isn't a popover,
// so they show over the stage rather than in a corner. The stack names itself apart from the page's.
const toasts: ToastOptions[] = [
  { message: "Link copied" },
  {
    message: "Spring launch is live",
    description: "Published to spring.example.com.",
    tone: "success",
    action: { label: "View" },
  },
];

export default function Glass() {
  let list!: HTMLElement;
  onSettled(() => {
    for (const options of toasts) {
      const item = list.ownerDocument.createElement("beautiful-toast");
      fillToast(item, options);
      list.append(item);
    }
  });
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <beautiful-toaster ref={list} role="region" aria-label="Notifications over bright content" aria-live="polite" />
    </beautiful-demo-stage>
  );
}
