import type { JSX } from "@solidjs/web";
import { createEffect, createSignal, createUniqueId, omit, onSettled, Show, untrack } from "solid-js";
import { onFormReset, type Rule, useField, wireRule } from "./fieldset.tsx";

/**
 * Textarea: a native <textarea>, and under one with a maxlength, the count of characters left. The
 * look is CSS (styles/elements/input.css and textarea.css). The spec is the docs site's Textarea page.
 *
 * In a Field, it takes its id, links and disabled from the Field, and the Field checks it. This
 * adds what the platform lacks:
 *
 * - The count, a <p data-count> after the textarea, which the textarea's description points at.
 * - ⌘ or Ctrl + Enter sends the form, as its default button would.
 * - It grows with its text where the CSS can't grow it: browsers without field-sizing, or without
 *   attr() that reads the rows as a number.
 * - validate: a rule of the page's own, as on Input.
 */

export type TextareaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** How many lines it shows when empty. It grows from there, up to --field-max-lines. */
  rows?: number;
  /** The most characters it takes. Shows the count of what's left under the field. */
  maxlength?: number;
  /**
   * A rule of the page's own. Return what's wrong, in words that say how to fix it, or nothing
   * when the value is fine. It runs as the value changes, after the browser's own checks pass.
   */
  validate?: Rule;
};

/**
 * Whether the CSS grows this textarea itself, from the lines in its rows: textarea.css turns on
 * field-sizing only where the browser can read the rows too, so its @supports stays the one test.
 */
const grownByCss = (el: HTMLTextAreaElement) => getComputedStyle(el).fieldSizing === "content";

export function Textarea(props: TextareaProps) {
  const rest = omit(props, "validate", "ref", "rows", "maxlength", "aria-describedby");
  const own = createUniqueId();
  /** The count's id, by the Field's rule for its parts: <control id>-count. */
  const countId = () => `${field.id ?? props.id ?? own}-count`;
  const counted = () => props.maxlength != null;
  const describedBy = () => [props["aria-describedby"], counted() ? countId() : undefined].filter(Boolean).join(" ") || undefined;
  const field = useField({
    get "aria-describedby"() {
      return describedBy();
    },
    get "aria-invalid"() {
      return props["aria-invalid"];
    },
    get disabled() {
      return props.disabled;
    },
  });

  const [length, setLength] = createSignal(untrack(() => String(props.value ?? "").length));
  /** Under 0 only for a value a script set: the browser stops typing at the limit, but not a script. */
  const left = () => (props.maxlength ?? 0) - length();
  const count = () => {
    const n = Math.abs(left());
    const characters = n === 1 ? "1 character" : `${n} characters`;
    return left() < 0 ? `${characters} too many` : `${characters} left`;
  };

  let textarea: HTMLTextAreaElement | undefined;
  /** What runs once the value changed with no input event: a form's reset, or a new value prop. */
  const afterChange: (() => void)[] = [() => textarea && setLength(textarea.value.length)];
  const changed = () => afterChange.forEach((run) => run());

  function wire(el: HTMLTextAreaElement) {
    textarea = el;
    // Past the limit is a problem too: a script isn't held to maxlength, and the browser lets it through.
    const rule = (value: string) =>
      props.maxlength != null && value.length > props.maxlength
        ? `Use at most ${props.maxlength} characters. This has ${value.length}.`
        : props.validate?.(value);
    afterChange.push(wireRule(el, () => rule));
    el.addEventListener("input", () => setLength(el.value.length));
    if (typeof props.ref === "function") props.ref(el);
  }
  // Once the textarea is on the page: the ref runs on a copy of a template, in another document.
  onSettled(() => {
    if (!textarea) return;
    const stops = [onFormReset(textarea, changed), sendOnShortcut(textarea)];
    if (!grownByCss(textarea)) stops.push(grow(textarea, afterChange));
    return () => stops.forEach((stop) => stop());
  });
  // A value from the parent: the count and the height follow it once it is written.
  createEffect(
    () => props.value,
    () => queueMicrotask(changed),
  );

  return (
    <>
      <textarea
        {...rest}
        rows={props.rows ?? 3}
        maxlength={props.maxlength}
        aria-describedby={describedBy()}
        {...field}
        ref={[wire, field.ref]}
      />
      <Show when={counted()}>
        <p id={countId()} data-count="">
          {count()}
        </p>
      </Show>
    </>
  );
}

/**
 * ⌘ or Ctrl + Enter sends the textarea's form. The window hears the key last, after the page's own
 * onKeyDown, which Solid hears at the document, so the page can take the keys first by preventing
 * their default. Returns what stops it.
 */
function sendOnShortcut(el: HTMLTextAreaElement) {
  const win = el.ownerDocument.defaultView;
  if (!win) return () => {};
  const onKey = (event: KeyboardEvent) => {
    if (event.target !== el || event.defaultPrevented || event.isComposing) return;
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey) || !el.form) return;
    event.preventDefault();
    // Held down, the keys repeat. The form goes once.
    if (!event.repeat) send(el.form);
  };
  win.addEventListener("keydown", onKey);
  return () => win.removeEventListener("keydown", onKey);
}

/** The one-line fields that keep Enter from sending a form with no submit button, when there are two. */
const oneLine = /^(?:text|search|url|tel|email|password|number|date|month|week|time|datetime-local)$/;

/**
 * Sends a form as Enter in a one-line field would: through its default button, its first submit
 * button, so the button's name and value go with it. A disabled default button sends nothing, and
 * so does a form with no submit button and more than one one-line field, which a script sends.
 */
function send(form: HTMLFormElement) {
  const controls = [...form.elements];
  // An <input type="image"> isn't in form.elements, so it's looked for by selector.
  const button = controls.find(
    (el): el is HTMLButtonElement | HTMLInputElement =>
      (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) && el.type === "submit",
  );
  const image = form.querySelector<HTMLInputElement>('input[type="image"]');
  const first =
    image && (!button || button.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_PRECEDING) ? image : button;
  // :disabled, as a button in a disabled fieldset is too.
  if (first?.matches(":disabled")) return;
  if (!first && controls.filter((el) => el instanceof HTMLInputElement && oneLine.test(el.type)).length > 1) return;
  form.requestSubmit(first);
}

/**
 * Grows the textarea with its text, for a browser whose CSS can't: it sets the height its text
 * takes, which the CSS caps at --field-max-lines and floors at its rows. It runs on each input,
 * after a change with no input event, and when the width changes, since the text wraps anew.
 * Returns what stops it.
 */
function grow(el: HTMLTextAreaElement, afterChange: (() => void)[]) {
  const fit = () => {
    // Hidden, as in a closed dialog, it has no height to measure. It fits once it shows, and has a width.
    if (!el.clientWidth) return;
    // It shrinks to its rows for a moment to be measured, which would shorten the page and pull it
    // up under the person typing, so the page's scroll and its own are put back.
    const page = el.ownerDocument.scrollingElement;
    const top = page?.scrollTop ?? 0;
    const own = el.scrollTop;
    el.style.blockSize = "";
    // The height its rows give it, or its text's, with the edge.
    el.style.blockSize = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
    if (page) page.scrollTop = top;
    el.scrollTop = own;
  };
  el.style.resize = "none";
  fit();
  el.addEventListener("input", fit);
  afterChange.push(fit);
  let width = el.clientWidth;
  // Fitted in the next frame: a height set inside the observer's callback would resize what it observes.
  const resized = new ResizeObserver(() => {
    if (el.clientWidth === width) return;
    width = el.clientWidth;
    requestAnimationFrame(fit);
  });
  resized.observe(el);
  return () => resized.disconnect();
}
