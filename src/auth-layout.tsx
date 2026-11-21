import type { JSX } from "@solidjs/web";
import { omit, Show } from "solid-js";

/**
 * Auth layout: the page for signing in, joining a team, or following a link that has expired. One
 * card, the page's <main>, in the middle of the screen, and optionally a <footer> of small print
 * under it. The layout adds no behavior and moves no focus: the controls in the card are Buttons,
 * Links and Fields, each with its own keys. The look is CSS (styles/elements/auth-layout.css), on
 * Dialog's surface, and the page behind the card is --auth-backdrop. The spec is the docs site's
 * Auth layout page.
 */

export type AuthLayoutProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> & {
  /** The card: the logo, an <h1>, the text and the actions. A first <svg> or <img> is the logo. */
  children?: JSX.Element;
  /** Small print under the card, such as links to the Terms and the Privacy Policy. */
  footer?: JSX.Element;
};

export function AuthLayout(props: AuthLayoutProps) {
  const rest = omit(props, "children", "footer");

  return (
    <beautiful-auth-layout {...rest}>
      <main>{props.children}</main>
      <Show when={props.footer}>
        <footer>{props.footer}</footer>
      </Show>
    </beautiful-auth-layout>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-auth-layout": HTMLAttributes<HTMLElement>;
    }
  }
}
