import type { JSX } from "@solidjs/web";
import { omit, onSettled } from "solid-js";
import { forward } from "./popover.tsx";
import { wireToaster } from "./toaster.ts";

/**
 * Toaster: the stack toasts show in, once near the root of the app. A
 * <beautiful-toaster popover="manual" role="region" aria-live="polite">, which toaster.ts keeps open in the top
 * layer and wires: timers, keys, the glide, the swipe, and following a modal dialog. toast()
 * from anywhere shows one in it. The spec is the docs site's Toast page.
 */

export type ToastPlacement = "bottom end" | "bottom" | "bottom start" | "top end" | "top" | "top start";

export type ToasterProps = Omit<JSX.HTMLAttributes<HTMLElement>, "popover" | "children"> & {
  /** The edge, then the end of it. End is the right in a left-to-right language. */
  placement?: ToastPlacement;
  /** The stack's name, read when focus moves into it. */
  label?: string;
};

export function Toaster(props: ToasterProps) {
  const rest = omit(props, "placement", "label");
  const placement = () => (props.placement === "bottom end" ? undefined : props.placement);
  let list!: HTMLElement;

  // In onSettled, not the ref: a ref can run on a copy in another document, and this listens on the page's.
  onSettled(() => wireToaster(list));

  return (
    <beautiful-toaster
      {...rest}
      ref={(el) => {
        list = el;
        forward(props.ref, el);
      }}
      popover="manual"
      role="region"
      data-placement={placement()}
      aria-label={props.label ?? "Notifications"}
      aria-live="polite"
    />
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-toaster": HTMLAttributes<HTMLElement>;
    }
  }
}
