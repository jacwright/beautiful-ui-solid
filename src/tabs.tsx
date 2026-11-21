import type { JSX } from "@solidjs/web";
import { createContext, createEffect, createSignal, createUniqueId, omit, onSettled, untrack, useContext } from "solid-js";
import { call } from "./handler.ts";
import { forward } from "./popover.tsx";
import { selectable, tabFor } from "./tab-keys.ts";

/**
 * Tabs: a row of tabs that each show their own panel, on the APG tabs pattern's markup
 * (styles/elements/tabs.css). Tabs holds which tab is selected. tabFor (tab-keys.ts) gives the
 * arrow keys, the same ones wireTabs gives static markup. The selected line is CSS: the tab
 * list's ::after, placed on the selected tab with anchor positioning. The spec is the docs site's
 * Tabs page.
 *
 * Tabs and panels pair in order: the first TabPanel is the first Tab's. Their ids follow one rule,
 * so static markup can write the same: a tab's is <id>-tab-<index>, and its panel's
 * <id>-panel-<index>, counting from 0. A tab or panel that leaves gives its index back, so one
 * shown again by <Show> takes its old place. Tabs added later go at the end.
 */

type Shared = {
  id: string;
  selected: () => number;
  /** The selection a parent holds, if it holds one. */
  held: () => number | undefined;
  /** Selects a tab by index, as a click or a key does: the parent hears it in onChange. */
  select: (index: number) => void;
  vertical: () => boolean;
  manual: () => boolean;
  /** The lowest free index for a tab or a panel, and its release when that one leaves. */
  take: (kind: "tab" | "panel") => [number, () => void];
  /** Each tab's element, for the keys to find its index. */
  indexOf: WeakMap<Element, number>;
  setList: (list: HTMLElement) => void;
  /** Checks, once the current event is done, that an enabled tab is selected. */
  recheck: () => void;
};

const TabsContext = createContext<Shared>();

export type TabsProps = Omit<JSX.HTMLAttributes<HTMLElement>, "onChange"> & {
  /** The start of every tab's and panel's id. Made up when left out. */
  id?: string;
  /** The tab selected at first, when the parent doesn't hold the selection. */
  defaultIndex?: number;
  /** The selected tab, held by the parent with onChange. */
  selectedIndex?: number;
  /** Called when a tab is selected by a click or the keys. */
  onChange?: (index: number) => void;
  /** Stands the tabs in a column beside the panels. */
  vertical?: boolean;
  /** The arrow keys only move focus, and Enter, Space or a click selects. */
  manual?: boolean;
};

export function Tabs(props: TabsProps) {
  const rest = omit(props, "id", "defaultIndex", "selectedIndex", "onChange", "vertical", "manual");
  const id = props.id ?? createUniqueId();
  const [own, setOwn] = createSignal(props.defaultIndex ?? 0);
  const used = { tab: new Set<number>(), panel: new Set<number>() };
  let list: HTMLElement | undefined;
  let pending = false;
  let alive = true;
  onSettled(() => () => {
    alive = false;
  });

  const shared: Shared = {
    id,
    selected: () => props.selectedIndex ?? own(),
    held: () => props.selectedIndex,
    select(index) {
      if (index === untrack(shared.selected)) return;
      if (props.selectedIndex === undefined) setOwn(index);
      props.onChange?.(index);
    },
    vertical: () => !!props.vertical,
    manual: () => !!props.manual,
    take(kind) {
      let index = 0;
      while (used[kind].has(index)) index++;
      used[kind].add(index);
      return [index, () => used[kind].delete(index)];
    },
    indexOf: new WeakMap(),
    setList: (el) => {
      list = el;
    },
    // One enabled tab is always selected, so the list stays in the Tab order. A selection out of
    // range, or on a tab that is disabled or gone, passes to the next tab that can take it. It
    // runs once after the event that changed things, however many asked, and never in an effect.
    recheck() {
      if (pending) return;
      pending = true;
      queueMicrotask(() => {
        pending = false;
        if (!alive || !list) return;
        const at = untrack(shared.selected);
        const all = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
        const to = selectable(all, all.findIndex((tab) => shared.indexOf.get(tab) === at));
        const index = to && shared.indexOf.get(to);
        if (index !== undefined && index !== at) shared.select(index);
      });
    },
  };
  // When the tabs are on the page, and whenever a parent holding the selection moves it.
  onSettled(() => shared.recheck());
  createEffect(
    () => props.selectedIndex,
    (held) => {
      if (held !== undefined) shared.recheck();
    },
  );

  return (
    <beautiful-tabs {...rest} data-activation={props.manual ? "manual" : undefined}>
      <TabsContext value={shared}>{props.children}</TabsContext>
    </beautiful-tabs>
  );
}

export type TabListProps = JSX.HTMLAttributes<HTMLElement>;

/** The row of tabs, and the line under them. Name it with an aria-label. */
export function TabList(props: TabListProps) {
  const tabs = useContext(TabsContext);
  const rest = omit(props, "ref", "onKeyDown");
  let list: HTMLElement | undefined;

  function ref(el: HTMLElement) {
    list = el;
    tabs.setList(el);
    forward(props.ref, el);
  }

  // The caller's onKeyDown runs first, and can keep a key from the tabs with preventDefault.
  function onKeyDown(event: KeyboardEvent) {
    call(props.onKeyDown, event);
    if (event.defaultPrevented || !list) return;
    const to = tabFor(event, list);
    if (!to) return;
    event.preventDefault();
    to.focus();
    const index = tabs.indexOf.get(to);
    if (!tabs.manual() && index !== undefined) tabs.select(index);
  }

  return (
    <beautiful-tab-list
      {...rest}
      ref={ref}
      role="tablist"
      aria-orientation={tabs.vertical() ? "vertical" : undefined}
      onKeyDown={onKeyDown}
    />
  );
}

export type TabProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "role">;

/** One tab: its label, and an optional icon first. */
export function Tab(props: TabProps) {
  const tabs = useContext(TabsContext);
  const [index, release] = tabs.take("tab");
  onSettled(() => () => {
    release();
    tabs.recheck();
  });
  const rest = omit(props, "ref", "onClick");
  const selected = () => tabs.selected() === index;
  createEffect(
    () => !!props.disabled,
    (disabled) => {
      if (disabled) tabs.recheck();
    },
  );

  function ref(el: HTMLButtonElement) {
    tabs.indexOf.set(el, index);
    forward(props.ref, el);
  }

  // The caller's onClick runs first, and can stop the switch with preventDefault.
  function onClick(event: MouseEvent) {
    call(props.onClick, event);
    if (!event.defaultPrevented) tabs.select(index);
  }

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="tab"
      id={`${tabs.id}-tab-${index}`}
      aria-selected={selected() ? "true" : "false"}
      aria-controls={`${tabs.id}-panel-${index}`}
      tabindex={selected() ? undefined : "-1"}
      onClick={onClick}
    />
  );
}

export type TabPanelProps = JSX.HTMLAttributes<HTMLElement>;

/** One tab's content. It stays on the page while hidden, so what was typed in it is kept. */
export function TabPanel(props: TabPanelProps) {
  const tabs = useContext(TabsContext);
  const [index, release] = tabs.take("panel");
  onSettled(() => release);
  return (
    <beautiful-tab-panel
      {...props}
      role="tabpanel"
      id={`${tabs.id}-panel-${index}`}
      aria-labelledby={`${tabs.id}-tab-${index}`}
      tabindex="0"
      hidden={tabs.selected() !== index}
    />
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-tabs": HTMLAttributes<HTMLElement>;
      "beautiful-tab-list": HTMLAttributes<HTMLElement>;
      "beautiful-tab-panel": HTMLAttributes<HTMLElement>;
    }
  }
}
