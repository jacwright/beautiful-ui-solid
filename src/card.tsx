import type { JSX } from "@solidjs/web";
import { dynamic } from "@solidjs/web";
import { omit } from "solid-js";

/**
 * Card: a pane in the page that holds one thing. It adds no behavior. The look is CSS
 * (styles/elements/card.css), keyed on <beautiful-card>, or data-card on a meaningful element,
 * so the markup matches a hand-written one. Its parts are native children: media first, an <hgroup>, the
 * body, a <footer>. CardLink, inside the card's heading, makes the whole card a link while a
 * screen reader reads only the heading. The spec is the docs site's Card page.
 */

/** A form's attributes too, such as onSubmit and action, for a card that is a <form>. */
export type CardProps = JSX.FormHTMLAttributes<HTMLElement> & {
  /**
   * A meaningful element for the card: li in a list of cards, section or form on a settings page.
   * Left out, the card is a <beautiful-card>.
   */
  as?: "article" | "section" | "li" | "form";
};

export function Card(props: CardProps) {
  const rest = omit(props, "as");
  const Tag = dynamic(() => props.as ?? "beautiful-card");

  // A <beautiful-card> is a card by its name. Another element says so with data-card.
  return <Tag {...rest} data-card={props.as ? "" : undefined} />;
}

export type CardLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Where the card goes. */
  href: string;
};

/** The card's link, inside its heading. Its hit area covers the card, and the card shows its ring. */
export function CardLink(props: CardLinkProps) {
  return <a {...props} data-card-link="" />;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-card": FormHTMLAttributes<HTMLElement>;
    }
  }
}
