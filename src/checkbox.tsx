import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { useField } from "./fieldset.tsx";

/**
 * Checkbox: a native <input type="checkbox">. The browser gives it its role, Space, its label's
 * click, and its part in a form. The look is CSS (styles/elements/checkbox.css). The spec is the
 * docs site's Checkbox page.
 *
 * In a Field, it takes its id, links and disabled from the Field, and the Field checks it. What it
 * adds is indeterminate, which the platform has only as a DOM property, never an attribute.
 */

export type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /**
   * Mixed: for a box that stands for others when only some of them are on. It shows a dash, and
   * screen readers say "mixed". The browser clears it when the box is pressed, so keep it in step
   * with the boxes it stands for.
   */
  indeterminate?: boolean;
  /**
   * Whether it starts on, for a box the app doesn't control. A form's reset puts it back to this.
   * Solid sets checked as a property, which a reset doesn't return to.
   */
  defaultChecked?: boolean;
};

export function Checkbox(props: CheckboxProps) {
  const rest = omit(props, "indeterminate", "defaultChecked", "ref");
  const field = useField(omit(props, "ref"));
  const own = (el: HTMLInputElement) => {
    // The checked attribute, which a reset returns to. A default is read once, as the browser's is.
    if (props.defaultChecked) el.defaultChecked = true;
    // A press clears indeterminate, and Solid writes it again only when the prop changes. Once the
    // app has handled the press, the box takes the prop again, so it never drifts from the app.
    el.addEventListener("change", () => queueMicrotask(() => (el.indeterminate = props.indeterminate ?? false)));
    if (typeof props.ref === "function") props.ref(el);
  };

  return (
    <input
      {...rest}
      type="checkbox"
      prop:indeterminate={props.indeterminate ?? false}
      {...field}
      ref={[own, field.ref]}
    />
  );
}
