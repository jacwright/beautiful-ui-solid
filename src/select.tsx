import type { JSX } from "@solidjs/web";
import { createEffect, omit, onSettled, Show, untrack } from "solid-js";
import { useField } from "./fieldset.tsx";

/**
 * Select: a native <select> for one value from a short, fixed list. The look is CSS
 * (styles/elements/select.css): Input's well with a chevron, and in Chromium with a mouse the
 * kit's own open list. The spec is the docs site's Select page.
 *
 * The choices are native <option> and <optgroup label> children. In a Field, it takes its id,
 * links and disabled from the Field, and the Field checks it, as it does an Input.
 */
export type SelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "multiple" | "size"> & {
  /** The picked option's value. */
  value?: string;
  /**
   * What shows, muted, until a choice is made, such as "Choose a plan". It isn't in the list and
   * can't be picked again. With required, the Field says to choose when it's still showing.
   */
  placeholder?: string;
};

export function Select(props: SelectProps) {
  const rest = omit(props, "placeholder", "children", "ref");
  const field = useField(omit(props, "ref"));

  let select: HTMLSelectElement | undefined;
  function wire(el: HTMLSelectElement) {
    select = el;
    if (typeof props.ref === "function") props.ref(el);
  }

  /**
   * Solid sets the value as a property, which a form's reset doesn't keep: it goes back to the
   * options marked selected. So the option with the page's value is marked, and reset returns to
   * it. With no value, a placeholder is the one marked.
   */
  const marked = () => props.value ?? (props.placeholder ? "" : undefined);
  function mark(value: string | undefined) {
    if (!select || value === undefined) return;
    for (const option of select.options) {
      // Only what changes: marking an option again would pick it again, over what the person picked.
      const want = option.value === value;
      if (option.defaultSelected !== want) option.defaultSelected = want;
    }
  }
  createEffect(marked, mark);
  // Options that arrive later, such as ones the page loads, are marked too. Wired once the select
  // is on the page: the ref runs on a copy of a template, in another document.
  onSettled(() => {
    if (!select) return;
    const watch = new MutationObserver(() => mark(untrack(marked)));
    watch.observe(select, { childList: true, subtree: true });
    return () => watch.disconnect();
  });

  return (
    <select {...rest} {...field} ref={[wire, field.ref]}>
      {/* Disabled and hidden, so it can't be picked again; selected, or the browser starts on the first it can pick. */}
      <Show when={props.placeholder}>
        <option value="" disabled hidden defaultSelected>
          {props.placeholder}
        </option>
      </Show>
      {props.children}
    </select>
  );
}
