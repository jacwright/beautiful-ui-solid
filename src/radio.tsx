import type { JSX } from "@solidjs/web";
import { createContext, createEffect, createSignal, createUniqueId, omit, onSettled, Show, useContext } from "solid-js";
import { ErrorMessage, Fieldset, type FieldsetProps, focusFirstInvalid, onFormReset, useField } from "./fieldset.tsx";
import { call } from "./handler.ts";

/**
 * Radio and RadioGroup. A Radio is a native <input type="radio">, drawn by the kit as a circle
 * (styles/elements/radio.css). A RadioGroup is a Fieldset with role="radiogroup". The spec is the
 * docs site's Radio page.
 *
 * The browser does the work: radios that share a name are one group, a press or an arrow key checks
 * one and unchecks the rest, Tab stops once on the group, the form sends the checked one's value,
 * and a reset puts the choice back. The group adds what the platform lacks:
 *
 * - It names its radios, and holds the value: value and onChange for a page that keeps it,
 *   defaultValue for one that doesn't.
 * - It checks itself. A required group sent with nothing chosen says so once, under its last
 *   option, in place of the browser's bubble. Focus goes to the first radio, and the message
 *   clears the moment one is checked or the form is reset.
 * - A reset that changes the choice fires a change event, so onChange hears it, as Switch's does.
 *   A group the page holds (value) is left as the page has it: a reset doesn't change it.
 *
 * A Radio in a Field takes its id, links and disabled from the Field. The Field doesn't check it:
 * one Field per radio would each say "Choose an option", and the group says it once.
 */

type Group = {
  name: string;
  current: () => string | undefined;
  required: () => boolean;
  invalid: () => boolean;
  /** Whether the page holds the value. A reset leaves a group the page holds as the page has it. */
  controlled: () => boolean;
  /** A radio was checked. */
  pick: (value: string) => void;
  /** A reset left nothing checked. */
  clear: () => void;
  /** The form was sent with nothing chosen. */
  reject: () => void;
  /** A reset hides the message. */
  accept: () => void;
  /** Lists a radio while it is on the page, for the group to put right. Returns the removal. */
  add: (radio: () => [el: HTMLInputElement | undefined, value: string]) => () => void;
};

const GroupContext = createContext<Group | null>(null);

export type RadioGroupProps = Omit<FieldsetProps, "name" | "onChange" | "role"> & {
  /** The name the form sends the value under. Left out, the group makes a unique one. */
  name?: string;
  /** The checked radio's value, when the page keeps it. Pair it with onChange. */
  value?: string;
  /** The radio checked at first, when the group keeps the value itself. */
  defaultValue?: string;
  /** Runs with the new value when a radio is checked, by a press, a tap, an arrow key or a reset. */
  onChange?: (value: string) => void;
  /** The form can't be sent until one is checked. */
  required?: boolean;
};

export function RadioGroup(props: RadioGroupProps) {
  const name = props.name ?? createUniqueId();
  const [own, setOwn] = createSignal<string | undefined>(props.defaultValue);
  const [rejected, setRejected] = createSignal(false);
  const radios = new Set<() => [HTMLInputElement | undefined, string]>();
  const current = () => props.value ?? own();
  const required = () => props.required ?? false;
  const group: Group = {
    name,
    current,
    required,
    // The message is for a required group: one that stops being required has nothing to say.
    invalid: () => rejected() && required(),
    controlled: () => props.value !== undefined,
    pick(value) {
      setOwn(value);
      setRejected(false);
      props.onChange?.(value);
      // A page that keeps the value may refuse the choice. The browser has checked the radio anyway, and
      // nothing the page holds changed for Solid to write back, so once the page has answered, put them right.
      if (props.value !== undefined) setTimeout(() => {
        for (const radio of radios) {
          const [el, value] = radio();
          if (el && el.checked !== (current() === value)) el.checked = current() === value;
        }
      });
    },
    add(radio) {
      radios.add(radio);
      return () => radios.delete(radio);
    },
    clear: () => setOwn(undefined),
    reject: () => setRejected(true),
    accept: () => setRejected(false),
  };
  const rest = omit(props, "name", "value", "defaultValue", "onChange", "required", "children");
  return (
    <Fieldset
      {...rest}
      role="radiogroup"
      aria-required={props.required ? "true" : undefined}
      aria-invalid={group.invalid() ? "true" : undefined}
    >
      <GroupContext value={group}>{props.children}</GroupContext>
      <Show when={group.invalid()}>
        <ErrorMessage>Choose an option.</ErrorMessage>
      </Show>
    </Fieldset>
  );
}

export type RadioProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> & {
  /** What the form sends, and what the group's onChange gets, when this one is checked. */
  value: string;
};

export function Radio(props: RadioProps) {
  const group = useContext(GroupContext);
  const rest = omit(props, "name", "checked", "onChange", "required", "ref");
  // Not useField's ref: it would hand the radio to the Field to check, and each option's Field
  // would show the group's error. The group shows it once.
  const field = omit(
    useField({
      get "aria-describedby"() {
        return props["aria-describedby"];
      },
      get "aria-invalid"() {
        return group?.invalid() ? "true" : props["aria-invalid"];
      },
      get disabled() {
        return props.disabled;
      },
    }),
    "ref",
  );

  let input: HTMLInputElement | undefined;
  // Once the radio is on the page: the ref runs on a copy of a template, in another document.
  onSettled(() => {
    if (!input || !group) return;
    const el = input;
    const invalid = (event: Event) => {
      // The group speaks instead of the browser's bubble, and focus goes to its first radio.
      event.preventDefault();
      group.reject();
      focusFirstInvalid(el);
    };
    // What a reset goes back to is the choice the radio started with.
    el.defaultChecked = el.checked;
    el.addEventListener("invalid", invalid);
    const unlist = group.add(() => [input, props.value]);
    const stopReset = onFormReset(el, () => {
      group.accept();
      if (el.checked && group.current() !== props.value) el.dispatchEvent(new Event("change", { bubbles: true }));
      else if (!el.checked && group.current() === props.value) group.clear();
    });
    return () => {
      el.removeEventListener("invalid", invalid);
      unlist();
      stopReset();
    };
  });

  // A group the page holds has no start of its own: a reset goes back to what the page holds, so the
  // radio and the page never disagree.
  createEffect(
    () => (group?.controlled() ? group.current() === props.value : undefined),
    (checked) => {
      if (input && checked !== undefined) input.defaultChecked = checked;
    },
  );

  return (
    <input
      {...rest}
      {...field}
      type="radio"
      name={props.name ?? group?.name}
      value={props.value}
      checked={group ? group.current() === props.value : props.checked}
      required={group ? group.required() : props.required}
      onChange={(event) => {
        call(props.onChange, event);
        if (group && event.currentTarget.checked) group.pick(props.value);
      }}
      ref={(el: HTMLInputElement) => {
        input = el;
        if (typeof props.ref === "function") props.ref(el);
      }}
    />
  );
}
