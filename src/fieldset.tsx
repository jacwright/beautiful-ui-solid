import type { JSX } from "@solidjs/web";
import { createContext, createSignal, createUniqueId, omit, onSettled, Show, useContext } from "solid-js";

/**
 * Fieldset and its parts: a native <fieldset> and <legend>, and <beautiful-field> for one control
 * with its <label for>, description <p> and error <p data-error>. The look is CSS
 * (styles/elements/fieldset.css). The spec is the docs site's Fieldset page.
 *
 * A Field or a Fieldset names its parts' ids by one rule, so static markup can write the same:
 * the control's id is the field's id, the description's is <id>-description, and the error's is
 * <id>-error. A Description or ErrorMessage tells the part it sits in that it is there, and the
 * part points aria-describedby at its id. A control reads its Field with useField().
 *
 * A Field also checks its control with the browser's own constraint validation (required, type,
 * minlength, pattern, min, max, step, and a control's setCustomValidity), and shows what's wrong
 * as an ErrorMessage in plain words, not the browser's bubble. It waits until the control has
 * been changed and left, or the form was sent, then updates the message as the person types, so
 * it clears the moment the value is fixed. An ErrorMessage the Field holds itself, such as a
 * server's answer, wins over its own.
 */

/** A Field or a Fieldset: the part a Description or ErrorMessage belongs to. */
type Kind = "description" | "error";

type Part = {
  id: string;
  /** Lists a description or error by its id while it is shown. Returns the removal. */
  add(kind: Kind, id: string, own?: boolean): () => void;
  /** Only a Field disables and invalidates a control, and checks it. */
  field?: {
    disabled: () => boolean;
    invalid: () => boolean;
    describedBy: () => string | undefined;
    /** Takes the control's element, to check it. Returns the removal of its listeners. */
    control: (el: Checkable) => () => void;
  };
};

/** A form control the browser can check. */
export type Checkable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const PartContext = createContext<Part | null>(null);

type Listed = { id: string; own: boolean };

/** The parts shown in one Field or Fieldset, and the aria-describedby that points at them. */
function createPart() {
  const [descriptions, setDescriptions] = createSignal<Listed[]>([]);
  const [errors, setErrors] = createSignal<Listed[]>([]);
  const setters = { description: setDescriptions, error: setErrors };
  // Descriptions first, so a screen reader reads the help before the error.
  const describedBy = () => [...descriptions(), ...errors()].map((part) => part.id).join(" ") || undefined;
  function add(kind: Kind, id: string, own = false) {
    const listed = { id, own };
    setters[kind]((parts) => [...parts, listed]);
    return () => setters[kind]((parts) => parts.filter((other) => other !== listed));
  }
  return {
    add,
    describedBy,
    invalid: () => errors().length > 0,
    /** An ErrorMessage written in the field, not the field's own check. */
    written: () => errors().some((part) => !part.own),
  };
}

export type FieldsetProps = Omit<JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>, "id"> & {
  /** The fieldset's id. Left out, it makes a unique one. */
  id?: string;
};

/** A group of fields. Its native disabled disables every control inside. */
export function Fieldset(props: FieldsetProps) {
  const id = props.id ?? createUniqueId();
  const part = createPart();
  const rest = omit(props, "id", "children");
  return (
    <fieldset {...rest} id={id} aria-describedby={props["aria-describedby"] ?? part.describedBy()}>
      <PartContext value={{ id, add: part.add }}>{props.children}</PartContext>
    </fieldset>
  );
}

export function Legend(props: JSX.HTMLAttributes<HTMLLegendElement>) {
  return <legend {...props} />;
}

export type FieldProps = Omit<JSX.HTMLAttributes<HTMLElement>, "id"> & {
  /** The control's id. Left out, the field makes a unique one. */
  id?: string;
  /** Disables the control. Its label, description and error fade with it. */
  disabled?: boolean;
};

/** One control with its label, description and error. */
export function Field(props: FieldProps) {
  const id = props.id ?? createUniqueId();
  const part = createPart();
  const rest = omit(props, "id", "disabled", "children");
  const check = createCheck();
  const field = {
    disabled: () => props.disabled ?? false,
    invalid: part.invalid,
    describedBy: part.describedBy,
    control: (el: Checkable) => check.control(el, id),
  };
  const problem = () => (part.written() ? undefined : check.problem());
  // data-disabled fades the parts even when the control isn't a direct child the CSS can see.
  return (
    <beautiful-field {...rest} data-disabled={props.disabled ? "" : undefined}>
      <PartContext value={{ id, add: part.add, field }}>
        {props.children}
        <Show when={problem()}>{(message) => <Shown kind="error" own data-error="">{message()}</Shown>}</Show>
      </PartContext>
    </beautiful-field>
  );
}

/** Whether a pointer is pressed on the page now. Each document is watched from its first check. */
const pressed = new WeakMap<Document, { down: boolean }>();
function pointerDown(doc: Document) {
  let state = pressed.get(doc);
  if (!state) {
    const watched = { down: false };
    doc.addEventListener("pointerdown", () => (watched.down = true), true);
    doc.addEventListener("pointerup", () => (watched.down = false), true);
    doc.addEventListener("pointercancel", () => (watched.down = false), true);
    pressed.set(doc, watched);
    state = watched;
  }
  return state.down;
}

/** The form whose submit is moving focus to its first invalid control, for the rest of this task. */
const focusing = new WeakSet<HTMLFormElement>();

/**
 * A submit fires invalid on each invalid control, in order. The first to ask gets focus, where a
 * screen reader reads its error, and the rest of that submit leaves it there. target is what takes
 * the focus when that isn't the control itself.
 */
export function focusFirstInvalid(el: HTMLElement & { form: HTMLFormElement | null }, target: HTMLElement = el) {
  const form = el.form;
  if (!form || focusing.has(form)) return;
  focusing.add(form);
  target.focus();
  setTimeout(() => focusing.delete(form));
}

/**
 * Checks one control. The problem shows once the control has been changed and left, or the form
 * was sent, and follows the value from then on. A reset hides it again.
 */
function createCheck() {
  const [problem, setProblem] = createSignal<string>();
  const [shown, setShown] = createSignal(false);

  /** `id` is the Field's: the control its label names, which takes focus. It is `el`, unless `el` is hidden behind it, as Listbox's select is. */
  function control(el: Checkable, id: string) {
    let changed = false;
    pointerDown(el.ownerDocument);
    const update = () => setProblem(el.willValidate && !el.validity.valid ? problemOf(el) : undefined);
    const show = () => {
      setShown(true);
      update();
    };
    const onInput = () => {
      changed = true;
      if (shown()) update();
    };
    const onLeave = () => {
      if (!changed) return;
      // Left for a click: wait until the click is done, or the problem would push down the
      // button under the pointer, such as Save, and the click would miss it.
      if (pointerDown(el.ownerDocument)) {
        el.ownerDocument.addEventListener("pointerup", () => setTimeout(show), { once: true, capture: true });
      } else show();
    };
    // A submit fires invalid on each invalid control, in order. The field speaks instead of the
    // browser's bubble, and focus goes to the first, where a screen reader reads its error.
    const onInvalid = (event: Event) => {
      event.preventDefault();
      show();
      focusFirstInvalid(el, el.ownerDocument.getElementById(id) ?? el);
    };
    const stopReset = onFormReset(el, () => {
      changed = false;
      setShown(false);
      setProblem(undefined);
    });
    el.addEventListener("input", onInput);
    el.addEventListener("change", onInput);
    el.addEventListener("focusout", onLeave);
    el.addEventListener("invalid", onInvalid);
    return () => {
      el.removeEventListener("input", onInput);
      el.removeEventListener("change", onInput);
      el.removeEventListener("focusout", onLeave);
      el.removeEventListener("invalid", onInvalid);
      stopReset();
    };
  }

  return { control, problem: () => (shown() ? problem() : undefined) };
}

/**
 * Runs after the reset of a control's form, once the browser has put back its default value.
 * A reset event fires before that, and doesn't bubble, so the document listens as it is captured.
 * Wire it once the control is on the page: a ref runs on a copy of a template, in another document.
 * Returns what stops it.
 */
export function onFormReset(el: Checkable | HTMLButtonElement, run: () => void) {
  const doc = el.ownerDocument;
  const onReset = (event: Event) => {
    if (event.target === el.form) setTimeout(run);
  };
  doc.addEventListener("reset", onReset, true);
  return () => doc.removeEventListener("reset", onReset, true);
}

/** A rule of the page's own: what's wrong with a value, in words that say how to fix it, or nothing. */
export type Rule = (value: string) => string | undefined | false | null;

/**
 * Makes a rule of the page's own, such as a password's, the control's custom validity, which a
 * Field reads like the browser's. It runs as the value changes, after the browser's own checks
 * pass. Returns the check, to run again after a form's reset, which comes with no input event.
 */
export function wireRule(el: HTMLInputElement | HTMLTextAreaElement, rule: () => Rule | undefined) {
  const check = () => {
    el.setCustomValidity("");
    const own = rule();
    if (own && el.validity.valid) el.setCustomValidity(own(el.value) || "");
  };
  check();
  el.addEventListener("input", check);
  el.addEventListener("change", check);
  return check;
}

/** What's wrong with a control's value, in words that say how to fix it. */
export function problemOf(el: Checkable): string {
  const v = el.validity;
  const type = el instanceof HTMLInputElement ? el.type : el.localName;
  const input = el instanceof HTMLInputElement ? el : undefined;
  // A control's own words come first: a setCustomValidity message, or a pattern's title.
  if (v.customError) return el.validationMessage;
  if (v.valueMissing) {
    if (type === "checkbox") return "Check this box to go on.";
    if (type === "radio" || type === "select") return "Choose an option.";
    return "Fill this in.";
  }
  if (v.badInput) return type === "number" ? "Enter a number." : "Enter a complete value.";
  if (v.typeMismatch) {
    if (type === "email") return "Enter an email address, such as name@example.com.";
    if (type === "url") return "Enter a web address, such as https://example.com.";
  }
  if (v.patternMismatch && el.title) return el.title;
  if (v.tooShort && "minLength" in el) {
    return `Use at least ${el.minLength} characters. This has ${el.value.length}.`;
  }
  if (v.tooLong && "maxLength" in el) return `Use at most ${el.maxLength} characters.`;
  if (input && v.rangeUnderflow) return `Enter ${input.min} or more.`;
  if (input && v.rangeOverflow) return `Enter ${input.max} or less.`;
  if (input && v.stepMismatch && type === "number") {
    const step = Number(input.step) || 1;
    const base = Number(input.min) || 0;
    const below = base + Math.floor((input.valueAsNumber - base) / step) * step;
    const format = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 10 });
    return `Enter ${format(below)} or ${format(below + step)}.`;
  }
  return el.validationMessage;
}

/** The control's name. In a Field, it points at the control. */
export function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
  const part = useContext(PartContext);
  return <label {...props} for={props.for ?? (part?.field ? part.id : undefined)} />;
}

/** Help with a control, or under a Legend, with its group. A second one in the same part needs its own id. */
export function Description(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  return <Shown kind="description" {...props} />;
}

/** What's wrong with the value. While it is shown, the control is invalid. */
export function ErrorMessage(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  return <Shown kind="error" data-error="" {...props} />;
}

/** own: the Field's own check made it, not the page. */
function Shown(props: JSX.HTMLAttributes<HTMLParagraphElement> & { kind: Kind; own?: boolean }) {
  const part = useContext(PartContext);
  const rest = omit(props, "kind", "id", "own");
  const id = typeof props.id === "string" ? props.id : part && `${part.id}-${props.kind}`;
  // The part lists it once it is on the page, and drops it when it leaves.
  if (part && id) onSettled(() => part.add(props.kind, id, props.own));
  return <p {...rest} id={id || undefined} />;
}

/** The control's own attributes that a Field adds to rather than replaces. */
export type FieldOwn = Pick<JSX.InputHTMLAttributes<HTMLElement>, "aria-describedby" | "aria-invalid" | "disabled"> & {
  ref?: unknown;
};

/** The attributes a form control takes from the Field it sits in. */
export type FieldControl = Omit<FieldOwn, "ref"> & { readonly id?: string; readonly ref?: (el: Checkable) => void };

/**
 * For a form control: pass it the control's props, and spread the result on its native element
 * after them. The control's own aria-describedby is kept after the Field's, its aria-invalid and
 * disabled stand unless the Field sets them, and the Field's id wins, so its Label points at it.
 * Its ref hands the element to the Field to check, then calls the control's own ref.
 * Outside a Field it is empty, and the control works on its own, with the browser's checks.
 */
export function useField(own: FieldOwn = {}): FieldControl {
  const part = useContext(PartContext);
  const field = part?.field;
  if (!part || !field) return {};
  // The ref runs as the element is made. Once it is on the page, the Field checks it, until it leaves.
  let control: Checkable | undefined;
  onSettled(() => (control ? field.control(control) : undefined));
  return {
    id: part.id,
    ref(el: Checkable) {
      control = el;
      if (typeof own.ref === "function") own.ref(el);
    },
    get "aria-describedby"() {
      return [field.describedBy(), own["aria-describedby"]].filter(Boolean).join(" ") || undefined;
    },
    get "aria-invalid"() {
      return field.invalid() ? "true" : own["aria-invalid"];
    },
    get disabled() {
      return field.disabled() || own.disabled || undefined;
    },
  };
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-field": HTMLAttributes<HTMLElement>;
    }
  }
}
