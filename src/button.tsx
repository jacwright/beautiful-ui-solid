import type { JSX } from "@solidjs/web";
import { omit, Show } from "solid-js";

/**
 * Button: a native <button>, or <a data-button> with href. It adds no behavior: the browser
 * gives it its role, focus, Enter and Space. The look is CSS (styles/elements/button.css),
 * keyed on data-variant, data-color and data-shape, which are left out at their defaults so the markup
 * matches a hand-written <button>. The spec is the docs site's Button page.
 */

type Look = {
  /** primary for the main action, secondary for the others, tertiary for quiet ones. */
  variant?: "primary" | "secondary" | "tertiary";
  color?: "neutral" | "accent" | "danger";
  /** rounded corners, or a pill with round ends. An Icon button that is a pill is a circle. */
  shape?: "rounded" | "pill";
};

type AsButton = Look &
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "type"> & {
    /** Defaults to "button", so a Button in a form submits it only when asked. */
    type?: "button" | "submit" | "reset";
    href?: never;
  };

/** A link can't be disabled and has no type, so the types allow neither with href. */
type AsLink = Look &
  Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "type"> & {
    href: string;
    type?: never;
    disabled?: never;
  };

export type ButtonProps = AsButton | AsLink;

export function Button(props: ButtonProps) {
  const rest = omit(props, "variant", "color", "shape", "type");
  const variant = () => (props.variant === "secondary" ? undefined : props.variant);
  const color = () => (props.color === "neutral" ? undefined : props.color);
  const shape = () => (props.shape === "rounded" ? undefined : props.shape);

  return (
    <Show
      when={props.href !== undefined}
      fallback={
        <button
          {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
          type={props.type ?? "button"}
          data-variant={variant()}
          data-color={color()}
          data-shape={shape()}
        />
      }
    >
      <a {...(rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} data-button="" data-variant={variant()} data-color={color()} data-shape={shape()} />
    </Show>
  );
}
