import type { JSX } from "@solidjs/web";
import { omit, Show } from "solid-js";
import { useField } from "./fieldset.tsx";

/**
 * Meter: a native <meter>, a level that stays, such as storage used of a plan's limit. The look is
 * CSS (styles/elements/meter.css). The spec is the docs site's Meter page.
 *
 * The browser draws the bar, picks its state from low, high and optimum, and tells a screen reader
 * its value. This adds what it lacks, as Progress does:
 *
 * - The value in words (valueText), as aria-valuetext and, in a Field, an <output> at the end of
 *   the label's line. Left out, the share of the range, rounded. The output is hidden from screen
 *   readers, which hear the bar's own words.
 * - A Field's id, so its Label names the bar, and its aria-describedby, so its description describes it.
 */

export type MeterProps = Omit<JSX.HTMLAttributes<HTMLMeterElement>, "children"> & {
  /** The level, from min to max. */
  value: number;
  /** The bottom of the range. */
  min?: number;
  /** The limit: 100 for a percentage or a score, 5 for a plan's 5 GB. */
  max?: number;
  /** Where the low part of the range ends. */
  low?: number;
  /** Where the high part of the range starts. */
  high?: number;
  /** Where the best level is: 0 when less is better, max when more is. */
  optimum?: number;
  /** The value in words, such as "3.2 GB of 5 GB". Left out, the share of the range, rounded. */
  valueText?: string;
  /** In a Field, leaves the value off the label's line. Screen readers still hear it. */
  hideValue?: boolean;
};

/** The share of the range, rounded, as a percentage: 3.2 of 0 to 5 as 64%. */
function percentage(value: number, min: number, max: number) {
  const share = max > min ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0;
  return `${Math.round(share * 100)}%`;
}

// A Field checks the control it is handed, with the browser's own constraint validation. A <meter>
// has none, so it takes the Field's id and description and leaves its ref alone.
export function Meter(props: MeterProps) {
  const rest = omit(
    props,
    "value",
    "min",
    "max",
    "low",
    "high",
    "optimum",
    "valueText",
    "hideValue",
    "id",
    "aria-describedby",
    "aria-valuetext",
  );
  const field = useField(props);
  const id = () => field.id ?? props.id;
  const min = () => (Number.isFinite(props.min) ? props.min! : 0);
  // The browser's own max is 1. A level out of 100 is what a meter with no max means, as Progress's.
  // A max at or under min would leave no range, and the browser would draw it full, so the range is 100 wide.
  const max = () => (Number.isFinite(props.max) && props.max! > min() ? props.max! : min() + 100);
  // A value that isn't a number reads as the bottom of the range, as the browser reads it.
  const value = () => (Number.isFinite(props.value) ? props.value : min());
  const words = () => props.valueText || percentage(value(), min(), max());

  return (
    <>
      <meter
        {...rest}
        id={id()}
        aria-describedby={field["aria-describedby"] ?? props["aria-describedby"]}
        aria-valuetext={words()}
        value={value()}
        min={min()}
        max={max()}
        low={props.low}
        high={props.high}
        optimum={props.optimum}
      />
      <Show when={field.id && !props.hideValue}>
        <output for={id()} aria-hidden="true">
          {words()}
        </output>
      </Show>
    </>
  );
}
