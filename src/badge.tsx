import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

/**
 * Badge: a short label for a status, a category or a count. Text, not a control, so it adds no
 * behavior and takes no focus. It renders a <beautiful-badge>, because no element means "label".
 * The look is CSS (styles/elements/badge.css), with the colors from styles/tints.css, keyed on
 * data-color, data-variant and data-dot. Each is left out at its default, so the markup matches a
 * hand-written badge. The spec is the docs site's Badge page.
 */

/** The tints, shared with Chip (styles/tints.css). */
export const badgeColors = ["neutral", "accent", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"] as const;
export type BadgeColor = (typeof badgeColors)[number];

export type BadgeProps = Omit<JSX.HTMLAttributes<HTMLElement>, "color"> & {
  /** The hue. Accent follows the theme's accent. */
  color?: BadgeColor;
  /** strong is the hue at full strength, for the one label on a screen that should stand out. */
  variant?: "soft" | "strong";
  /** A dot of the hue before the words, for a status. */
  dot?: boolean;
};

export function Badge(props: BadgeProps) {
  const rest = omit(props, "color", "variant", "dot");
  const color = () => (props.color === "neutral" ? undefined : props.color);
  const variant = () => (props.variant === "soft" ? undefined : props.variant);

  return <beautiful-badge {...rest} data-color={color()} data-variant={variant()} data-dot={props.dot ? "" : undefined} />;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-badge": HTMLAttributes<HTMLElement>;
    }
  }
}
