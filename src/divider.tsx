import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

/**
 * Divider: a native <hr>, a hairline between sections. It adds no behavior: the browser gives it
 * the separator role. The look is CSS (styles/elements/divider.css), so a hand-written <hr> gets it
 * too. soft and a vertical orientation are attributes, left out by default, so the markup matches a
 * plain <hr>. The spec is the docs site's Divider page.
 */

export type DividerProps = JSX.HTMLAttributes<HTMLHRElement> & {
  /** A fainter line, for inside a section, such as between the rows of a list. */
  soft?: boolean;
  /** vertical stands the line up between things side by side, and says so with aria-orientation. */
  orientation?: "horizontal" | "vertical";
};

export function Divider(props: DividerProps) {
  const rest = omit(props, "soft", "orientation");

  return (
    <hr
      data-soft={props.soft ? "" : undefined}
      aria-orientation={props.orientation === "vertical" ? "vertical" : undefined}
      {...rest}
    />
  );
}
