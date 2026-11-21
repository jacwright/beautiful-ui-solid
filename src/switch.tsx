import type { JSX } from "@solidjs/web";
import { createEffect, omit, onSettled } from "solid-js";
import { onFormReset, useField } from "./fieldset.tsx";

/**
 * Switch: a native <input type="checkbox" role="switch">. The look is CSS (styles/elements/switch.css)
 * and the spec is the docs site's Switch page. The browser does the work: a click, a tap on the
 * label and Space flip it, a form sends it as a checkbox, and a reset puts it back. role="switch"
 * makes screen readers say "on" and "off". This adds only what the platform lacks:
 *
 * - onChange hands the new state first, as Catalyst's and Headless UI's do.
 * - A form's reset puts back the state the page gave the switch: the one it started in, or the
 *   last one the page set itself, but not one the person chose. Solid sets checked as a property,
 *   which leaves no attribute, so the default is kept in step here. A reset fires no event, so a
 *   switch it changed fires one, and onChange hears it: a controlled switch's signal follows.
 * - color is the track's color when it is on. The default, accent, is left out of the markup so
 *   it matches a hand-written switch.
 *
 * In a Field, it takes its id, its links to the description and error, and disabled from the Field.
 */

export type SwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "role" | "color" | "checked" | "onChange"> & {
  /** Whether it is on. Pass a signal to control it, or leave it to the switch. */
  checked?: boolean;
  /** Runs when the person flips it, with the new state first. */
  onChange?: (checked: boolean, event: Event & { currentTarget: HTMLInputElement }) => void;
  /** The track's color when it is on. */
  color?: "accent" | "neutral";
};

export function Switch(props: SwitchProps) {
  const rest = omit(props, "color", "onChange", "ref");
  const field = useField(props);
  const color = () => (props.color === "accent" ? undefined : props.color);

  let input: HTMLInputElement | undefined;
  /** The state onChange last heard, to tell a reset that changed it. */
  let known = false;
  // Once the switch is on the page: the ref runs on a copy of a template, in another document.
  onSettled(() => {
    if (!input) return;
    const el = input;
    el.defaultChecked = known = el.checked;
    return onFormReset(el, () => {
      if (el.checked === known) return;
      known = el.checked;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
  // The page moved a controlled switch. A flip the person made comes back here as the signal's new
  // value, which onChange already heard. Any other change, such as saved settings that load after
  // the switch is shown, is the state a reset goes back to.
  createEffect(
    () => props.checked,
    (checked) => {
      if (checked === undefined) return;
      if (checked !== known && input) input.defaultChecked = checked;
      known = checked;
    },
  );

  return (
    <input
      {...rest}
      {...field}
      ref={[(el: HTMLInputElement) => (input = el), field.ref ?? props.ref]}
      type="checkbox"
      role="switch"
      data-color={color()}
      onChange={(event) => {
        known = event.currentTarget.checked;
        props.onChange?.(known, event);
      }}
    />
  );
}
