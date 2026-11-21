import type { JSX } from "@solidjs/web";
import { createSignal, omit } from "solid-js";
import { Button } from "./button.tsx";

/**
 * Toggle button: a Button with aria-pressed, which a click flips. The browser gives it its role,
 * focus, Enter and Space, and the component adds the flip, the one thing the platform lacks. The
 * pressed look is CSS (styles/elements/toggle-button.css), keyed on aria-pressed. The spec is the
 * docs site's Toggle button page.
 *
 * With pressed, the page owns the state and the button shows what it says. Without, the button
 * owns it, starting from defaultPressed. Either way a click calls onChange with the new state.
 */
export type ToggleButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "color" | "type" | "onChange" | "aria-pressed"
> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onChange?: (pressed: boolean) => void;
  /** Secondary is a raised pane, tertiary text only until pressed or hovered. */
  variant?: "secondary" | "tertiary";
  color?: "neutral" | "accent";
};

export function ToggleButton(props: ToggleButtonProps) {
  const rest = omit(props, "pressed", "defaultPressed", "onChange", "onClick");
  // Read once: defaultPressed is where the button starts, not a state to follow.
  const [own, setOwn] = createSignal(props.defaultPressed ?? false);
  const pressed = () => props.pressed ?? own();

  function click(event: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) {
    const handler = props.onClick;
    if (typeof handler === "function") handler(event);
    else if (handler) handler[0](handler[1], event);
    // A caller's onClick can keep the state as it is.
    if (event.defaultPrevented) return;
    const next = !pressed();
    if (props.pressed === undefined) setOwn(next);
    props.onChange?.(next);
  }

  return <Button {...rest} aria-pressed={pressed() ? "true" : "false"} onClick={click} />;
}
