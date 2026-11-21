import type { JSX } from "@solidjs/web";
import {
  createEffect,
  createMemo,
  createSignal,
  flush,
  For,
  omit,
  onCleanup,
  onSettled,
  Show,
  untrack,
} from "solid-js";
import { type Action, type ActionList, isActionGroup } from "./actions.ts";
import { ActionMenu, contextMenu } from "./context-menu.tsx";
import { createTreeKeys, type TreeKeyEntry } from "./tree-keys.ts";
import { placeAt, type TreePlace, type TreeSpot, treeSpots } from "./tree-move.ts";
import { wireTree } from "./tree.ts";
import { createVirtualList, scrollParent } from "./virtual.ts";


/**
 * Tree: nested items a person opens, closes and selects one of, such as a site's pages. It takes
 * data, flattens it into rows that are siblings, each with its aria-level (tree.css), and holds
 * which items are open and which is selected. wireTree (tree.ts) gives it its pointer, tree-keys.ts
 * its keys, and the shared context menu (context-menu.tsx) its right-click menu and its "..." buttons,
 * from one action list. The spec is the docs site's Tree page.
 *
 * It renders only the rows in view, through the shared virtual list (virtual.ts), so a tree of
 * thousands of pages scrolls as one of ten. Closed items' children aren't rendered at all. Opening
 * an item mounts its children marked data-entering, and only those grow in, not the rows that
 * scrolling mounts. Closing one keeps its children that were on the page, hidden, until they've
 * shrunk away (tree.css), and then drops them.
 *
 * With onMove, items move: a row drags onto another with the browser's own drag and drop, and the
 * Move action, in every row's menu and on Alt+M, moves one from the keyboard, spot by spot, with a
 * live region saying each. The tree never changes the items itself: it tells onMove, and the app
 * changes its data (moveTreeItem in tree-move.ts does it for plain nodes).
 */

/** What a node needs: an id unique in the tree, a label, and its children. Anything else rides along. */
export type TreeNode<T> = {
  id: string;
  label: string;
  children?: readonly T[];
};

export type TreeProps<T extends TreeNode<T>> = Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children" | "role" | "onSelect"
> & {
  /** The top level. */
  items: readonly T[];
  /** The tree's name for screen readers, such as "Pages". */
  label: string;
  /** An item's icon. */
  icon?: (node: T) => JSX.Element;
  /** What goes at an item's end, before its "..." button: a Badge, a count, a status. */
  end?: (node: T) => JSX.Element;
  /** The selected item's id, held by the parent with onSelect. */
  selected?: string;
  /** The item selected at first, when the parent doesn't hold the selection. */
  defaultSelected?: string;
  /** A click, Enter or Space picked an item. */
  onSelect?: (node: T) => void;
  /** The pointer came onto an item, or the keyboard's focus did: a likely next pick, which the parent can get ready. */
  onHighlight?: (node: T) => void;
  /** The ids of the open items, held by the parent with onExpandedChange. */
  expanded?: readonly string[];
  /** The items open at first, when the parent doesn't hold them. The selected item's parents open too. */
  defaultExpanded?: readonly string[];
  /** An item opened or closed, with the open ids after it. */
  onExpandedChange?: (ids: string[], node: T, open: boolean) => void;
  /** Every item's actions: its "..." button, its right-click menu and their keys. Given the item's node. */
  actions?: ActionList<T>;
  /** Items that can be reached and read but not selected. */
  disabled?: (node: T) => boolean;
  /**
   * Where an item's chevron goes. "column", the default, is a column of its own before the icon,
   * so items that can open stand out. "icon" puts it in the icon's place, shown under the pointer
   * and on keyboard focus, for trees where any item can hold others, such as pages: rows are
   * narrower, and only the indent shows depth. Needs an icon on every item.
   */
  chevron?: "column" | "icon";
  /**
   * Turns on moving: dragging a row onto another, and the Move action. Give it from the first render,
   * as the right-click menu that offers Move is set up then. Called with the item, the
   * row it goes against, and where: "before" or "after" it as a sibling, or "inside" it, last. The
   * app moves it in its data; the tree opens the target of an "inside" so the item shows there.
   */
  onMove?: (node: T, target: T, place: TreePlace) => void;
  /** Whether an item may go to a spot. Left out, any spot but inside itself or its own children. */
  canMove?: (node: T, target: T, place: TreePlace) => boolean;
};

/** How long a drag rests on a closed item before it opens, in ms. */
const openDelay = 500;

/** The keys that start a keyboard move, as an action's keys. Option+M on a Mac. */
const moveKeys = "Alt+M";

/** The Move action's icon: arrows out to four sides. */
const MoveIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M10 3v14M3 10h14M7.5 5.5 10 3l2.5 2.5M7.5 14.5 10 17l2.5-2.5M5.5 7.5 3 10l2.5 2.5M14.5 7.5 17 10l-2.5 2.5" />
  </svg>
);

type Row<T> = {
  node: T;
  level: number;
  size: number;
  position: number;
  parents: string[];
};

/** The nodes in the order they show, each with its depth, its place among its siblings and its parents' ids. */
function flatten<T extends TreeNode<T>>(items: readonly T[], level = 1, parents: string[] = [], rows: Row<T>[] = []) {
  items.forEach((node, index) => {
    rows.push({
      node,
      level,
      size: items.length,
      position: index + 1,
      parents,
    });
    if (node.children?.length) flatten(node.children, level + 1, [...parents, node.id], rows);
  });
  return rows;
}

export function Tree<T extends TreeNode<T>>(props: TreeProps<T>) {
  const rest = omit(
    props,
    "items",
    "label",
    "icon",
    "end",
    "selected",
    "defaultSelected",
    "onSelect",
    "onHighlight",
    "expanded",
    "defaultExpanded",
    "onExpandedChange",
    "actions",
    "disabled",
    "chevron",
    "onMove",
    "canMove",
  );
  const rows = createMemo(() => flatten(props.items));
  const byId = createMemo(() => new Map(rows().map((row) => [row.node.id, row])));

  const [ownSelected, setOwnSelected] = createSignal(untrack(() => props.defaultSelected));
  const selected = () => props.selected ?? ownSelected();

  // The selected item shows on first render: its parents start open.
  const startOpen = untrack(() => [...(props.defaultExpanded ?? []), ...(byId().get(selected() ?? "")?.parents ?? [])]);
  const [ownExpanded, setOwnExpanded] = createSignal<readonly string[]>([...new Set(startOpen)]);
  const expanded = createMemo(() => new Set(props.expanded ?? ownExpanded()));

  const isShown = (row: Row<T>) => row.parents.every((id) => expanded().has(id));
  const shownRows = createMemo(() => rows().filter(isShown));
  const [focused, setFocused] = createSignal<string>();
  const [menuFor, setMenuFor] = createSignal<string>();
  /** The item being dragged or moved from the keyboard, and the spot it would go to now. */
  const [moving, setMoving] = createSignal<string>();
  const [dropAt, setDropSignal] = createSignal<TreeSpot>();
  /** The spot as just set: the signal reads its last flushed value until Solid flushes. */
  let spotNow: TreeSpot | undefined;
  const setDropAt = (spot: TreeSpot | undefined) => {
    spotNow = spot;
    setDropSignal(spot);
  };
  /**
   * The row that shows the spot, and the depth its line starts at. "After" an open item lands past
   * its children, so the line shows under its last shown child, at the item's own depth.
   */
  const dropMark = createMemo(() => {
    const spot = dropAt();
    const row = spot && byId().get(spot.id);
    if (!spot || !row) return undefined;
    let id = spot.id;
    if (spot.place === "after" && expanded().has(spot.id)) {
      const list = shownRows();
      let at = list.findIndex((other) => other.node.id === spot.id);
      while (at >= 0 && (list[at + 1]?.level ?? 0) > row.level) at++;
      id = list[at]?.node.id ?? id;
    }
    return { id, place: spot.place, level: row.level };
  });
  /** What the live region last said, for a keyboard move. */
  const [news, setNews] = createSignal("");

  /** Where the focused item was among the shown ones, to hand focus on if that item goes. */
  let focusedAt = 0;

  /** The tree's one Tab stop: the item last focused, else the selected one, else the first, if shown. */
  const tabStop = createMemo(() => {
    for (const id of [focused(), selected()]) {
      const row = id === undefined ? undefined : byId().get(id);
      if (row && isShown(row)) return id;
    }
    return rows()[0]?.node.id;
  });

  /** Each rendered row's element, by its node's id. */
  const elements = new Map<string, HTMLElement>();
  /** Rows a close hid while they were on the page: they stay, hidden, until they've shrunk away. */
  const leaving = new Set<string>();
  /** The rows an open just showed, so the ones that mount now grow in. Cleared once they're on the page. */
  let justShown = new Set<string>();
  const [dropped, setDropped] = createSignal(0);
  let lastShown: Set<string> | undefined;

  /** The rows on the page or that could be: the shown ones and the ones still shrinking away. */
  const display = createMemo(() => {
    dropped();
    const ids = new Set(shownRows().map((row) => row.node.id));
    if (lastShown) {
      for (const id of lastShown) if (!ids.has(id) && elements.has(id) && byId().has(id)) leaving.add(id);
      const opened = [...ids].filter((id) => !lastShown!.has(id));
      if (opened.length) {
        justShown = new Set(opened);
        requestAnimationFrame(() => (justShown = new Set()));
      }
    }
    for (const id of ids) leaving.delete(id);
    for (const id of leaving) if (!byId().has(id)) leaving.delete(id);
    lastShown = ids;
    return rows().filter((row) => ids.has(row.node.id) || leaving.has(row.node.id));
  });
  const displayIndex = createMemo(() => new Map(display().map((row, index) => [row.node.id, index])));

  const virtual = createVirtualList({
    count: () => display().length,
    key: (index) => `row:${display()[index]!.node.id}`,
    // The Tab stop, so Tab and the keys reach it, and the row whose menu is open, which anchors it.
    // While moving, the moved row, which a drag needs on the page to end, and the row it would go against.
    pinned: () =>
      [tabStop(), menuFor(), moving(), dropMark()?.id].flatMap((id) => {
        const index = id === undefined ? undefined : displayIndex().get(id);
        return index === undefined ? [] : [index];
      }),
  });

  /** Once a hidden row's exit has run, it leaves the page. Reopened before then, it stays. */
  function dropWhenDone(id: string, item: HTMLElement) {
    requestAnimationFrame(() => {
      const exits = item.getAnimations().map((animation) => animation.finished.catch(() => undefined));
      void Promise.all(exits).then(() => {
        const row = byId().get(id);
        if (row && isShown(row)) return;
        if (leaving.delete(id)) setDropped((n) => n + 1);
      });
    });
  }

  /** Moves focus to the shown row with this id, rendering it first if it's out of view. */
  function focusRow(id: string | undefined) {
    if (id === undefined) return;
    setFocused(id);
    flush();
    elements.get(id)?.focus();
  }

  /** Each row's element, to the id of its node: the node itself can change under the same id. */
  const ids = new WeakMap<Element, string>();
  const nodeAt = (item: Element) => {
    const id = ids.get(item);
    return id === undefined ? undefined : byId().get(id)?.node;
  };
  /** The row a target is in, with its element. */
  const rowOf = (target: EventTarget | null) => {
    const item = target instanceof Element ? target.closest('[role="treeitem"]') : null;
    const id = item ? ids.get(item) : undefined;
    const row = id === undefined ? undefined : byId().get(id);
    return row && item ? { row, item } : undefined;
  };
  const nodeOf = (target: Element) => rowOf(target)?.row.node;

  // The item the pointer is on, so moving within one row tells onHighlight once.
  let highlighted: string | undefined;

  function select(node: T) {
    if (props.disabled?.(node)) return;
    if (props.selected === undefined) setOwnSelected(node.id);
    props.onSelect?.(node);
  }

  /**
   * The open ids that writes in this turn have made, ahead of expanded(), which Solid updates only
   * when the batch flushes: * opens several siblings in one turn, each on top of the one before.
   */
  let pending: string[] | undefined;
  function expand(node: T, open: boolean) {
    if (!pending) {
      pending = [...expanded()];
      queueMicrotask(() => (pending = undefined));
    }
    const ids = pending.filter((id) => id !== node.id);
    if (open) ids.push(node.id);
    pending = ids;
    if (props.expanded === undefined) setOwnExpanded(ids);
    props.onExpandedChange?.(ids, node, open);
  }

  /** The app's actions, with Move added when items can move: before the last group, which is where Delete goes. */
  const actions = createMemo((): ActionList<T> => {
    const list = props.actions ?? [];
    if (!props.onMove) return list;
    const move: Action<T> = {
      id: "move",
      label: "Move",
      keys: moveKeys,
      icon: MoveIcon,
      // A finger has no arrow keys: a touch app moves items its own way, such as a dialog. An item
      // canMove keeps where it is, such as a home page, has no Move.
      hidden: (node) => lastPointer === "touch" || !canGo(node),
      run: (node) => startMove(node),
    };
    const last = list.at(-1);
    return last && isActionGroup(last) ? [...list.slice(0, -1), move, last] : [...list, move];
  });

  let tree!: HTMLElement;
  const region = untrack(() => props.actions || props.onMove)
    ? contextMenu<T>(() => actions(), nodeOf, {
        label: (node) => `Actions for ${node.label}`,
        returnFocus: (target) => target.closest('[role="treeitem"]') ?? undefined,
        onToggle: (open, node) => setMenuFor(open ? node.id : undefined),
      })
    : undefined;

  const treeKey = createTreeKeys();
  const entries = createMemo(() =>
    shownRows().map(
      (row): TreeKeyEntry => ({
        level: row.level,
        open: row.node.children?.length ? expanded().has(row.node.id) : undefined,
        label: row.node.label,
      }),
    ),
  );

  /** The keys work on the shown rows' data, so they reach rows that aren't rendered. */
  function onKeyDown(event: KeyboardEvent) {
    const target = event.target as Element;
    if (target.getAttribute("role") !== "treeitem") return;
    const id = ids.get(target);
    const list = shownRows();
    const intent = treeKey(
      event,
      entries(),
      list.findIndex((row) => row.node.id === id),
    );
    if (!intent) return;
    if ("focus" in intent) focusRow(list[intent.focus]?.node.id);
    else if ("expand" in intent) expand(list[intent.expand]!.node, intent.open);
    else if ("select" in intent) select(list[intent.select]!.node);
    else for (const index of intent.expandAll) expand(list[index]!.node, true);
  }

  // ---- Moving --------------------------------------------------------------------------------

  /** The kind of pointer last pressed in the tree: a touch doesn't drag, and its menu has no Move. */
  let lastPointer = "";

  /** Whether the item may go to the spot: never against itself or inside its own children. */
  function allowed(node: T, spot: TreeSpot) {
    const target = byId().get(spot.id);
    if (!target || target.node.id === node.id || target.parents.includes(node.id)) return false;
    return props.canMove?.(node, target.node, spot.place) !== false;
  }

  /** Whether the item can go anywhere: stops at the first spot it can, so it's quick for most items. */
  const canGo = (node: T) =>
    shownRows().some((row) =>
      (["before", "inside", "after"] as const).some((place) => allowed(node, { id: row.node.id, place })),
    );

  /** The spots the item can go to among the shown rows, from the keyboard. */
  const spotsFor = (node: T) =>
    treeSpots(
      shownRows().map((row) => ({ id: row.node.id, level: row.level, parents: row.parents })),
      node.id,
      (spot) => allowed(node, spot),
    );

  const sameSpot = (a: TreeSpot | undefined, b: TreeSpot | undefined) => a?.id === b?.id && a?.place === b?.place;

  /** A spot in words, for the live region: "before Pricing, at the top level", "inside Blog". */
  function describe(spot: TreeSpot) {
    const row = byId().get(spot.id);
    if (!row) return "";
    if (spot.place === "inside") return `inside ${row.node.label}`;
    const parent = row.parents.at(-1);
    const where = parent === undefined ? "at the top level" : `in ${byId().get(parent)?.node.label ?? ""}`;
    return `${spot.place} ${row.node.label}, ${where}`;
  }
  const say = (words: string) => setNews(words);
  const capital = (words: string) => words.charAt(0).toUpperCase() + words.slice(1);

  /** A keyboard move under way: the item, and the spot picked so far. */
  let keyMove: { id: string; spot?: TreeSpot } | undefined;
  /** A drag under way: the item, where the pointer is, and the closed item it's waiting to open. */
  let drag:
    | {
        node: T;
        y: number;
        over: boolean;
        frame: number;
        scroller: HTMLElement | undefined;
        timer?: ReturnType<typeof setTimeout>;
        openFor?: string;
      }
    | undefined;

  /** Ends a move, by a drop, Enter, Escape or the drag ending, and takes its marks off the rows. */
  function endMove() {
    keyMove = undefined;
    if (drag) {
      cancelAnimationFrame(drag.frame);
      clearTimeout(drag.timer);
      drag = undefined;
    }
    setMoving(undefined);
    setDropAt(undefined);
  }

  /** Hands the move to the app, opening the target of an "inside" so the item shows there. */
  function commit(node: T, spot: TreeSpot) {
    const target = byId().get(spot.id)?.node;
    endMove();
    if (!target || !allowed(node, spot)) return false;
    if (spot.place === "inside" && !expanded().has(target.id)) expand(target, true);
    props.onMove?.(node, target, spot.place);
    queueMicrotask(() => focusRow(node.id));
    return true;
  }

  /** The Move action: the item stays focused while the arrows pick its spot. */
  function startMove(node: T) {
    if (!props.onMove) return;
    endMove();
    keyMove = { id: node.id };
    setMoving(node.id);
    say(`Moving ${node.label}. Pick a spot with the arrow keys, then press Enter to move it there, or Escape to cancel.`);
    focusRow(node.id);
  }

  /** Shows a spot and says it, rendering its row and scrolling it into view. */
  function pick(spot: TreeSpot, words = capital(describe(spot))) {
    if (keyMove) keyMove.spot = spot;
    setDropAt(spot);
    say(words);
    flush();
    const mark = dropMark()?.id;
    if (mark !== undefined) elements.get(mark)?.scrollIntoView({ block: "nearest" });
  }

  /**
   * The keys of a keyboard move, ahead of every other key of the tree's. ↓ ↑ Home End pick a spot,
   * → opens the closed item a spot is inside and goes among its children, ← closes the item around it, Enter moves the item
   * there and Escape doesn't. Tab, or focus going, ends it.
   */
  function onMoveKey(event: KeyboardEvent) {
    // A key, so the menu it opens is a keyboard's, with Move in it.
    lastPointer = "";
    if (!keyMove) return;
    if (event.key === "Tab") return endMove();
    // Nothing else of the tree's runs, such as an action's keys. The browser's and a screen reader's
    // own shortcuts, with Ctrl, ⌘ or Alt, still do.
    event.stopImmediatePropagation();
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    const node = byId().get(keyMove.id)?.node;
    if (!node) return endMove();
    const { spots, origin } = spotsFor(node);
    const at = spots.findIndex((spot) => sameSpot(spot, keyMove?.spot));
    const go = (index: number) => {
      const spot = spots[index];
      if (spot) pick(spot);
      else if (!spots.length) say(`There's nowhere ${node.label} can go.`);
    };
    const spot = keyMove.spot;
    const row = spot && byId().get(spot.id);
    switch (event.key) {
      case "ArrowDown":
        return go(at < 0 ? origin : at + 1);
      case "ArrowUp":
        return go(at < 0 ? origin - 1 : at - 1);
      case "Home":
        return go(0);
      case "End":
        return go(spots.length - 1);
      case "ArrowRight":
        if (spot?.place === "inside" && row?.node.children?.length && !expanded().has(row.node.id)) {
          // Into the item: its first spot among its children, as "inside" an open item is "after" its last.
          expand(row.node, true);
          flush();
          const into = spotsFor(node).spots.find((other) => byId().get(other.id)?.parents.includes(row.node.id));
          if (into) return pick(into, `Opened ${row.node.label}. ${capital(describe(into))}`);
          // Nowhere among its children: "inside" an open item isn't a spot, so none is picked.
          keyMove.spot = undefined;
          setDropAt(undefined);
          say(`Opened ${row.node.label}. ${node.label} can't go in it.`);
        }
        return;
      case "ArrowLeft": {
        // The item the spot is in: the spot's own row for "inside", else its parent.
        const outer = spot?.place === "inside" && expanded().has(spot.id) ? spot.id : row?.parents.at(-1);
        const moved = byId().get(node.id);
        if (outer === undefined || moved?.parents.includes(outer)) return;
        const parent = byId().get(outer)!.node;
        expand(parent, false);
        flush();
        // Inside the item just closed, or else the first spot against it, or none: never a hidden row.
        const left = spotsFor(node).spots;
        const next =
          left.find((other) => other.id === outer && other.place === "inside") ?? left.find((other) => other.id === outer);
        if (next) return pick(next, `${capital(describe(next))}, closed`);
        if (keyMove) keyMove.spot = undefined;
        setDropAt(undefined);
        say(`Closed ${parent.label}`);
        return;
      }
      case "Enter":
        if (!spot) return;
        const words = `Moved ${node.label} ${describe(spot)}.`;
        say(commit(node, spot) ? words : `Didn't move ${node.label}.`);
        return;
      case "Escape":
        endMove();
        say(`Didn't move ${node.label}.`);
        return;
    }
  }

  /** A drag nears the top or bottom of what scrolls the tree: it scrolls, faster nearer the edge. */
  function scrollStep() {
    if (!drag) return;
    drag.frame = requestAnimationFrame(scrollStep);
    if (!drag.over) return;
    const { scroller } = drag;
    const room = scroller?.getBoundingClientRect() ?? { top: 0, bottom: tree.ownerDocument.defaultView?.innerHeight ?? 0 };
    // The edge is a row tall.
    const edge = elements.get(drag.node.id)?.offsetHeight || 32;
    const up = room.top + edge - drag.y;
    const down = drag.y - (room.bottom - edge);
    const by = up > 0 ? -Math.min(up, edge) : down > 0 ? Math.min(down, edge) : 0;
    if (!by) return;
    const step = Math.round(by / 3);
    if (scroller) scroller.scrollTop += step;
    else tree.ownerDocument.defaultView?.scrollBy(0, step);
  }

  /**
   * The spot a pointer over a row means. Below an open item it's before its first child, where the
   * line shows. Below the last of a set of siblings, the pointer's indent picks the level: out in the
   * indent of an outer level, it's after that level's item, so a drag reaches the end of any level.
   */
  function spotAt(row: Row<T>, item: Element, x: number, y: number): TreeSpot {
    const box = item.getBoundingClientRect();
    const place = placeAt(y, box.top, box.height);
    const first = row.node.children?.[0];
    if (place !== "after") return { id: row.node.id, place };
    if (first && expanded().has(row.node.id)) return { id: first.id, place: "before" };
    const style = getComputedStyle(item);
    // One level's step is a chevron and the gap after it. With chevron="icon" a leaf has no chevron: its icon is as wide.
    const chevron =
      parseFloat(getComputedStyle(item, "::before").width) || item.querySelector(":scope > svg")?.getBoundingClientRect().width || 0;
    const indent = chevron ? chevron + (parseFloat(style.columnGap) || 0) : 0;
    const start = parseFloat(style.paddingInlineStart) || 0;
    const out = style.direction === "rtl" ? x - (box.right - start) : box.left + start - x;
    const level = out > 0 && indent > 0 ? row.level - Math.ceil(out / indent) : row.level;
    let target = row;
    while (target.level > level && lastAmong(target, drag?.node.id)) {
      const parent = byId().get(target.parents.at(-1) ?? "");
      if (!parent) break;
      target = parent;
    }
    return { id: target.node.id, place };
  }

  /** Whether a row is the last of its siblings, or would be once the item being moved has left. */
  function lastAmong(row: Row<T>, leaving: string | undefined) {
    if (row.position === row.size) return true;
    const parent = row.parents.at(-1);
    const siblings = parent === undefined ? props.items : (byId().get(parent)?.node.children ?? []);
    return row.position === row.size - 1 && siblings[row.position]?.id === leaving;
  }

  function onDragStart(event: DragEvent) {
    const found = rowOf(event.target);
    if (!props.onMove || !found || !event.dataTransfer) return;
    // A finger scrolls and long-presses for the menu: it doesn't drag.
    if (lastPointer === "touch") return event.preventDefault();
    endMove();
    const { node } = found.row;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.label);
    drag = { node, y: event.clientY, over: true, frame: 0, scroller: scrollParent(tree) };
    // The browser draws the drag image from the row as it is now: on a surface, so it reads off the tree.
    found.item.setAttribute("data-drag-image", "");
    requestAnimationFrame(() => {
      found.item.removeAttribute("data-drag-image");
      if (drag?.node === node) setMoving(node.id);
    });
    drag.frame = requestAnimationFrame(scrollStep);
  }

  function onDragOver(event: DragEvent) {
    if (!drag) return;
    drag.y = event.clientY;
    drag.over = true;
    const found = rowOf(event.target);
    if (!found) {
      // In the gap between rows, the spot stays as it was.
      if (spotNow) event.preventDefault();
      return;
    }
    const { row, item } = found;
    const spot = spotAt(row, item, event.clientX, event.clientY);
    if (allowed(drag.node, spot)) {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      if (!sameSpot(spotNow, spot)) setDropAt(spot);
    } else if (spotNow) setDropAt(undefined);
    // Resting on a closed item opens it, so its children can be reached.
    const closed =
      spot.place === "inside" &&
      row.node.id !== drag.node.id &&
      Boolean(row.node.children?.length) &&
      !expanded().has(row.node.id);
    const waitFor = closed ? row.node.id : undefined;
    if (waitFor !== drag.openFor) {
      clearTimeout(drag.timer);
      drag.openFor = waitFor;
      drag.timer = waitFor === undefined ? undefined : setTimeout(() => expand(row.node, true), openDelay);
    }
  }

  /**
   * The pointer left the tree: no spot, and nothing waits to open. Safari names no relatedTarget on
   * dragleave, so a leave counts once no dragover follows it, as one does between a row's parts.
   */
  function onDragLeave(event: DragEvent) {
    if (!drag || tree.contains(event.relatedTarget as Node | null)) return;
    drag.over = false;
    const current = drag;
    setTimeout(() => {
      if (drag !== current || current.over) return;
      clearTimeout(current.timer);
      current.openFor = undefined;
      setDropAt(undefined);
    }, 100);
  }

  function onDrop(event: DragEvent) {
    if (!drag) return;
    event.preventDefault();
    const spot = spotNow;
    const { node } = drag;
    if (spot) commit(node, spot);
    else endMove();
  }

  function onDragEnd() {
    if (drag) endMove();
  }

  // Focus never stays on a row that a close hid, or drops to the page when its row goes, such as
  // after Delete: it moves to the closest shown parent, or the row now in the gone one's place.
  createEffect(
    () => [byId(), shownRows()] as const,
    ([rowsById, list]) => {
      const id = untrack(focused);
      if (!tree || id === undefined) return;
      const doc = tree.ownerDocument;
      const active = doc.activeElement;
      const row = rowsById.get(id);
      const shown = new Set(list.map((other) => other.node.id));
      let to: string | undefined;
      if (row && active instanceof HTMLElement && tree.contains(active) && !shown.has(id)) {
        to = [...row.parents].reverse().find((parentId) => shown.has(parentId));
      } else if (!row && (active === doc.body || active === null)) {
        to = list[Math.min(focusedAt, list.length - 1)]?.node.id;
      }
      // After this flush, which can't render the row focus goes to.
      if (to !== undefined) queueMicrotask(() => focusRow(to));
    },
  );

  onSettled(() => {
    const onPointerDown = (event: PointerEvent) => {
      lastPointer = event.pointerType;
    };
    // A press anywhere, in the tree or out of it, leaves a keyboard move's item where it was.
    const doc = tree.ownerDocument;
    const onAnyPointerDown = () => {
      if (!keyMove) return;
      const node = byId().get(keyMove.id)?.node;
      endMove();
      if (node) say(`Didn't move ${node.label}.`);
    };
    doc.addEventListener("pointerdown", onAnyPointerDown, true);
    // Focus leaving the moved row for something else, by a click or a key, ends a keyboard move.
    const onFocusOut = (event: FocusEvent) => {
      if (!keyMove || !event.relatedTarget || ids.get(event.relatedTarget as Element) === keyMove.id) return;
      endMove();
    };
    const listeners: [string, (event: never) => void][] = [
      ["pointerdown", onPointerDown],
      ["focusout", onFocusOut],
      ["dragstart", onDragStart],
      ["dragover", onDragOver],
      ["dragleave", onDragLeave],
      ["drop", onDrop],
      ["dragend", onDragEnd],
    ];
    for (const [type, listener] of listeners) tree.addEventListener(type, listener as EventListener);
    const unwire = wireTree(tree, {
      menus: false,
      keys: false,
      onSelect: (item) => {
        const node = nodeAt(item);
        if (node) select(node);
      },
      onExpand: (item, open) => {
        const node = nodeAt(item);
        if (node) expand(node, open);
      },
    });
    revealSelected(tree);
    return () => {
      unwire();
      endMove();
      doc.removeEventListener("pointerdown", onAnyPointerDown, true);
      for (const [type, listener] of listeners) tree.removeEventListener(type, listener as EventListener);
    };
  });

  return (
    <>
    <beautiful-tree
      {...rest}
      ref={(el: HTMLElement) => {
        tree = el;
        // Ahead of the context menu region's keys, so a move's keys don't run actions.
        el.addEventListener("keydown", onMoveKey);
        region?.(el);
        virtual.ref(el);
      }}
      role="tree"
      aria-label={props.label}
      data-virtual=""
      data-chevron={props.chevron === "icon" ? "icon" : undefined}
      onKeyDown={onKeyDown}
      onPointerOver={(event: PointerEvent) => {
        const node = props.onHighlight && nodeOf(event.target as Element);
        if (node && node.id !== highlighted) props.onHighlight?.(node);
        highlighted = node ? node.id : undefined;
      }}
      onPointerLeave={() => (highlighted = undefined)}
      onFocusIn={(event: FocusEvent) => {
        const node = nodeOf(event.target as Element);
        if (!node) return;
        props.onHighlight?.(node);
        setFocused(node.id);
        focusedAt = shownRows().findIndex((row) => row.node.id === node.id);
      }}
    >
      <For each={virtual.slots()} keyed={(slot) => slot.key}>
        {(slot) => {
          if (untrack(slot).index === undefined) {
            return <beautiful-tree-spacer aria-hidden="true" style={{ "block-size": `${slot().size}px` }} />;
          }
          let item!: HTMLElement;
          // Memos, so a row's parts re-render only when its own row changes, not when slots move around it.
          const id = untrack(() => display()[slot().index!]!.node.id);
          // Found by id, so a slot that's on its way out never reads another row.
          const row = createMemo<Row<T>>((last) => {
            const index = displayIndex().get(id);
            return index === undefined ? last! : display()[index]!;
          });
          const node = createMemo(() => row().node);
          const parent = () => Boolean(node().children?.length);
          const hidden = () => !isShown(row());
          // Shown by an open just now, so it grows in. Rows that scrolling mounts don't.
          const entering = justShown.has(id);
          createEffect(hidden, (gone) => {
            if (gone) dropWhenDone(id, item);
          });
          onCleanup(() => {
            if (elements.get(id) === item) elements.delete(id);
          });
          return (
            <beautiful-tree-item
              ref={(el: HTMLElement) => {
                item = el;
                ids.set(el, id);
                elements.set(id, el);
              }}
              role="treeitem"
              aria-level={String(row().level)}
              aria-setsize={String(row().size)}
              aria-posinset={String(row().position)}
              aria-expanded={parent() ? (expanded().has(node().id) ? "true" : "false") : undefined}
              aria-selected={selected() === node().id ? "true" : undefined}
              aria-disabled={props.disabled?.(node()) ? "true" : undefined}
              aria-haspopup={props.actions ? "menu" : undefined}
              data-menu-open={menuFor() === node().id ? "" : undefined}
              data-entering={entering ? "" : undefined}
              draggable={props.onMove ? "true" : undefined}
              data-moving={moving() === node().id ? "" : undefined}
              data-drop={dropMark()?.id === node().id ? dropMark()!.place : undefined}
              style={dropMark()?.id === node().id ? { "--tree-drop-level": String(dropMark()!.level) } : undefined}
              tabindex={tabStop() === node().id ? "0" : "-1"}
              hidden={hidden()}
            >
              {props.icon?.(node())}
              <beautiful-tree-label>{node().label}</beautiful-tree-label>
              {props.end?.(node())}
              {/* Without the app's own actions, Move alone doesn't earn every row a button: right-click, Shift+F10 and Alt+M reach it. */}
              <Show when={props.actions}>
                <ActionMenu
                  actions={actions()}
                  context={node()}
                  label={`Actions for ${node().label}`}
                  focusable={false}
                  returnFocus={item}
                  onToggle={(open) => setMenuFor(open ? node().id : undefined)}
                  data-tree-actions=""
                />
              </Show>
            </beautiful-tree-item>
          );
        }}
      </For>
    </beautiful-tree>
    <Show when={props.onMove}>
      <beautiful-visually-hidden role="status">{news()}</beautiful-visually-hidden>
    </Show>
    </>
  );
}

/** Scrolls the panel the tree is in, not the page, so the selected item is in view on first show. */
function revealSelected(tree: HTMLElement) {
  const item = tree.querySelector<HTMLElement>(':scope > [aria-selected="true"]:not([hidden])');
  if (!item) return;
  let panel = tree.parentElement;
  while (panel && !/(auto|scroll)/.test(getComputedStyle(panel).overflowY)) panel = panel.parentElement;
  if (!panel || panel === tree.ownerDocument.scrollingElement) return;
  const at = item.getBoundingClientRect();
  const room = panel.getBoundingClientRect();
  if (at.top >= room.top && at.bottom <= room.bottom) return;
  panel.scrollTop += at.top - room.top - (room.height - at.height) / 2;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      /** Tree: every item, flat, as its direct children. */
      "beautiful-tree": HTMLAttributes<HTMLElement>;
      /** One item: a row of the tree, role="treeitem". */
      "beautiful-tree-item": HTMLAttributes<HTMLElement>;
      /** An item's name, on one line. */
      "beautiful-tree-label": HTMLAttributes<HTMLElement>;
      /** A count or a status at an item's end. */
      "beautiful-tree-end": HTMLAttributes<HTMLElement>;
      /** Stands in for rows out of view that aren't rendered, as tall as they are. */
      "beautiful-tree-spacer": HTMLAttributes<HTMLElement>;
    }
  }
}
