/**
 * The keys of a set of tabs: what Tabs adds that the platform lacks. The markup is the APG tabs
 * pattern's (styles/elements/tabs.css): a <beautiful-tabs> holding a <beautiful-tab-list role="tablist"> of
 * <button role="tab">, each with aria-controls naming its <beautiful-tab-panel role="tabpanel">.
 *
 * This adds, from the APG tabs pattern and Headless UI's Tabs:
 *   - Only the selected tab is in the Tab order (a roving tabindex), so Tab goes from the tabs
 *     to the selected panel.
 *   - → ← move between the tabs, or ↓ ↑ in a column (aria-orientation="vertical"), wrapping at
 *     the ends and passing over disabled tabs. Home and End go to the first and last tab. In a
 *     right-to-left page, ← is the next tab.
 *   - A tab is selected as focus lands on it. With data-activation="manual" on <beautiful-tabs>,
 *     the arrows only move focus, and Enter, Space or a click selects.
 *   - Selecting a tab shows its panel and hides the others, and fires "tabchange" on
 *     <beautiful-tabs>, with the tab's index as its detail.
 *
 * It works on static markup too. The spec is the docs site's Tabs page.
 */

/** Wires one <beautiful-tabs>. Returns a function that removes everything it added. */
export function wireTabs(root: HTMLElement): () => void {
  const list = root.querySelector<HTMLElement>(':scope > [role="tablist"]');
  if (!list) return () => {};
  // One enabled tab is always selected, so the list stays in the Tab order. The markup is put
  // in step with it quietly: nobody chose anything yet.
  const all = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const first = selectable(all, all.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
  if (first) selectTab(root, first, false);

  function onKey(event: KeyboardEvent) {
    const to = tabFor(event, list!);
    if (!to) return;
    event.preventDefault();
    to.focus();
    if (root.dataset.activation !== "manual") selectTab(root, to);
  }

  function onClick(event: MouseEvent) {
    const tab = (event.target as Element).closest<HTMLButtonElement>('[role="tab"]');
    // Page script can stop a switch with preventDefault on the tab's click.
    if (tab && !tab.disabled && !event.defaultPrevented) selectTab(root, tab);
  }

  list.addEventListener("keydown", onKey);
  list.addEventListener("click", onClick);
  return () => {
    list.removeEventListener("keydown", onKey);
    list.removeEventListener("click", onClick);
  };
}

/**
 * The tab a key on a tab moves to, or nothing when the key isn't one of the list's: → ← (↓ ↑ in
 * a column, ← → in right-to-left), wrapping and passing over disabled tabs, and Home and End.
 * Tabs, the Solid component, moves with it too.
 */
export function tabFor(event: KeyboardEvent, list: HTMLElement): HTMLButtonElement | undefined {
  if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const tab = (event.target as Element).closest<HTMLButtonElement>('[role="tab"]');
  if (!tab || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const vertical = list.getAttribute("aria-orientation") === "vertical";
  const flip = !vertical && event.key.startsWith("Arrow") && getComputedStyle(list).direction === "rtl";
  const next = vertical ? "ArrowDown" : flip ? "ArrowLeft" : "ArrowRight";
  const previous = vertical ? "ArrowUp" : flip ? "ArrowRight" : "ArrowLeft";
  const order = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')].filter((each) => !each.disabled);
  const at = order.indexOf(tab);
  if (event.key === next) return order[(at + 1) % order.length];
  if (event.key === previous) return order[at <= 0 ? order.length - 1 : at - 1];
  if (event.key === "Home") return order[0];
  if (event.key === "End") return order.at(-1);
}

/** The tab at an index if it can be selected, or else the next one that can, wrapping. Out of range starts at the first. */
export function selectable(tabs: HTMLButtonElement[], at: number): HTMLButtonElement | undefined {
  const from = at >= 0 && at < tabs.length ? at : 0;
  return [...tabs.slice(from), ...tabs.slice(0, from)].find((tab) => !tab.disabled);
}

/**
 * Selects a tab: marks it, puts it in the Tab order, shows its panel and hides the rest, and fires
 * tabchange. Quietly, it only puts the markup in step, even for the tab already selected.
 */
function selectTab(root: HTMLElement, tab: HTMLButtonElement, announce = true) {
  if (announce && tab.getAttribute("aria-selected") === "true") return;
  // The panels are found where the tabs are, in a shadow root too.
  const top = root.getRootNode();
  const scope = top instanceof Document || top instanceof ShadowRoot ? top : root.ownerDocument;
  const all = [...root.querySelectorAll<HTMLButtonElement>(':scope > [role="tablist"] [role="tab"]')];
  for (const each of all) {
    const on = each === tab;
    each.setAttribute("aria-selected", String(on));
    each.tabIndex = on ? 0 : -1;
    const panel = scope.getElementById(each.getAttribute("aria-controls") ?? "");
    if (panel) panel.hidden = !on;
  }
  if (announce) root.dispatchEvent(new CustomEvent("tabchange", { detail: all.indexOf(tab), bubbles: true }));
}
