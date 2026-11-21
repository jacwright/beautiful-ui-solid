/**
 * A virtual list: for a list of rows that are all one height, which rows to render, so a list of
 * thousands puts only the ones in view on the page, plus a few past each edge. The rows skipped
 * before, between and after them become spacers, each as tall as the rows it stands for, so the
 * list keeps its full height and the scrollbar its size. It works inside whatever scrolls: the
 * nearest scrolling ancestor of the list, or the page.
 *
 * The list's rows are its direct children, laid out in a column with an even gap (flex or grid
 * gap). A spacer is a direct child too, with aria-hidden="true", the block size the slot gives, so
 * the gap around it matches the rows', and overflow-anchor: none, so the browser never anchors the
 * scroll to a spacer that changes size and scrolls back. The list measures one row to learn the height.
 *
 *   const list = createVirtualList({ count: () => rows().length, key: (i) => rows()[i].id });
 *   <ul ref={list.ref}>
 *     <For each={list.slots()} keyed={(slot) => slot.key}>
 *       {(slot) => slot().index === undefined
 *         ? <beautiful-list-spacer aria-hidden="true" style={{ "block-size": `${slot().size}px` }} />
 *         : <Row row={rows()[slot().index]} />}
 *     </For>
 *   </ul>
 *
 * Rows in `pinned` are rendered wherever they are, such as the row with the one Tab stop, so focus
 * and the keyboard reach it even far out of view. Focusing it then scrolls it into view, as the
 * browser does, and the window follows. A focused row that rendering moves keeps its focus, and
 * nothing scrolls for it: Solid moves a row with `moveBefore` where the browser has it, which
 * keeps focus, but Chromium then scrolls the focused row into view, back to wherever it sits.
 * The list puts every scroll position that move changed back as it was.
 */

import { createEffect, createMemo, createSignal, onSettled } from "solid-js";

export type VirtualListOptions = {
  /** How many rows there are. */
  count: () => number;
  /** A row's key, unchanged while the row stays, so it keeps its element as rows come and go around it. */
  key: (index: number) => string;
  /** The rows rendered past each edge of the view. 8 by default. */
  overscan?: number;
  /** Rows always rendered, such as the focused one. */
  pinned?: () => readonly number[];
  /** A guess at one row's height and the gap after it, in px, until a row is measured. 34 by default. */
  estimate?: number;
};

/** One thing to render: a row, by its index, or a spacer that stands for `count` rows and is `size` px tall. */
export type VirtualSlot =
  | { key: string; index: number; count?: undefined; size?: undefined }
  | { key: string; index?: undefined; count: number; size: number };

type View = { start: number; end: number };

/** The rows to render: the ones in view, the overscan past each edge, and the pinned ones. */
export function visibleRows(count: number, stride: number, view: View, overscan: number, pinned: readonly number[]) {
  const first = Math.max(0, Math.floor(view.start / stride) - overscan);
  const last = Math.min(count, Math.ceil(view.end / stride) + overscan);
  const rows = new Set<number>();
  for (let i = first; i < last; i++) rows.add(i);
  for (const i of pinned) if (i >= 0 && i < count) rows.add(i);
  return [...rows].sort((a, b) => a - b);
}

/** The nearest ancestor that scrolls on the block axis, or undefined for the page. */
export function scrollParent(element: Element): HTMLElement | undefined {
  const doc = element.ownerDocument;
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (parent === doc.body || parent === doc.documentElement) return undefined;
    if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) return parent;
  }
  return undefined;
}

type MoveBefore = (node: Node, child: Node | null) => void;

/**
 * Wraps the list's own `moveBefore`, which Solid calls to move a row it keeps, so a move of the
 * row that holds focus leaves what scrolls where it was, on both axes, the page too. Returns the undo.
 */
function holdScrollOnMove(list: HTMLElement): () => void {
  const target = list as HTMLElement & { moveBefore?: MoveBefore };
  const move = target.moveBefore;
  if (!move) return () => {};
  const doc = list.ownerDocument;
  const hold: MoveBefore = function (this: HTMLElement, node, child) {
    if (!node.contains(doc.activeElement)) return move.call(this, node, child);
    const held: [Element, number, number][] = [];
    for (let at = list.parentElement; at; at = at.parentElement) held.push([at, at.scrollTop, at.scrollLeft]);
    move.call(this, node, child);
    // Instant, even where scroll-behavior is smooth, so it never slides away and back.
    for (const [at, top, left] of held) {
      if (at.scrollTop !== top || at.scrollLeft !== left) at.scrollTo({ top, left, behavior: "instant" });
    }
  };
  target.moveBefore = hold;
  return () => {
    if (target.moveBefore === hold) Reflect.deleteProperty(target, "moveBefore");
  };
}

export function createVirtualList(options: VirtualListOptions) {
  const overscan = options.overscan ?? 8;
  const [stride, setStride] = createSignal(options.estimate ?? 34);
  const [gap, setGap] = createSignal(0);
  // Until the list is on the page, a screenful from its top.
  const [view, setView] = createSignal<View>(
    { start: 0, end: 1200 },
    { equals: (a, b) => a.start === b.start && a.end === b.end },
  );
  let list: HTMLElement | undefined;

  /** Measures a row and where the list sits in what scrolls. */
  function update() {
    if (!list) return;
    const style = getComputedStyle(list);
    const rowGap = parseFloat(style.rowGap) || 0;
    const row = [...list.children].find(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && !child.hidden && child.getAttribute("aria-hidden") !== "true",
    );
    const height = row?.getBoundingClientRect().height ?? 0;
    // Rows growing in or shrinking away are on their way to another height: measure a settled one.
    if (height > 0 && !row?.getAnimations().length) setStride(height + rowGap);
    setGap(rowGap);
    const box = list.getBoundingClientRect();
    const top = box.top + (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.paddingTop) || 0);
    const scroller = scrollParent(list);
    const room = scroller?.getBoundingClientRect() ?? {
      top: 0,
      bottom: list.ownerDocument.defaultView?.innerHeight ?? 0,
    };
    setView({ start: Math.max(0, room.top - top), end: Math.max(0, room.bottom - top) });
  }

  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  /** Pass as the list element's ref. */
  function ref(element: HTMLElement) {
    list = element;
  }

  onSettled(() => {
    if (!list) return;
    const scroller = scrollParent(list);
    const target: EventTarget = scroller ?? list.ownerDocument;
    const win = list.ownerDocument.defaultView;
    target.addEventListener("scroll", schedule, { passive: true });
    win?.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    if (scroller) observer.observe(scroller);

    // Rendering moves rows among the spacers, and a focused row that moves loses focus to the page.
    // It gets it back: it's still the row a person is on.
    const doc = list.ownerDocument;
    let focused: Element | undefined;
    const onFocusIn = (event: FocusEvent) => (focused = event.target as Element);
    // Focus a person moves away, by a click elsewhere or Tab, stays away.
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget) focused = undefined;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!list?.contains(event.target as Node)) focused = undefined;
    };
    list.addEventListener("focusin", onFocusIn);
    list.addEventListener("focusout", onFocusOut);
    doc.addEventListener("pointerdown", onPointerDown, true);
    const moves = new MutationObserver((records) => {
      if (!focused?.isConnected || !(focused instanceof HTMLElement)) return;
      if (doc.activeElement !== doc.body && doc.activeElement !== null) return;
      const moved = records.some((record) => [...record.removedNodes].some((node) => node.contains(focused!)));
      if (moved) focused.focus({ preventScroll: true });
    });
    moves.observe(list, { childList: true });
    const unhold = holdScrollOnMove(list);
    update();
    return () => {
      unhold();
      list?.removeEventListener("focusin", onFocusIn);
      list?.removeEventListener("focusout", onFocusOut);
      doc.removeEventListener("pointerdown", onPointerDown, true);
      moves.disconnect();
      cancelAnimationFrame(frame);
      target.removeEventListener("scroll", schedule);
      win?.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  });

  // The list holds its full height on its own, so while rendering swaps rows and spacers, what
  // scrolls never comes up short for a moment and clamps the scroll position back.
  createEffect(
    () => Math.max(0, options.count() * stride() - gap()),
    (height) => {
      if (list) list.style.minBlockSize = `${height}px`;
    },
  );

  const slots = createMemo<VirtualSlot[]>(() => {
    const count = options.count();
    const rows = visibleRows(count, stride(), view(), overscan, options.pinned?.() ?? []);
    const out: VirtualSlot[] = [];
    let next = 0;
    let spacers = 0;
    const spacer = (skipped: number) => {
      if (skipped > 0) out.push({ key: `spacer-${spacers++}`, count: skipped, size: skipped * stride() - gap() });
    };
    for (const index of rows) {
      spacer(index - next);
      out.push({ key: options.key(index), index });
      next = index + 1;
    }
    spacer(count - next);
    return out;
  });

  return { ref, slots };
}
