/**
 * Autocomplete: a text box that filters a list of options as you type, the keys and pointer of
 * Combobox (APG's combobox with list autocomplete). The list is Listbox's: wireOptions (options.ts)
 * with the input as its owner, so focus stays in the input while ↓ ↑ move the lit option, named by
 * aria-activedescendant.
 *
 * wireCombobox wires a Combobox's static markup:
 *
 *   <beautiful-input-group>
 *     <input role="combobox" aria-controls="<id>-listbox" aria-expanded aria-autocomplete="list">
 *     <button tabindex="-1" aria-label="Show options">chevrons</button>
 *   </beautiful-input-group>
 *   <beautiful-popover popover="manual" id="<id>-options">
 *     <beautiful-listbox role="listbox" id="<id>-listbox">options…</beautiful-listbox>
 *     <p role="status">No matches</p>
 *   </beautiful-popover>
 *
 * The popover is manual: focus never leaves the input, so this file opens and closes it, against
 * the input group, and the browser's light dismiss, which would close it on a click in the input,
 * stays out of it. A filtered-out option is hidden, and CSS shows the "no matches" line when none
 * is left. From the APG combobox pattern and Headless UI's Combobox. The spec is the docs site's
 * Combobox page.
 */

import { itemLabel } from "./menu.ts";
import { pickInMarkup, wireOptions } from "./options.ts";

/** Folds case and accents, so "zur" finds Zürich. */
export const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** The default filter: the option's label holds what was typed, anywhere in it. */
export const labelIncludes = (label: string, query: string) => fold(label).includes(fold(query.trim()));

export type ComboboxWiring = {
  /** Chooses an option. Left out, the markup marks it selected (pickInMarkup). */
  pick?: (option: HTMLElement) => void;
  /** Chooses nothing: the text was cleared and the field left. Left out, the markup marks none selected. */
  clear?: () => void;
  /** Whether an option shows for what was typed. false shows them all, for a page that filters the options itself. */
  filter?: ((label: string, query: string) => boolean) | false;
  /** The chosen option's label, or undefined for none, for a page whose options come and go. Left out, the markup's selected option says. */
  chosen?: () => string | undefined;
  /** Hears each change to the typed text, and "" when the list resets to show everything. */
  onQuery?: (query: string) => void;
  /**
   * Several options can be chosen, as in Tag field: a pick empties the text box and the list stays
   * open on the option picked. Escape or leaving empties the text box, and nothing is restored.
   */
  multiple?: boolean;
  /** With multiple, hears the text left in the box when focus leaves the field, before it is emptied. */
  leave?: (text: string) => void;
};

/**
 * Wires a Combobox: its input, the button after it, and the listbox its aria-controls names.
 * Returns a function that removes everything it added.
 *
 *   - Typing filters the list and opens it, with the first match lit, so Enter picks it.
 *   - ↓ on the input opens the list on the chosen option, or the first. ↑ opens it on the chosen
 *     option, or the last. Alt ↓ opens it without lighting one. A click on the input or the button
 *     opens the whole list, and the button closes it again.
 *   - In the list, ↓ ↑ move without wrapping and Page Down Page Up jump. Home, End, ← and → stay
 *     the text box's, for the caret.
 *   - Enter or a click picks: the text becomes its label and the list closes. With multiple, the
 *     pick turns the option on or off, the text empties, and the list stays open.
 *   - Escape closes and puts the chosen label back. Leaving the field does the same, and a field
 *     left empty chooses nothing.
 *   - A search box (input type="search", Combobox's search) has no whole list to browse: it opens
 *     only on what was typed, and closes when the text empties.
 */
export function wireCombobox(input: HTMLInputElement, wiring: ComboboxWiring = {}): () => void {
  const doc = input.ownerDocument;
  const listbox = doc.getElementById(input.getAttribute("aria-controls") ?? "");
  const popup = listbox?.closest<HTMLElement>("[popover]");
  if (!listbox || !popup) return () => {};
  const group = input.closest<HTMLElement>("beautiful-input-group, beautiful-tag-field") ?? input;
  const button = group === input ? null : group.querySelector<HTMLButtonElement>(":scope > button");
  /** A search box lists only what matches the text, never the whole list. */
  const search = input.type === "search";
  const pick = wiring.pick ?? pickInMarkup;
  const clear = wiring.clear ?? (() => listbox.querySelectorAll('[role="option"]').forEach((option) => option.setAttribute("aria-selected", "false")));
  const list = wireOptions(listbox, input, choose);
  /** What was typed since the list last reset: the list shows only what matches it. */
  let query = "";

  const all = () => [...listbox.querySelectorAll<HTMLElement>('[role="option"]')];
  const selected = () => all().find((option) => option.getAttribute("aria-selected") === "true");
  const chosenLabel = () => {
    if (wiring.chosen) return wiring.chosen();
    const chosen = selected();
    return chosen && itemLabel(chosen);
  };
  const isOpen = () => popup.matches(":popover-open");

  /** Shows the options that match the query, or all of them. */
  function filter() {
    const test = wiring.filter;
    // The default folds the query once, not once for each option.
    const folded = fold(query.trim());
    const matches = typeof test === "function" ? test : (label: string) => fold(label).includes(folded);
    for (const option of all()) {
      // A Tag field's "Add" row is the page's to show, for what was typed.
      const show = !query || test === false || option.hasAttribute("data-create") || matches(itemLabel(option), query);
      if (option.hidden === show) option.hidden = !show;
    }
    // "No matches" shows only for something typed, not for a list still empty, such as one loading.
    popup!.toggleAttribute("data-filtered", query !== "");
  }

  function setQuery(next: string) {
    if (next === query) return;
    query = next;
    wiring.onQuery?.(next);
    filter();
  }

  function setExpanded(open: boolean) {
    input.setAttribute("aria-expanded", String(open));
    button?.setAttribute("aria-expanded", String(open));
  }

  /** Opens the list, if it's shut, with the keys on an option, or none. */
  function open(lit?: HTMLElement) {
    if (!isOpen()) {
      popup!.showPopover({ source: group } as ShowPopoverOptions);
      setExpanded(true);
    }
    list.setActive(lit, "center");
  }

  /**
   * Closes the list. With restore, the text goes back to the chosen label, or a cleared field
   * chooses nothing. With multiple, it empties instead, after leave hears it when focus left.
   */
  function close(restore: boolean, left = false) {
    if (isOpen()) popup!.hidePopover();
    setExpanded(false);
    list.setActive(undefined);
    if (wiring.multiple) {
      const text = input.value;
      if (restore) input.value = "";
      if (left && text.trim()) wiring.leave?.(text);
    } else if (restore) {
      const label = chosenLabel();
      if (input.value.trim() === "" && label !== undefined) clear();
      else input.value = label ?? "";
    }
    setQuery("");
  }

  // The text first, so a pick that a controlled page turns down can put its own back.
  function choose(option: HTMLElement) {
    if (wiring.multiple) {
      // The list stays open, whole again, with the keys still on what was picked.
      input.value = "";
      pick(option);
      setQuery("");
      if (option.isConnected && list.options().includes(option)) list.setActive(option, "nearest");
      else list.setActive(undefined);
      return;
    }
    input.value = itemLabel(option);
    pick(option);
    close(false);
  }

  /** Opens on the whole list, with the chosen option lit. A search box opens on what was typed, or stays shut. */
  function openAll(fallback?: "first" | "last") {
    if (search) {
      setQuery(input.value);
      if (query) open(list.options()[0]);
      return;
    }
    setQuery("");
    const options = list.options();
    const chosen = selected();
    open(chosen && options.includes(chosen) ? chosen : fallback === "first" ? options[0] : fallback === "last" ? options.at(-1) : undefined);
  }

  function onInput() {
    setQuery(input.value);
    if (search && !query) return close(false);
    // A page that filters its own options changes them after this. onMutation lights the first.
    open(query ? list.options()[0] : undefined);
  }

  function onKey(event: KeyboardEvent) {
    if (event.isComposing || input.disabled || input.readOnly) return;
    const shut = !isOpen();
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        if (shut) {
          if (search && !input.value) return;
          event.preventDefault();
          if (event.altKey) openAll();
          else openAll(event.key === "ArrowDown" ? "first" : "last");
          return;
        }
        if (event.altKey && event.key === "ArrowUp") {
          event.preventDefault();
          return close(true);
        }
        list.move(event);
        return;
      case "PageDown":
      case "PageUp":
        if (!shut) list.move(event);
        return;
      case "Enter": {
        if (shut) return;
        // Open, Enter belongs to the list, not the form.
        event.preventDefault();
        const active = list.active();
        if (active) choose(active);
        else close(true);
        return;
      }
      case "Escape":
        if (shut) return;
        // Stops a Dialog around it closing too.
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
    }
  }

  function onInputClick() {
    if (!isOpen() && !input.disabled && !input.readOnly) openAll();
  }

  function onButtonClick() {
    if (input.disabled) return;
    if (isOpen()) close(true);
    else openAll();
    input.focus();
  }

  // A press on the list or the button would take focus from the input, and close the list before the click.
  function keepFocus(event: MouseEvent) {
    event.preventDefault();
  }

  function onFocusOut(event: FocusEvent) {
    // The window losing focus, to another app or tab, leaves the typing as it was for the return.
    if (!doc.hasFocus()) return;
    const to = event.relatedTarget;
    // A Tag field's chips sit in the group, past the text box: the list closes for them, and the
    // text stays for the return.
    if (to instanceof Element && group.contains(to) && to.closest("beautiful-chip")) return close(false);
    if (to instanceof Node && (popup!.contains(to) || group.contains(to))) return;
    close(true, true);
  }

  // A page that filters for itself changes the options while the list is open: filter the new
  // ones, and keep the keys on a match.
  const observer = new MutationObserver(() => {
    if (!isOpen()) return;
    filter();
    const options = list.options();
    const active = list.active();
    if (!active || !options.includes(active)) list.setActive(query ? options[0] : undefined, "nearest");
  });
  observer.observe(listbox, { childList: true, subtree: true });

  const listeners: [EventTarget | null, string, (event: never) => void][] = [
    [input, "input", onInput],
    [input, "keydown", onKey],
    [input, "click", onInputClick],
    [input, "focusout", onFocusOut],
    [button, "click", onButtonClick],
    [button, "mousedown", keepFocus],
    [popup, "mousedown", keepFocus],
  ];
  for (const [target, type, listener] of listeners) target?.addEventListener(type, listener as EventListener);
  setExpanded(false);
  return () => {
    for (const [target, type, listener] of listeners) target?.removeEventListener(type, listener as EventListener);
    observer.disconnect();
    list.unwire();
  };
}
