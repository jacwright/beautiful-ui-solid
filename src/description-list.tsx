import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

/**
 * Description list: a native <dl> of terms (<dt>) and their details (<dd>). It adds no
 * behavior. The look is CSS (styles/elements/description-list.css), which lays the list out by
 * its own width: terms beside their details when wide, stacked when narrow. data-size is left
 * out when the prop is, so the markup matches a hand-written <dl>. Terms and details sit
 * straight in the list, with no <div> around a pair. The spec is the docs site's Description
 * list page.
 */

export type DescriptionListProps = JSX.HTMLAttributes<HTMLDListElement> & {
  /** Left out, the list takes the size of where it sits. */
  size?: "sm" | "base";
};

export function DescriptionList(props: DescriptionListProps) {
  const rest = omit(props, "size");
  return <dl {...rest} data-size={props.size} />;
}

/** A term: the row's muted label. */
export function DescriptionTerm(props: JSX.HTMLAttributes<HTMLElement>) {
  return <dt {...props} />;
}

/** A detail: the row's value. A term may have several. */
export function DescriptionDetails(props: JSX.HTMLAttributes<HTMLElement>) {
  return <dd {...props} />;
}
