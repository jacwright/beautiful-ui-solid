import type { JSX } from "@solidjs/web";
import { dynamic } from "@solidjs/web";
import { omit } from "solid-js";

/**
 * Heading: a native <h1> to <h6>. It adds no behavior. level picks the element, which is the
 * page's outline, and size the look, so neither bends to fit the other. The look is CSS
 * (styles/elements/heading.css): each level has a size of its own, and data-size, left out when
 * the prop is, sets another, so the markup matches a hand-written heading. The spec is the docs
 * site's Heading page.
 */

export type HeadingProps = JSX.HTMLAttributes<HTMLHeadingElement> & {
  /** The element, h1 to h6. Defaults to 1, the page's title. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Left out, h1 is lg, h2 is md, and h3 to h6 are sm. display is for a landing page's headline. */
  size?: "sm" | "md" | "lg" | "xl" | "display";
};

export function Heading(props: HeadingProps) {
  const rest = omit(props, "level", "size");
  const Tag = dynamic(() => `h${props.level ?? 1}` as const);

  return <Tag {...rest} data-size={props.size} />;
}
