import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

/**
 * Link: a native <a href>. It adds no behavior: the browser gives it its role, focus and Enter,
 * and a router such as Solid Router follows it on its own. The look is CSS
 * (styles/elements/link.css), keyed on data-color, which is left out at the default so the markup
 * matches a hand-written <a>. target="_blank" draws its own arrow and screen-reader text there.
 * The spec is the docs site's Link page.
 */

export type LinkProps = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> & {
  /** Where it goes. Without one an <a> isn't a link, so it is required. */
  href: string;
  /** neutral takes the color of the text around it, and keeps the underline. */
  color?: "accent" | "neutral";
};

export function Link(props: LinkProps) {
  const rest = omit(props, "color");
  const color = () => (props.color === "accent" ? undefined : props.color);

  return <a {...rest} data-color={color()} />;
}
