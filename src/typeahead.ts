/**
 * Type-ahead: typing a letter moves to the next item whose label starts with it, as in a native
 * menu or select. Letters typed within half a second add up to one search, as in Headless UI, so
 * "de" finds Delete past Duplicate. Dropdown's menu (menu.ts) and Listbox's options (options.ts)
 * both search this way.
 */

/** How long typed letters add up to one search. */
const typeaheadMs = 500;

export function createTypeahead<T = HTMLElement>(label: (item: T) => string) {
  let typed = "";
  let typedAt = 0;

  /** Whether a search is under way, so a space is part of it, as in "move to". */
  const searching = (event: KeyboardEvent) => typed !== "" && event.timeStamp - typedAt < typeaheadMs;

  /**
   * Adds the event's letter to the search and returns the item it finds, looking on from the
   * item at index `at` (-1 for none) and wrapping. One letter, or the same letter again and again,
   * steps to the next item it starts. Different letters narrow the search from the current item.
   */
  function find(event: KeyboardEvent, list: T[], at: number) {
    const key = event.key.toLowerCase();
    typed = searching(event) ? typed + key : key;
    typedAt = event.timeStamp;
    const repeat = [...typed].every((letter) => letter === key);
    const text = repeat ? key : typed;
    const from = repeat ? at + 1 : Math.max(at, 0);
    const order = [...list.slice(from), ...list.slice(0, from)];
    return order.find((item) => label(item).toLowerCase().startsWith(text));
  }

  /** Ends the search, as a key that moves does, so the next letter starts a new one. */
  const reset = () => (typed = "");

  return { searching, find, reset };
}

/** Whether a key is one letter or digit to search with: no ⌘, Ctrl or Alt, which belong to the app. */
export const isTypeaheadKey = (event: KeyboardEvent) =>
  event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
