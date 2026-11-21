import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, createSignal, createUniqueId, For, omit, onSettled, Show, untrack } from "solid-js";
import { onFormReset, useField } from "./fieldset.tsx";

/**
 * Range: a native <input type="range">. The look is CSS (styles/elements/range.css). The spec is
 * the docs site's Range page.
 *
 * The browser does the dragging, the keys and the value. This adds what it lacks:
 *
 * - The value in words (format), as aria-valuetext and, in a Field, an <output> at the end of the
 *   label's line. The output is hidden from screen readers, which hear the slider's own words.
 * - --range-at, where the thumb sits from 0 to 1, for the fill in browsers that can't work it out
 *   in CSS.
 * - marks: a <datalist> of named values under the track. A click on one moves the thumb there.
 */

/** A value to name under the track. A number is named by the Range's format. */
export type RangeMark = number | { value: number; label: string };

export type RangeProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "min" | "max" | "step" | "style"> & {
  /** Where the thumb sits. Left out, the browser puts it halfway. */
  value?: number;
  min?: number;
  max?: number;
  step?: number | "any";
  /** The value in words, such as "25%" or "30 days". Left out, the number in the browser's language, such as 1,000. */
  format?: (value: number) => string;
  /** In a Field, shows the value at the end of the label's line. */
  showValue?: boolean;
  marks?: RangeMark[];
  style?: JSX.CSSProperties;
};

/** A place on the track from 0 to 1, as the CSS reads it: four decimals at most. */
function place(value: number, min: number, max: number) {
  const at = max > min ? (Math.min(Math.max(value, min), max) - min) / (max - min) : 0;
  return String(Math.round(at * 1e4) / 1e4);
}

export function Range(props: RangeProps) {
  const rest = omit(props, "value", "min", "max", "step", "format", "showValue", "marks", "style", "ref");
  const field = useField(omit(props, "ref"));
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  // The value the page gave, until the person moves it. Left out, the browser's halfway, read once:
  // a later min or max moves the thumb only as far as the browser clamps it.
  const [value, setValue] = createSignal(() => props.value ?? untrack(() => (min() + max()) / 2));
  const words = (v: number) => (props.format ? props.format(v) : v.toLocaleString());
  const shown = createMemo(() => words(value()));
  // A Field names the input. The marks' list needs an id of its own either way.
  const id = field.id ?? props.id;
  const own = createUniqueId();
  const marksId = () => (props.marks?.length ? `${id ?? own}-marks` : undefined);

  let input: HTMLInputElement | undefined;
  function wire(el: HTMLInputElement) {
    input = el;
    el.addEventListener("input", () => setValue(el.valueAsNumber));
    if (typeof props.ref === "function") props.ref(el);
  }
  /** Reads back what the input holds: the browser rounds a value to a step and keeps it between min and max. */
  function sync() {
    if (input && input.valueAsNumber !== value()) setValue(input.valueAsNumber);
  }
  // Once the input is on the page: the ref runs on a copy of a template, in another document.
  // A form's reset puts back the default value with no input event.
  onSettled(() => (input ? onFormReset(input, sync) : undefined));
  // The page's value is also the default a reset puts back: the value attribute. The input always
  // has a min, so the browser counts its steps from min, not from this attribute.
  createEffect(
    () => props.value,
    (given) => {
      if (input && given !== undefined) input.defaultValue = String(given);
      sync();
    },
  );
  // New limits or a new step: the browser moves the value inside them and onto a step.
  createEffect(
    () => [props.min, props.max, props.step],
    () => sync(),
  );

  /** Moves the thumb to a mark, as a drag would: the page hears an input and a change, if it moved. */
  function pick(to: number) {
    if (!input || input.disabled) return;
    const before = input.value;
    input.value = String(to);
    if (input.value === before) return;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return (
    <>
      <input
        {...rest}
        {...field}
        id={id}
        ref={[wire, field.ref]}
        type="range"
        min={min()}
        max={props.max}
        step={props.step}
        value={value()}
        list={marksId()}
        aria-valuetext={props.format ? shown() : undefined}
        style={{ ...props.style, "--range-at": place(value(), min(), max()) }}
      />
      <Show when={field.id && props.showValue !== false}>
        <output for={id} aria-hidden="true">
          {shown()}
        </output>
      </Show>
      <Show when={marksId()}>
        <datalist id={marksId()}>
          <For each={props.marks}>
            {(mark) => {
              const at = typeof mark === "number" ? mark : mark.value;
              return (
                <option value={at} style={{ "--at": place(at, min(), max()) }} onClick={() => pick(at)}>
                  {typeof mark === "number" ? words(mark) : mark.label}
                </option>
              );
            }}
          </For>
        </datalist>
      </Show>
    </>
  );
}
