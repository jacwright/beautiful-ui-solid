import type { JSX } from "@solidjs/web";
import { omit, onSettled } from "solid-js";
import { onFormReset, type Rule, useField, wireRule } from "./fieldset.tsx";

/**
 * Input: a native <input> of a text type, and InputGroup, a <beautiful-input-group> that holds
 * one with its icons. The look is CSS (styles/elements/input.css). The spec is the docs site's
 * Input page.
 *
 * In a Field, it takes its id, links and disabled from the Field, and the Field checks it and
 * shows what's wrong. This adds what the platform lacks:
 *
 * - validate: a rule of the page's own, such as a password's, as the input's custom validity.
 * - A phone number (type="tel") is formatted as it's typed, for its country.
 * - A web address (type="url") without a scheme gets https:// when the person leaves the field.
 * - autocomplete="off" also keeps password managers' icons and menus off the field.
 */

/**
 * The types that take text. A date is DatePicker, not the browser's own picker. Checkbox, Radio,
 * Range and a file picker are their own components. The CSS still styles a native date or time
 * field, for a static page with no JS.
 */
export type InputType = "text" | "email" | "password" | "search" | "tel" | "url" | "number";

export type InputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  type?: InputType;
  /**
   * A rule of the page's own. Return what's wrong, in words that say how to fix it, or nothing
   * when the value is fine. It runs as the value changes, after the browser's own checks pass.
   */
  validate?: Rule;
  /**
   * For type="tel": the country whose format a number takes when it doesn't start with +, as
   * a two-letter code such as "US" or "GB". Left out, it is the region of the browser's language.
   */
  country?: string;
};

/**
 * Password managers each read their own attribute to leave a field alone: 1Password, LastPass and
 * Bitwarden. Their icons sit over the end of the field, on a number's arrows or a search's ×.
 */
const ignoredByPasswordManagers = { "data-1p-ignore": "", "data-lpignore": "true", "data-bwignore": "" };

export function Input(props: InputProps) {
  const rest = omit(props, "validate", "country", "ref");
  const field = useField(omit(props, "ref"));
  const off = () => (props.autocomplete === "off" ? ignoredByPasswordManagers : {});

  let input: HTMLInputElement | undefined;
  /** What runs once a form's reset has put back the default value, which comes with no input event. */
  const afterReset: (() => void)[] = [];

  function wire(el: HTMLInputElement) {
    input = el;
    // These listeners go on first, so the Field reads the value and validity they leave.
    if (props.type === "tel") afterReset.push(formatPhone(el, () => props.country));
    if (props.type === "url") el.addEventListener("change", () => addScheme(el));
    afterReset.push(wireRule(el, () => props.validate));
    if (typeof props.ref === "function") props.ref(el);
  }
  // Once the input is on the page: the ref runs on a copy of a template, in another document.
  onSettled(() => (input ? onFormReset(input, () => afterReset.forEach((run) => run())) : undefined));

  return (
    <input
      {...rest}
      {...off()}
      {...field}
      ref={[wire, field.ref]}
    />
  );
}

export type InputGroupProps = JSX.HTMLAttributes<HTMLElement>;

/** An input with an icon before it, after it, or both. The icons are <svg aria-hidden="true">. */
export function InputGroup(props: InputGroupProps) {
  return <beautiful-input-group {...props} />;
}

/**
 * Adds https:// to a web address typed without a scheme, such as springlaunch.com or
 * localhost.dev:8080. An email address is left as typed, for the browser to call out.
 */
function addScheme(el: HTMLInputElement) {
  const value = el.value.trim();
  // A scheme is letters then a colon, unless what follows the colon is a port.
  const schemed = /^[a-z][a-z\d+.-]*:(?!\d+(?:[/?#]|$))/i.test(value);
  const email = /^[^\s/:@]+@[^\s/:@]+$/.test(value);
  if (!value || schemed || email || !value.includes(".")) return;
  el.value = `https://${value.replace(/^\/+/, "")}`;
  // Heard by the page and the Field as typing would be.
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/** The characters of a phone number that count: its digits, and a leading +. */
const significant = (text: string) => text.replace(/[^\d+]/g, "");

/**
 * Formats a phone number as it's typed: "5550100199" reads "(555) 010-0199" in the US. The caret
 * stays after the same digit. Deleting a space or bracket deletes the digit before it, so
 * Backspace never sticks on a character the format puts back.
 *
 * The formatter, libphonenumber-js with its smallest metadata, loads when the first phone field
 * does, so pages without one don't carry it. Until it arrives, typing is left as it is.
 * Returns what to run after a form's reset: it formats the value the reset put back, which the next
 * deletion compares against.
 */
function formatPhone(el: HTMLInputElement, country: () => string | undefined) {
  type Format = (value: string) => string;
  let format: Format | undefined;
  let last = el.value;

  void import("libphonenumber-js/min").then(({ AsYouType }) => {
    format = (value) => {
      const region = (country() ?? regionOf(navigator.language)) as ConstructorParameters<typeof AsYouType>[0];
      return new AsYouType(region).input(value);
    };
    if (el.value) {
      el.value = format(el.value);
      last = el.value;
    }
  });

  el.addEventListener("input", (event) => {
    if (!format) return;
    let value = el.value;
    const caret = el.selectionStart ?? value.length;
    let before = significant(value.slice(0, caret)).length;
    const deleting = (event as InputEvent).inputType?.startsWith("delete");
    // Only a formatting character went: take the digit beside it too, before the caret for
    // Backspace and after it for Delete.
    if (deleting && significant(value) === significant(last)) {
      if ((event as InputEvent).inputType.endsWith("Forward")) {
        let at = caret;
        while (at < value.length && !/[\d+]/.test(value[at]!)) at++;
        if (at < value.length) value = value.slice(0, at) + value.slice(at + 1);
      } else if (before > 0) {
        let at = caret;
        while (at > 0 && !/[\d+]/.test(value[at - 1]!)) at--;
        value = value.slice(0, at - 1) + value.slice(at);
        before--;
      }
    }
    const next = format(value);
    el.value = next;
    last = next;
    // The caret goes back after the same number of digits.
    let at = 0;
    for (let seen = 0; at < next.length && seen < before; at++) if (/[\d+]/.test(next[at]!)) seen++;
    el.setSelectionRange(at, at);
  });
  return () => {
    if (format && el.value) el.value = format(el.value);
    last = el.value;
  };
}

/** The region of a language tag, such as "US" for "en-US", or the likeliest one for a bare "en". */
function regionOf(language: string) {
  try {
    return new Intl.Locale(language).maximize().region;
  } catch {
    return undefined;
  }
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-input-group": HTMLAttributes<HTMLElement>;
    }
  }
}
