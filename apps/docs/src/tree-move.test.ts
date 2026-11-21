import assert from "node:assert/strict";
import { test } from "node:test";
import { moveTreeItem, placeAt, treeSpots } from "../../../src/tree-move.ts";

// Tree's moving as data (src/tree-move.ts): the spots a keyboard move steps through, where a
// pointer drops, and the items with one moved.

type Node = { id: string; children?: Node[] };

const site: Node[] = [
  { id: "home" },
  { id: "about", children: [{ id: "team" }, { id: "careers" }] },
  { id: "pricing" },
  { id: "blog", children: [{ id: "spring" }] },
];

/** The shown rows with About open and Blog closed, as the tree hands them over. */
const rows = [
  { id: "home", level: 1, parents: [] },
  { id: "about", level: 1, parents: [] },
  { id: "team", level: 2, parents: ["about"] },
  { id: "careers", level: 2, parents: ["about"] },
  { id: "pricing", level: 1, parents: [] },
  { id: "blog", level: 1, parents: [] },
];

const names = (spots: { id: string; place: string }[]) => spots.map((spot) => `${spot.place} ${spot.id}`);

test("the spots are in reading order, with an after for the last of each set of siblings", () => {
  const { spots, origin } = treeSpots(rows, "pricing");
  assert.deepEqual(names(spots), [
    "before home",
    "inside home",
    "before about",
    // Not inside About: it's open, so after Careers is the same place.
    "before team",
    "inside team",
    "before careers",
    "inside careers",
    "after careers",
    // before pricing is where it is; so is before blog, its next sibling.
    "inside blog",
    "after blog",
  ]);
  assert.equal(spots[origin]?.id, "blog");
});

test("an item's own children aren't spots, and nor is where it already is", () => {
  const { spots, origin } = treeSpots(rows, "about");
  assert.deepEqual(names(spots), ["before home", "inside home", "inside pricing", "before blog", "inside blog", "after blog"]);
  assert.equal(origin, 2);
  // The last child: inside its parent and after its last sibling are where it already is.
  assert.deepEqual(names(treeSpots(rows, "careers").spots).filter((name) => name.endsWith("about") || name === "after team"), [
    "before about",
  ]);
  // The first child: About still has Careers showing, so after Careers stands for inside it.
  assert.deepEqual(names(treeSpots(rows, "team").spots).filter((name) => name.endsWith("about") || name.endsWith("careers")), [
    "before about",
    "inside careers",
    "after careers",
  ]);
});

test("allowed leaves spots out", () => {
  const { spots } = treeSpots(rows, "blog", (spot) => spot.place !== "inside");
  assert.ok(!names(spots).some((name) => name.startsWith("inside")));
});

test("the top quarter drops before, the bottom quarter after, the middle inside", () => {
  assert.equal(placeAt(104, 100, 32), "before");
  assert.equal(placeAt(116, 100, 32), "inside");
  assert.equal(placeAt(130, 100, 32), "after");
});

test("moveTreeItem moves an item before, after or inside another, keeping the rest as they are", () => {
  const ids = (list: Node[]): unknown => list.map((node) => (node.children ? [node.id, ids(node.children)] : node.id));
  assert.deepEqual(ids(moveTreeItem(site, "pricing", "home", "before")), ["pricing", "home", ["about", ["team", "careers"]], ["blog", ["spring"]]]);
  assert.deepEqual(ids(moveTreeItem(site, "home", "careers", "after")), [["about", ["team", "careers", "home"]], "pricing", ["blog", ["spring"]]]);
  assert.deepEqual(ids(moveTreeItem(site, "team", "pricing", "inside")), ["home", ["about", ["careers"]], ["pricing", ["team"]], ["blog", ["spring"]]]);
  const moved = moveTreeItem(site, "team", "pricing", "inside");
  // What the move didn't touch is the same objects.
  assert.equal(moved[0], site[0]);
  assert.equal(moved[3], site[3]);
  // Into its own children, or onto itself: nothing changes.
  assert.deepEqual(moveTreeItem(site, "about", "team", "inside"), site);
  assert.deepEqual(moveTreeItem(site, "about", "about", "before"), site);
});
