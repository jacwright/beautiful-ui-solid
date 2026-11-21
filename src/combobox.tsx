import type { JSX } from "@solidjs/web";
import { createEffect, createSignal, createUniqueId, flush, onSettled, Show } from "solid-js";
import { wireCombobox } from "./autocomplete.ts";
import { type Checkable, onFormReset, useField } from "./fieldset.tsx";
import { idFor, ListboxContext, ListboxDescription, ListboxOption, type ListboxOptionProps, type Shared } from "./listbox.tsx";
import { itemLabel } from "./menu.ts";
import { forward, type PopoverPanelProps } from "./popover.tsx";

/**
 * Combobox: a text box that filters a list of options as you type. The text box is Input's, in a
 * <beautiful-input-group> with a chevron button at its end (a search box has a magnifying glass at
 * its start instead), and the list is Listbox's: the same
 * options (ComboboxOption is ListboxOption), in a manual popover opened against the group.
 * wireCombobox (autocomplete.ts) adds the keys, the filter and the pointer, with focus in the text
 * box and aria-activedescendant on the lit option. The look is CSS (styles/elements/combobox.css,
 * listbox.css and input.css). The spec is the docs site's Combobox page.
 *
 * The ids follow Listbox's rule: the text box's is the Combobox's id (a Field's, in one), the
 * panel's <id>-options, the list's <id>-listbox, each option's <id>-option-<value>, and the label's
 * <id>-label.
 *
 * The value is always an option's, never the typed text. With a name or required, a hidden native
 * <select> holds it, so the form sends, checks and resets it, and a Field checks it too.
 */

export type ComboboxProps = {
  /** The text box's id. In a Field, the Field's. Made up when left out. */
  id?: string;
  /** The chosen option's value, or "" for none. Left out, the field keeps its own, from defaultValue. */
  value?: string;
  defaultValue?: string;
  /** Hears the new value when an option is picked, the text is cleared, or the form is reset. "" is none. */
  onChange?: (value: string) => void;
  /** Which options show for what was typed. Left out, those whose label holds it. false shows all, for a page that filters them itself. */
  filter?: ((label: string, query: string) => boolean) | false;
  /** Hears the typed text as it changes, and "" when the list opens whole or closes. */
  onQuery?: (query: string) => void;
  /** Shown, muted, in the empty text box. */
  placeholder?: string;
  /** The name the form sends the value under. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Where each option's description goes: under its label (the default), or after it on the same line, for a short one. */
  descriptions?: "below" | "inline";
  /**
   * A search box: a magnifying glass at its start, fully rounded, and no button at its end, since
   * the list is what was typed, not a set to browse. The input is type="search": the list opens only
   * on text, and closes when the text is cleared.
   */
  search?: boolean;
  /** Where the list opens against the field, as on PopoverPanel. */
  anchor?: PopoverPanelProps["anchor"];
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: JSX.InputHTMLAttributes<HTMLInputElement>["aria-invalid"];
  /** The text box. */
  ref?: unknown;
  children?: JSX.Element;
};

export function Combobox(props: ComboboxProps) {
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

  const [own, setOwn] = createSignal(props.defaultValue ?? "");
  const chosen = () => props.value ?? own();
  /** Bumped as options come and go, so the text finds the chosen one's label once it's there. */
  const [listed, setListed] = createSignal(0);
  const values = new WeakMap<HTMLElement, () => string>();
  const [labelId, setLabelId] = createSignal(`${id}-label`);
  /** The chosen option's label, kept while its option is out of the list, as with a page's own search. */
  let label: string | undefined;
  /** The value label belongs to. */
  let labelFor = "";

  let input: HTMLInputElement | undefined;
  let listbox: HTMLElement | undefined;
  let select: HTMLSelectElement | undefined;

  const shared: Shared = {
    id,
    selected: (value) => value !== "" && chosen() === value,
    add() {
      setListed((n) => n + 1);
      return () => setListed((n) => n + 1);
    },
    bind: (el, value) => values.set(el, value),
  };

  /**
   * Sets the value, tells the parent, and tells the form, as a native control's input and change
   * events do. A form's reset tells only the parent. Nothing, if the value is the same.
   */
  function set(next: string, reset = false) {
    if (next === chosen()) return;
    setOwn(next);
    props.onChange?.(next);
    if (reset) return;
    flush();
    for (const type of ["input", "change"]) select?.dispatchEvent(new Event(type, { bubbles: true }));
  }

  /** Puts the chosen option's label in the text box, keeping the last one known while its option is out of the list. */
  function showChosen(value = chosen()) {
    if (!input) return;
    const option = value ? input.ownerDocument.getElementById(idFor(id, value)) : null;
    if (option) label = itemLabel(option);
    else if (value !== labelFor) label = undefined;
    labelFor = value;
    input.value = label ?? "";
  }

  // After the value is set, the text shows what it is, so a controlled page that turns a pick down shows its own.
  function pick(option: HTMLElement) {
    const value = values.get(option)?.();
    if (value === undefined) return;
    set(value);
    flush();
    showChosen();
  }

  function clear() {
    set("");
    flush();
    showChosen();
  }

  // The text follows the value when it changes from outside: a controlled value, or a reset. It
  // doesn't change under typing: the text the person is writing is theirs until they leave.
  let shownFor: string | undefined;
  createEffect(
    () => [chosen(), listed()] as const,
    ([value]) => {
      if (!input || !listbox) return;
      const typing = input.ownerDocument.activeElement === input && input.getAttribute("aria-expanded") === "true";
      if (value !== shownFor || !typing) showChosen(value);
      shownFor = value;
    },
  );

  onSettled(() => {
    if (!input || !listbox) return;
    const doc = input.ownerDocument;
    const labelEl = doc.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (labelEl?.id) setLabelId(labelEl.id);
    else if (labelEl) labelEl.id = labelId();
    const unwire = wireCombobox(input, {
      pick,
      clear,
      chosen: () => label,
      get filter() {
        return props.filter;
      },
      onQuery: (query) => props.onQuery?.(query),
    });
    // The hidden select never has focus, so it hears the field left from the text box, for its Field's check.
    const left = () => select?.dispatchEvent(new FocusEvent("focusout"));
    input.addEventListener("focusout", left);
    // The browser empties the text box on reset, so the text is put back even when the value stays.
    const stopReset = onFormReset(select ?? input, () => {
      set(props.defaultValue ?? "", true);
      flush();
      showChosen();
    });
    return () => {
      unwire();
      stopReset();
      input?.removeEventListener("focusout", left);
    };
  });

  function wireInput(el: HTMLInputElement) {
    input = el;
    forward(props.ref, el);
  }

  const anchor = () => (props.anchor === "bottom start" ? undefined : props.anchor);
  const disabled = () => field.disabled ?? props.disabled;

  return (
    <ListboxContext value={shared}>
      <beautiful-input-group data-search={props.search ? "" : undefined}>
        <Show when={props.search}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13 13l4 4" />
          </svg>
        </Show>
        <input
          ref={wireInput}
          id={id}
          type={props.search ? "search" : "text"}
          role="combobox"
          aria-controls={`${id}-listbox`}
          aria-expanded="false"
          aria-autocomplete="list"
          autocomplete="off"
          aria-label={props["aria-label"]}
          aria-describedby={field["aria-describedby"] ?? props["aria-describedby"]}
          aria-invalid={field["aria-invalid"] ?? props["aria-invalid"]}
          placeholder={props.placeholder}
          disabled={disabled()}
        />
        <Show when={!props.search}>
          <button type="button" data-variant="tertiary" tabindex="-1" aria-label="Show options" aria-controls={`${id}-listbox`} aria-expanded="false" disabled={disabled()}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m7 7.5 3-3 3 3M7 12.5l3 3 3-3" />
            </svg>
          </button>
        </Show>
      </beautiful-input-group>
      <beautiful-popover popover="manual" id={`${id}-options`} data-anchor={anchor()}>
        <beautiful-listbox
          ref={(el: HTMLElement) => (listbox = el)}
          role="listbox"
          data-descriptions={props.descriptions === "inline" ? "inline" : undefined}
          id={`${id}-listbox`}
          aria-label={props["aria-label"]}
          aria-labelledby={props["aria-label"] ? undefined : labelId()}
        >
          {props.children}
        </beautiful-listbox>
        <p role="status">No matches</p>
      </beautiful-popover>
      <Show when={props.name !== undefined || props.required}>
        <select ref={[(el: HTMLSelectElement) => (select = el), field.ref as (el: Checkable) => void]} hidden name={props.name} required={props.required} disabled={disabled()}>
          <Show when={chosen()}>{(value) => <option value={value()} selected />}</Show>
        </select>
      </Show>
    </ListboxContext>
  );
}

export type ComboboxOptionProps = ListboxOptionProps;

/** One choice: its children are its label, and any icon or description. Listbox's option. */
export const ComboboxOption = ListboxOption;

/** A line under an option's label, read with it. The filter doesn't match it. */
export const ComboboxDescription = ListboxDescription;
