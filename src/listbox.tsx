import type { JSX } from "@solidjs/web";
import { createContext, createMemo, createSignal, createUniqueId, flush, For, omit, onSettled, Show, useContext } from "solid-js";
import { type Checkable, onFormReset, useField } from "./fieldset.tsx";
import { itemLabel } from "./menu.ts";
import { wireListbox } from "./options.ts";
import { forward, type PopoverPanelProps } from "./popover.tsx";

/**
 * Listbox: a custom select. A button that looks like a field shows the chosen option, and opens
 * a native popover holding a role="listbox" of options. The browser opens, places and closes it,
 * as for any Popover. wireListbox (options.ts) adds the keys and the pointer, with focus on the
 * list and aria-activedescendant on the lit option. The look is CSS (styles/elements/listbox.css
 * and item.css). The spec is the docs site's Listbox page.
 *
 * No div or span: the value, the panel, the list and each option are beautiful-* elements,
 * styling hooks with the role that says what each is.
 *
 * The ids follow one rule, so static markup can write the same: the button's is the Listbox's id
 * (a Field's, in one), the value's is <id>-value, the panel's <id>-options, each option's
 * <id>-<value>, and the label's <id>-label. The button is named by the label and the value.
 *
 * With a name or required, a hidden native <select> holds the value, so the form sends it,
 * checks it and resets it as it does any control, and a Field checks it too.
 */

/** An option, as the field knows it: its value, which may change, and its content. */
type Entry = { value: () => string; content: () => JSX.Element };

/** What an option reads from its list: Listbox's, or Combobox's, which shares ListboxOption. */
export type Shared = {
  id: string;
  selected: (value: string) => boolean;
  /** Lists an option, for the field to show when it's chosen. Returns the removal. */
  add: (entry: Entry) => () => void;
  /** Ties an option's element to its value, for the keys to pick it by. */
  bind: (el: HTMLElement, value: () => string) => void;
};

export const ListboxContext = createContext<Shared>();

/** True while an option's content renders in the field, where its description doesn't show. */
const InValueContext = createContext(false);

type Common = {
  /** The button's id. In a Field, the Field's. Made up when left out. */
  id?: string;
  /** Shown, muted, while nothing is chosen. */
  placeholder?: string;
  /** The name the form sends the value under. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Where each option's description goes: under its label (the default), or after it on the same line, for a short one. */
  descriptions?: "below" | "inline";
  /** Where the list opens against the field, as on PopoverPanel. */
  anchor?: PopoverPanelProps["anchor"];
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["aria-invalid"];
  /** The button. */
  ref?: unknown;
  children?: JSX.Element;
};

type Single = Common & {
  multiple?: false;
  /** The chosen option's value, or "" for none. Left out, the list keeps its own, from defaultValue. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

type Multiple = Common & {
  /** Several options can be chosen. Each pick turns one on or off, and the list stays open. */
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
};

export type ListboxProps = Single | Multiple;

const toList = (value: string | string[] | undefined) =>
  value === undefined ? undefined : Array.isArray(value) ? value : value === "" ? [] : [value];

/**
 * An option's id: the Listbox's, then -option-, then the value with its spaces and other marks
 * escaped, so no two values share one, none splits an id list, and none meets -value or -error.
 */
export const idFor = (id: string, value: string) => `${id}-option-${encodeURIComponent(value)}`;

export function Listbox(props: ListboxProps) {
  const field = useField({
    get "aria-describedby"() {
      return props["aria-describedby"];
    },
    get "aria-invalid"() {
      return props["aria-invalid"];
    },
    get disabled() {
      return props.disabled;
    },
  });
  const id = field.id ?? props.id ?? createUniqueId();

  const [own, setOwn] = createSignal<string[]>(toList(props.defaultValue) ?? []);
  const chosen = () => toList(props.value) ?? own();
  const [entries, setEntries] = createSignal<readonly Entry[]>([]);
  const values = new WeakMap<HTMLElement, () => string>();
  /** The label's id: <id>-label, unless the label has its own. */
  const [labelId, setLabelId] = createSignal(`${id}-label`);

  let button: HTMLButtonElement | undefined;
  let listbox: HTMLElement | undefined;
  let select: HTMLSelectElement | undefined;

  const shared: Shared = {
    id,
    selected: (value) => chosen().includes(value),
    add(entry) {
      setEntries((all) => [...all, entry]);
      return () => setEntries((all) => all.filter((other) => other !== entry));
    },
    bind: (el, value) => values.set(el, value),
  };

  /**
   * Sets the value, tells the parent, and tells the form, as a native control's input and change
   * events do. A form's reset tells only the parent: a native reset fires no events, and the Field
   * would take them for an edit. Nothing, if the value is the same.
   */
  function set(next: string[], reset = false) {
    const now = chosen();
    if (next.length === now.length && next.every((value, i) => value === now[i])) return;
    setOwn(next);
    if (props.multiple) props.onChange?.(next);
    else props.onChange?.(next[0] ?? "");
    if (reset) return;
    flush();
    for (const type of ["input", "change"]) select?.dispatchEvent(new Event(type, { bubbles: true }));
  }

  function pick(option: HTMLElement) {
    const value = values.get(option)?.();
    if (value === undefined) return;
    const now = chosen();
    if (!props.multiple) return set([value]);
    set(now.includes(value) ? now.filter((other) => other !== value) : [...now, value]);
  }

  /** The chosen options' labels, in the list's order, for a field that holds several. */
  const labels = createMemo(() => {
    const now = chosen();
    entries();
    if (!listbox) return "";
    return [...listbox.querySelectorAll<HTMLElement>('[role="option"]')]
      .filter((el) => {
        const value = values.get(el)?.();
        return value !== undefined && now.includes(value);
      })
      .map(itemLabel)
      .join(", ");
  });

  const single = () => {
    const value = chosen()[0];
    return props.multiple || value === undefined ? undefined : entries().find((entry) => entry.value() === value);
  };
  const empty = () => (props.multiple ? labels() === "" : single() === undefined);

  // Once on the page: the keys, the label's id, the form's reset, and the Field hearing the field left.
  onSettled(() => {
    if (!button || !listbox) return;
    const doc = button.ownerDocument;
    const label = doc.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (label?.id) setLabelId(label.id);
    else if (label) label.id = labelId();
    const unwire = wireListbox(listbox, pick);
    const popup = listbox.parentElement!;
    // The hidden select never has focus, so it hears the field left from here, for its Field's
    // check: focus moving outside, or to nothing, as a native control's focusout does.
    const left = (event: FocusEvent) => {
      const to = event.relatedTarget;
      if (to instanceof Node && (popup.contains(to) || button!.contains(to))) return;
      select?.dispatchEvent(new FocusEvent("focusout"));
    };
    button.addEventListener("focusout", left);
    popup.addEventListener("focusout", left);
    const stopReset = onFormReset(select ?? button, () => set(toList(props.defaultValue) ?? [], true));
    return () => {
      unwire();
      stopReset();
      button?.removeEventListener("focusout", left);
      popup.removeEventListener("focusout", left);
    };
  });

  function wireButton(el: HTMLButtonElement) {
    button = el;
    forward(props.ref, el);
  }

  const anchor = () => (props.anchor === "bottom start" ? undefined : props.anchor);
  const named = () => (props["aria-label"] ? `${id} ${id}-value` : `${labelId()} ${id}-value`);

  return (
    <ListboxContext value={shared}>
      <button
        ref={wireButton}
        type="button"
        id={id}
        commandfor={`${id}-options`}
        command="toggle-popover"
        aria-haspopup="listbox"
        aria-label={props["aria-label"]}
        aria-labelledby={named()}
        aria-describedby={field["aria-describedby"] ?? props["aria-describedby"]}
        aria-invalid={field["aria-invalid"] ?? props["aria-invalid"]}
        disabled={field.disabled ?? props.disabled}
      >
        <beautiful-listbox-value id={`${id}-value`} data-placeholder={empty() ? "" : undefined}>
          <Show when={!empty()} fallback={props.placeholder}>
            <Show when={single()} fallback={labels()}>
              {(entry) => <InValueContext value={true}>{entry().content()}</InValueContext>}
            </Show>
          </Show>
        </beautiful-listbox-value>
      </button>
      <beautiful-popover popover id={`${id}-options`} data-anchor={anchor()}>
        <beautiful-listbox
          ref={(el: HTMLElement) => (listbox = el)}
          role="listbox"
          data-descriptions={props.descriptions === "inline" ? "inline" : undefined}
          tabindex="-1"
          aria-label={props["aria-label"]}
          aria-labelledby={props["aria-label"] ? undefined : labelId()}
          aria-multiselectable={props.multiple ? "true" : undefined}
        >
          {props.children}
        </beautiful-listbox>
      </beautiful-popover>
      <Show when={props.name !== undefined || props.required}>
        <select
          ref={[(el: HTMLSelectElement) => (select = el), field.ref as (el: Checkable) => void]}
          hidden
          name={props.name}
          required={props.required}
          multiple={props.multiple}
          disabled={field.disabled ?? props.disabled}
        >
          <For each={chosen()}>{(value) => <option value={value} selected />}</For>
        </select>
      </Show>
    </ListboxContext>
  );
}

export type ListboxOptionProps = Omit<JSX.HTMLAttributes<HTMLElement>, "id" | "role"> & {
  /** What choosing it sets the value to, and what the form sends. */
  value: string;
  /** Fades it. The keys and the pointer pass over it. */
  disabled?: boolean;
};

/** One choice: its children are its label, and any icon or description. */
export function ListboxOption(props: ListboxOptionProps) {
  const shared = useContext(ListboxContext);
  const rest = omit(props, "value", "disabled", "children", "ref");
  // Listed once it's on the page, so the field can show it, and unlisted when it goes.
  onSettled(() => shared.add({ value: () => props.value, content: () => props.children }));

  function bind(el: HTMLElement) {
    shared.bind(el, () => props.value);
    forward(props.ref, el);
  }

  return (
    <beautiful-listbox-option
      {...rest}
      ref={bind}
      role="option"
      id={idFor(shared.id, props.value)}
      aria-selected={shared.selected(props.value) ? "true" : "false"}
      aria-disabled={props.disabled ? "true" : undefined}
    >
      {props.children}
    </beautiful-listbox-option>
  );
}

/** A line under an option's label, read with it. The field doesn't show it. */
export function ListboxDescription(props: JSX.HTMLAttributes<HTMLElement>) {
  const inValue = useContext(InValueContext);
  return <Show when={!inValue}>{<small {...props} />}</Show>;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-listbox-value": HTMLAttributes<HTMLElement>;
      "beautiful-listbox": HTMLAttributes<HTMLElement>;
      "beautiful-listbox-option": HTMLAttributes<HTMLElement>;
    }
  }
}
