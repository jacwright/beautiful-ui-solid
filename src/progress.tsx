import type { JSX } from "@solidjs/web";
import { omit, Show } from "solid-js";
import { useField } from "./fieldset.tsx";

/**
 * Progress: a native <progress>. The look is CSS (styles/elements/progress.css). The spec is the
 * docs site's Progress page.
 *
 * The browser does the bar and tells a screen reader its value. This adds what it lacks:
 *
 * - The value in words (valueText), as aria-valuetext and, in a Field, an <output> at the end of
 *   the label's line. Left out, the percentage, rounded. The output is hidden from screen readers,
 *   which hear the bar's own words.
 * - A Field's id, so its Label names the bar, and its aria-describedby, so its description and
 *   error describe it. An error in the Field turns the fill danger in CSS.
 *
 * With no value the bar is indeterminate: it sweeps, and has no words.
 */

export type ProgressProps = Omit<JSX.HTMLAttributes<HTMLProgressElement>, "children"> & {
  /** How far along, from 0 to max. Left out, the bar is indeterminate. */
  value?: number;
  /** What done is: 100 for a percentage, 12 for 12 photos. */
  max?: number;
  /** The value in words, such as "5 of 12". Left out, the percentage, rounded. */
  valueText?: string;
  /** In a Field, leaves the value off the label's line. Screen readers still hear it. */
  hideValue?: boolean;
};

/** The share done, rounded, as a percentage: 42 out of 100, or 5 out of 12 as 42%. */
function percentage(value: number, max: number) {
  const share = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  return `${Math.round(share * 100)}%`;
}

// A Field checks the control it is handed, with the browser's own constraint validation. A
// <progress> has none, so it takes the Field's id and description and leaves its ref alone.
export function Progress(props: ProgressProps) {
  const rest = omit(props, "value", "max", "valueText", "hideValue", "id", "aria-describedby", "aria-valuetext");
  const field = useField(props);
  const id = () => field.id ?? props.id;
  // A value that isn't a number leaves the bar indeterminate, as none does.
  const determinate = () => Number.isFinite(props.value);
  // The browser's own max is 1, and it ignores a max of 0 or less. A percentage is what a bar with a
  // value and no max means, so 100. An indeterminate bar has no use for a max, and none is written.
  const max = () => (determinate() ? (props.max! > 0 ? props.max : 100) : props.max);
  const words = () => (determinate() ? props.valueText || percentage(props.value!, max()!) : undefined);

  return (
    <>
      <progress
        {...rest}
        id={id()}
        aria-describedby={field["aria-describedby"] ?? props["aria-describedby"]}
        aria-valuetext={words()}
        value={determinate() ? props.value : undefined}
        max={max()}
      />
      <Show when={field.id && !props.hideValue && words()}>
        {(shown) => (
          <output for={id()} aria-hidden="true">
            {shown()}
          </output>
        )}
      </Show>
    </>
  );
}
