import type { JSX } from "@solidjs/web";

/**
 * ButtonGroup: buttons joined into one control, in a <beautiful-button-group role="group">. It
 * adds no behavior: each Button inside does its own action and takes its own Tab stop. The look
 * is CSS (styles/elements/button-group.css). The spec is the docs site's Button group page.
 */

/** A group is named, so a screen reader says what its buttons are for: by aria-label or by aria-labelledby. */
type Named =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

export type ButtonGroupProps = Omit<JSX.HTMLAttributes<HTMLElement>, "role" | "aria-label" | "aria-labelledby"> & Named;

export function ButtonGroup(props: ButtonGroupProps) {
  return <beautiful-button-group {...props} role="group" />;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-button-group": HTMLAttributes<HTMLElement>;
    }
  }
}
