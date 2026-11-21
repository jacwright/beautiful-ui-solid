import type { JSX } from "@solidjs/web";
import { createEffect, createSignal, createUniqueId, flush, For, omit, onSettled, Show } from "solid-js";
import { fold, wireCombobox } from "./autocomplete.ts";
import type { ChipColor } from "./chip.tsx";
import { type Checkable, onFormReset, useField } from "./fieldset.tsx";
import { idFor, ListboxContext, ListboxDescription, ListboxOption, type ListboxOptionProps, type Shared } from "./listbox.tsx";
import { itemLabel } from "./menu.ts";
import { forward, type PopoverPanelProps } from "./popover.tsx";

/**
 * Tag field: a field that holds several values, each a Chip, with a text box after them that
 * filters a list of options as you type, as Combobox's does. Picking an option adds its chip and
 * empties the text box, and the list stays open for the next. With create, what was typed can
 * become a tag of its own. wireCombobox (autocomplete.ts, with multiple) adds the list's keys; this
 * file adds the chips' keys. The look is CSS (styles/elements/tag-field.css, with chip.css,
 * listbox.css and combobox.css). The spec is the docs site's Tag field page.
 *
 *   <beautiful-tag-field>                    the well, Input's look, that the chips and text share
 *     <beautiful-chips role="list">           the chosen values, each a <beautiful-chip> with its ×
 *     <input role="combobox">                 the text box
 *     <button tabindex="-1">                  the chevrons, for the pointer
 *   </beautiful-tag-field>
 *   <beautiful-popover popover="manual">      the list, aria-multiselectable, and "No matches"
 *   <beautiful-visually-hidden role="status"> "Added …" or "Removed …", for screen readers
 *
 * The ids follow Combobox's rule: the text box's is the Tag field's id (a Field's, in one), the
 * panel's <id>-options, the list's <id>-listbox, each option's <id>-option-<value>, the chips'
 * <id>-chips and the label's <id>-label.
 *
 * With a name or required, a hidden native <select multiple> holds the values, so the form sends,
 * checks and resets them, and a Field checks it too.
 */

export type TagFieldProps = {
  /** The text box's id. In a Field, the Field's. Made up when left out. */
  id?: string;
  /** The chosen values, in the order they were added. Left out, the field keeps its own, from defaultValue. */
  value?: string[];
  defaultValue?: string[];
  /** Hears the new values when a tag is added or removed, or the form is reset. */
  onChange?: (value: string[]) => void;
  /**
   * Lets what was typed become a tag: the list offers "Add …", and a comma, Enter on it, a paste
   * of a list, or leaving the field adds it. true makes the typed text, trimmed, the value. A
   * function makes the value from it, or returns undefined to turn it down.
   */
  create?: boolean | ((text: string) => string | undefined);
  /** Which options show for what was typed, as on Combobox. false shows all, for a page that filters them itself. */
  filter?: ((label: string, query: string) => boolean) | false;
  /** Hears the typed text as it changes, and "" when the list opens whole or closes. */
  onQuery?: (query: string) => void;
  /** Shown, muted, in the text box while no tag is chosen. */
  placeholder?: string;
  /** The name the form sends each value under. */
  name?: string;
  /** The form won't send until a tag is chosen. */
  required?: boolean;
  disabled?: boolean;
  /** Where the list opens against the field, as on PopoverPanel. */
  anchor?: PopoverPanelProps["anchor"];
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: JSX.InputHTMLAttributes<HTMLInputElement>["aria-invalid"];
  /** The text box. */
  ref?: unknown;
  children?: JSX.Element;
};

/** A chosen value as its chip shows it. */
type Tag = { value: string; label: string; color?: ChipColor };

/** Splits a paste into the tags it lists: one a line, or one between commas. */
const pieces = (text: string) =>
  text
    .split(/[,\n]/)
    .map((piece) => piece.trim())
    .filter(Boolean);

const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((value, i) => value === b[i]);

export function TagField(props: TagFieldProps) {
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

  const [own, setOwn] = createSignal<string[]>(props.defaultValue ?? []);
  const chosen = () => props.value ?? own();
  /** Bumped as options come and go, so each chip finds its option's label once it's there. */
  const [listed, setListed] = createSignal(0);
  const values = new WeakMap<HTMLElement, () => string>();
  const [labelId, setLabelId] = createSignal(`${id}-label`);
  /** The typed text, for the "Add" row. */
  const [query, setQuery] = createSignal("");
  /** What the chips show: each value's label, kept while its option is out of the list. */
  const [tags, setTags] = createSignal<Tag[]>([]);
  /** The last label and color seen for each value, as Combobox keeps its chosen label. */
  const known = new Map<string, Omit<Tag, "value">>();
  /** "Added …" or "Removed …", read by screen readers. */
  const [news, setNews] = createSignal("");

  let well: HTMLElement | undefined;
  let input: HTMLInputElement | undefined;
  let listbox: HTMLElement | undefined;
  let select: HTMLSelectElement | undefined;

  const shared: Shared = {
    id,
    selected: (value) => chosen().includes(value),
    add() {
      setListed((n) => n + 1);
      return () => setListed((n) => n + 1);
    },
    bind: (el, value) => values.set(el, value),
  };

  /**
   * Sets the values, tells the parent, and tells the form, as a native control's input and change
   * events do. A form's reset tells only the parent. Nothing, if the values are the same.
   */
  function set(next: string[], reset = false) {
    if (same(next, chosen())) return;
    setOwn(next);
    props.onChange?.(next);
    if (reset) return;
    flush();
    for (const type of ["input", "change"]) select?.dispatchEvent(new Event(type, { bubbles: true }));
  }

  /** What a chip shows for a value: its option's label and color, else the last ones seen, else the value. */
  function tagFor(value: string): Tag {
    const option = input?.ownerDocument.getElementById(idFor(id, value));
    if (option && !option.hasAttribute("data-create")) {
      known.set(value, { label: itemLabel(option), color: (option.getAttribute("data-chip-color") as ChipColor | null) ?? undefined });
    }
    return { value, ...(known.get(value) ?? { label: value }) };
  }

  // The chips follow the values, and an option's label once it renders.
  createEffect(
    () => [chosen(), listed()] as const,
    ([now]) => {
      if (!input) return;
      setTags(now.map(tagFor));
    },
  );

  function announce(words: string) {
    // The same words twice are still news: empty first, so the status changes.
    setNews("");
    flush();
    setNews(words);
  }

  /** Adds a value. Returns whether it's in, so a controlled page that turns it down hears no "Added". */
  function add(value: string, label: string) {
    if (chosen().includes(value)) return true;
    if (!known.has(value)) known.set(value, { label });
    set([...chosen(), value]);
    flush();
    if (!chosen().includes(value)) return false;
    announce(`Added ${tagFor(value).label}`);
    return true;
  }

  function remove(value: string) {
    const label = tagFor(value).label;
    set(chosen().filter((other) => other !== value));
    flush();
    if (!chosen().includes(value)) announce(`Removed ${label}`);
  }

  /** The option whose label is the text, folded as the filter folds it, so "zurich" finds Zürich. */
  function optionNamed(text: string) {
    const folded = fold(text.trim());
    return listbox && [...listbox.querySelectorAll<HTMLElement>('[role="option"]:not([data-create])')].find((option) => fold(itemLabel(option)) === folded);
  }

  /** The value typed text makes, or undefined where create is off or turns it down. */
  function created(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !props.create) return undefined;
    return props.create === true ? trimmed : props.create(trimmed);
  }

  /** Adds typed text as a tag, or the option whose label it is. */
  function addTyped(text: string) {
    const trimmed = text.trim();
    const match = optionNamed(trimmed);
    // A disabled option can't be had by typing its name either.
    if (match?.getAttribute("aria-disabled") === "true") return false;
    const value = match ? values.get(match)?.() : created(trimmed);
    if (value === undefined || value === "") return false;
    return add(value, match ? itemLabel(match) : trimmed);
  }

  // An option turns on or off. The "Add" row adds what was typed.
  function pick(option: HTMLElement) {
    if (option.hasAttribute("data-create")) {
      addTyped(option.getAttribute("data-create")!);
      return;
    }
    const value = values.get(option)?.();
    if (value === undefined) return;
    if (chosen().includes(value)) remove(value);
    else add(value, itemLabel(option));
  }

  /** The chips' × buttons, in order. */
  const removers = () => (well ? [...well.querySelectorAll<HTMLButtonElement>("beautiful-chips > beautiful-chip > button")] : []);

  /** Removes a chip by its ×, then puts focus on the one before (Backspace) or after (Delete), or back in the text box. */
  function removeAt(button: HTMLButtonElement, toward: "before" | "after" | "text") {
    const at = removers().indexOf(button);
    const value = chosen()[at];
    if (value === undefined) return;
    remove(value);
    flush();
    const left = removers();
    const next = toward === "before" ? left[at - 1] : toward === "after" ? left[at] : undefined;
    // A controlled page that keeps the chip keeps its focus.
    if (button.isConnected && left.includes(button)) return;
    (next ?? input)?.focus();
  }

  function onChipKey(event: KeyboardEvent & { currentTarget: HTMLButtonElement }) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const all = removers();
    const at = all.indexOf(event.currentTarget);
    switch (event.key) {
      case "Backspace":
      case "Delete":
        event.preventDefault();
        // A held key would go on through every chip.
        if (!event.repeat) removeAt(event.currentTarget, event.key === "Backspace" ? "before" : "after");
        return;
      case "ArrowLeft":
        event.preventDefault();
        all[Math.max(at - 1, 0)]?.focus();
        return;
      case "ArrowRight":
        event.preventDefault();
        (all[at + 1] ?? input)?.focus();
        return;
      case "Home":
        event.preventDefault();
        all[0]?.focus();
        return;
      case "End":
        event.preventDefault();
        input?.focus();
        return;
    }
  }

  function onTextKey(event: KeyboardEvent) {
    if (!input || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    if ((event.key === "Backspace" || event.key === "ArrowLeft") && atStart && !event.shiftKey) {
      // From an empty text box, or the caret at its start, the keys go back to the chips.
      const last = removers().at(-1);
      if (!last || (event.key === "Backspace" && input.value !== "")) return;
      event.preventDefault();
      last.focus();
      return;
    }
    // A comma adds what was typed, and so does Enter with the list shut, rather than sending the form without it.
    const shut = input.getAttribute("aria-expanded") !== "true";
    if (props.create && (event.key === "," || (event.key === "Enter" && shut && input.value.trim()))) {
      event.preventDefault();
      if (addTyped(input.value)) clearText();
    }
  }

  function clearText() {
    if (!input) return;
    input.value = "";
    // The combobox hears it as typing, so the filter resets with it.
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function onPaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData("text") ?? "";
    if (!props.create || !/[,\n]/.test(text)) return;
    event.preventDefault();
    // What was typed stays, and so does each piece that couldn't be added, for the person to fix.
    const left = pieces(text).filter((piece) => !addTyped(piece));
    if (!input) return;
    input.value = [input.value.trim(), ...left].filter(Boolean).join(", ");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // A press on the well, away from the chips' × and the text, puts the caret in the text box.
  function onWellDown(event: MouseEvent) {
    if (!input || input.disabled) return;
    const target = event.target as Element;
    if (target === input || target.closest("button")) return;
    event.preventDefault();
    input.focus();
  }

  onSettled(() => {
    if (!input || !listbox) return;
    const doc = input.ownerDocument;
    const labelEl = doc.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (labelEl?.id) setLabelId(labelEl.id);
    else if (labelEl) labelEl.id = labelId();
    setTags(chosen().map(tagFor));
    const unwire = wireCombobox(input, {
      multiple: true,
      pick,
      get filter() {
        return props.filter;
      },
      onQuery: (text) => {
        setQuery(text);
        props.onQuery?.(text);
      },
      leave: (text) => {
        if (props.create) addTyped(text);
      },
    });
    // The hidden select never has focus, so it hears the field left, for its Field's check.
    const left = (event: FocusEvent) => {
      const to = event.relatedTarget;
      if (to instanceof Node && well?.contains(to)) return;
      // Left from a chip, the text the person went back past is handled as leaving the text box handles it.
      if (input && event.target !== input && doc.hasFocus() && input.value.trim()) {
        // After the task, so a chip removed under focus, which hands it on to the next, isn't taken for leaving.
        queueMicrotask(() => {
          if (!input || (doc.activeElement && well?.contains(doc.activeElement))) return;
          if (!props.create || addTyped(input.value)) input.value = "";
        });
      }
      select?.dispatchEvent(new FocusEvent("focusout"));
    };
    well?.addEventListener("focusout", left);
    const stopReset = onFormReset(select ?? input, () => set(props.defaultValue ?? [], true));
    return () => {
      unwire();
      stopReset();
      well?.removeEventListener("focusout", left);
    };
  });

  function wireInput(el: HTMLInputElement) {
    input = el;
    forward(props.ref, el);
  }

  const anchor = () => (props.anchor === "bottom start" ? undefined : props.anchor);
  const disabled = () => field.disabled ?? props.disabled;
  /** The "Add" row: offered for typed text that isn't already an option's label or a tag. */
  const offer = () => {
    const text = query().trim();
    if (!text || !props.create) return undefined;
    listed();
    const folded = fold(text);
    if (tags().some((tag) => fold(tag.label) === folded)) return undefined;
    if (optionNamed(text)) return undefined;
    // Not offered for text that create would turn down.
    return created(text) === undefined ? undefined : text;
  };

  return (
    <ListboxContext value={shared}>
      <beautiful-tag-field ref={(el: HTMLElement) => (well = el)} aria-disabled={disabled() ? "true" : undefined} onMouseDown={onWellDown}>
        <beautiful-chips role="list" id={`${id}-chips`} aria-label={props["aria-label"] ? `${props["aria-label"]}, chosen` : undefined} aria-labelledby={props["aria-label"] ? undefined : labelId()}>
          <For each={chosen()}>
            {(value) => {
              // Keyed by value, so a chip stays the same element as others come and go.
              const tag = () => tags().find((one) => one.value === value) ?? { value, label: known.get(value)?.label ?? value };
              return (
              <beautiful-chip role="listitem" data-color={tag().color === "neutral" ? undefined : tag().color}>
                {tag().label}
                <button
                  type="button"
                  tabindex="-1"
                  aria-label={`Remove ${tag().label}`}
                  disabled={disabled()}
                  onClick={(event) => removeAt(event.currentTarget, "text")}
                  onKeyDown={onChipKey}
                />
              </beautiful-chip>
              );
            }}
          </For>
        </beautiful-chips>
        <input
          ref={wireInput}
          id={id}
          type="text"
          role="combobox"
          aria-controls={`${id}-listbox`}
          aria-expanded="false"
          aria-autocomplete="list"
          autocomplete="off"
          aria-label={props["aria-label"]}
          aria-describedby={field["aria-describedby"] ?? props["aria-describedby"]}
          aria-invalid={field["aria-invalid"] ?? props["aria-invalid"]}
          placeholder={tags().length ? undefined : props.placeholder}
          disabled={disabled()}
          onKeyDown={onTextKey}
          onPaste={onPaste}
        />
        <button type="button" data-variant="tertiary" tabindex="-1" aria-label="Show options" aria-controls={`${id}-listbox`} aria-expanded="false" disabled={disabled()}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m7 7.5 3-3 3 3M7 12.5l3 3 3-3" />
          </svg>
        </button>
      </beautiful-tag-field>
      <beautiful-popover popover="manual" id={`${id}-options`} data-anchor={anchor()}>
        <beautiful-listbox
          ref={(el: HTMLElement) => (listbox = el)}
          role="listbox"
          id={`${id}-listbox`}
          aria-multiselectable="true"
          aria-label={props["aria-label"]}
          aria-labelledby={props["aria-label"] ? undefined : labelId()}
        >
          {props.children}
          <Show when={offer()}>
            {(text) => (
              <beautiful-listbox-option role="option" id={`${id}-create`} aria-selected="false" data-create={text()}>
                Add “{text()}”
              </beautiful-listbox-option>
            )}
          </Show>
        </beautiful-listbox>
        <p role="status">No matches</p>
      </beautiful-popover>
      <beautiful-visually-hidden role="status">{news()}</beautiful-visually-hidden>
      <Show when={props.name !== undefined || props.required}>
        <select ref={[(el: HTMLSelectElement) => (select = el), field.ref as (el: Checkable) => void]} hidden multiple name={props.name} required={props.required} disabled={disabled()}>
          <For each={chosen()}>{(value) => <option value={value} selected />}</For>
        </select>
      </Show>
    </ListboxContext>
  );
}

export type TagFieldOptionProps = ListboxOptionProps & {
  /** The chip's color once it's chosen: one of Chip's. Left out, neutral. */
  color?: ChipColor;
};

/** One choice: its children are its label, and any icon or description. Listbox's option, with its chip's color. */
export function TagFieldOption(props: TagFieldOptionProps) {
  const rest = omit(props, "color");
  return <ListboxOption {...rest} data-chip-color={props.color} />;
}

/** A line under an option's label, read with it. The filter doesn't match it. */
export const TagFieldDescription = ListboxDescription;

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-tag-field": HTMLAttributes<HTMLElement>;
    }
  }
}
