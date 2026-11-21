import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

/**
 * Text: a native <p> of body copy. It adds no behavior. The look is CSS
 * (styles/elements/text.css), keyed on data-size and data-tone, which are left out when the
 * props are, so the markup matches a hand-written <p>. Bold and code are the native <strong>
 * and <code>, styled by the same file. The spec is the docs site's Text page.
 */

export type TextProps = JSX.HTMLAttributes<HTMLParagraphElement> & {
  /** Left out, the paragraph takes the size of where it sits. */
  size?: "sm" | "base" | "lg";
  /** muted for secondary copy. */
  tone?: "default" | "muted";
};

export function Text(props: TextProps) {
  const rest = omit(props, "size", "tone");
  const tone = () => (props.tone === "default" ? undefined : props.tone);

  return <p {...rest} data-size={props.size} data-tone={tone()} />;
}
