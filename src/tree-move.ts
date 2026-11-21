/**
 * Moving a Tree's items, as data: the spots an item can go to from the keyboard, where a pointer
 * over a row drops it, and the items with one moved. tree.tsx drags and moves rows with these; an
 * app that holds its items as TreeNodes can hand moveTreeItem the tree's onMove to change them.
 *
 * A spot is a row and a place against it: "before" and "after" make the item that row's sibling,
 * "inside" makes it the row's last child.
 */

/** Where a moved item goes against its target: just before it, just after it, or inside it, last. */
export type TreePlace = "before" | "after" | "inside";

/** A row and a place against it. */
export type TreeSpot = { id: string; place: TreePlace };

/** One shown row, as the spots need it: its id, its depth from 1, and its parents' ids, outermost first. */
export type TreeMoveRow = { id: string; level: number; parents: readonly string[] };

/**
 * The spots, in reading order, that the item `moving` can go to among the shown rows: before each
 * row, inside it, and after the last of each set of siblings, past its children. An open item with
 * its children showing has no "inside": "after" its last child is the same place, where it shows. The item and its
 * children are left out, as are the spots where it already is (before its next sibling, after its
 * last one, inside its parent when it's the last child) and any spot `allowed` refuses. `origin` is
 * the index of the first spot after where the item is now, so ↓ goes there first and ↑ to the one
 * before.
 */
export function treeSpots(
  rows: readonly TreeMoveRow[],
  moving: string,
  allowed: (spot: TreeSpot) => boolean = () => true,
): { spots: TreeSpot[]; origin: number } {
  const spots: TreeSpot[] = [];
  let origin = -1;
  let from: TreeMoveRow | undefined;
  // The row just after the item and its children: if it's a sibling, before it is where the item is.
  let first = false;
  const push = (spot: TreeSpot) => {
    if (allowed(spot)) spots.push(spot);
  };
  // The rows whose sets of siblings are still going, deepest last.
  const open: TreeMoveRow[] = [];
  /** Ends every set of siblings at `level` and deeper: a set that ends here gets its "after" spot. */
  const closeTo = (level: number, end = false) => {
    while (open.length && open.at(-1)!.level >= level) {
      const row = open.pop()!;
      if (row.level > level || end) push({ id: row.id, place: "after" });
    }
  };
  const list = rows.filter((row) => !row.parents.includes(moving));
  list.forEach((row, index) => {
    closeTo(row.level);
    if (row.id === moving) {
      origin = spots.length;
      from = row;
      first = true;
      return;
    }
    const next = first && row.level === from!.level;
    first = false;
    if (!next) push({ id: row.id, place: "before" });
    // The next row but the item, which is leaving: if it's a child, this item is open with children showing.
    const after = list[index + 1]?.id === moving ? list[index + 2] : list[index + 1];
    if (!after?.parents.includes(row.id)) push({ id: row.id, place: "inside" });
    open.push(row);
  });
  closeTo(1, true);
  // Inside its parent, last, is where the last child already is.
  const parent = from?.parents.at(-1);
  const lastChild = from !== undefined && !followedBySibling(rows, from);
  if (parent !== undefined && lastChild) {
    const at = spots.findIndex((spot) => spot.id === parent && spot.place === "inside");
    if (at >= 0) {
      spots.splice(at, 1);
      if (at < origin) origin--;
    }
  }
  return { spots, origin: origin < 0 ? 0 : origin };
}

/** Whether a sibling of `row` comes after it among the rows. */
function followedBySibling(rows: readonly TreeMoveRow[], row: TreeMoveRow) {
  for (let i = rows.indexOf(row) + 1; i < rows.length; i++) {
    const other = rows[i]!;
    if (other.level < row.level) return false;
    if (other.level === row.level) return true;
  }
  return false;
}

/**
 * The place a pointer at `y` over a row drops on: the top quarter before it, the bottom quarter
 * after it, and the middle inside it.
 */
export function placeAt(y: number, top: number, height: number): TreePlace {
  const at = (y - top) / height;
  if (at < 0.25) return "before";
  if (at > 0.75) return "after";
  return "inside";
}

type Node<T> = { id: string; children?: readonly T[] };

/**
 * The items with `id` moved before, after or inside `target`, as new arrays where anything changed:
 * the same objects otherwise, so an app's other fields ride along. A move onto the item itself or
 * into its own children gives the items back unchanged.
 */
export function moveTreeItem<T extends Node<T>>(items: readonly T[], id: string, target: string, place: TreePlace): T[] {
  if (id === target) return [...items];
  let taken: T | undefined;
  const without = edit(items, (node) => {
    if (node.id !== id) return undefined;
    taken = node;
    return [];
  });
  // Its own children went with it, so a target among them isn't in what's left.
  if (!taken || !contains(without, target)) return [...items];
  const moved = taken;
  return [
    ...edit(without, (node) => {
      if (node.id !== target) return undefined;
      if (place === "before") return [moved, node];
      if (place === "after") return [node, moved];
      return [{ ...node, children: [...(node.children ?? []), moved] }];
    }),
  ];
}

/**
 * The list with each node `change` gives a replacement for (undefined keeps it) replaced, at any
 * depth. Lists and nodes with nothing changed in them come back as the same objects.
 */
function edit<T extends Node<T>>(list: readonly T[], change: (node: T) => T[] | undefined): readonly T[] {
  let changed = false;
  const out = list.flatMap((node) => {
    const replaced = change(node);
    if (replaced) {
      changed = true;
      return replaced;
    }
    if (!node.children) return [node];
    const children = edit(node.children, change);
    if (children === node.children) return [node];
    changed = true;
    return [{ ...node, children }];
  });
  return changed ? out : list;
}

function contains<T extends Node<T>>(list: readonly T[], id: string): boolean {
  return list.some((node) => node.id === id || (node.children ? contains(node.children, id) : false));
}
