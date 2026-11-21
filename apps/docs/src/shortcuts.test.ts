import assert from "node:assert/strict";
import { test } from "node:test";
import { type Action, actionScore, findActions, matchesKeys, pressedKeys } from "../../../src/actions.ts";
import { actionKeys, hasOwnKeys, isSingleKey, setActionKeys, setShortcutSettings, setSingleKeys } from "../../../src/shortcut-settings.ts";
import { keysProblem, type ReachableShortcut, reservedKeys, shortcutProblems, shortcutSections } from "../../../src/shortcuts.ts";

// The pure half of the shortcut system: a list's problems, and which key presses match which keys.
// The scopes, walls and text boxes are tested in the browser (tests/shortcuts.spec.ts).

const press = (key: string, mods: Partial<Record<"ctrlKey" | "metaKey" | "altKey" | "shiftKey", boolean>> = {}, code = "") =>
  ({ key, code, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods }) as KeyboardEvent;

test("a list with distinct keys has no problems", () => {
  assert.deepEqual(shortcutProblems([{ id: "bold", label: "Bold", keys: "Mod+B" }, { actions: [{ id: "italic", label: "Italic", keys: "Mod+I" }] }]), []);
});

test("two actions with the same keys are a problem, however the keys are spelled, through groups and submenus", () => {
  const problems = shortcutProblems([
    { id: "redo", label: "Redo", keys: "Shift+Mod+Z" },
    { id: "more", label: "More", actions: [{ id: "again", label: "Again", keys: "Mod+Shift+z" }] },
  ]);
  assert.deepEqual(problems, ['"redo" and "again" both use Mod+Shift+z.']);
});

test("Mod and Control clash only where Mod is Control", () => {
  const problems = shortcutProblems([
    { id: "a", label: "A", keys: "Mod+J" },
    { id: "b", label: "B", keys: "Control+J" },
  ]);
  assert.equal(problems.length, 1);
});

test("every key the browser keeps is refused", () => {
  for (const keys of reservedKeys) {
    assert.match(shortcutProblems([{ id: "x", label: "X", keys }]).join(), /browser keeps/, keys);
  }
  assert.deepEqual(shortcutProblems([{ id: "x", label: "X", keys: "Mod+K" }]), []);
});

test("a sign matches with or without Shift; a letter only as written", () => {
  assert.ok(matchesKeys(press("?", { shiftKey: true }), "?", false));
  assert.ok(matchesKeys(press("?"), "?", false));
  assert.ok(matchesKeys(press("e", {}, "KeyE"), "E", false));
  assert.ok(!matchesKeys(press("E", { shiftKey: true }, "KeyE"), "E", false));
  assert.ok(!matchesKeys(press("?", { ctrlKey: true }), "?", false));
});

test("a search ranks a label's start, then a word of it, then a keyword, then anywhere", () => {
  const heading: Action = { id: "h1", label: "Heading 1", keywords: ["title"] };
  assert.equal(actionScore(heading, "head"), 4);
  assert.equal(actionScore(heading, "1"), 3);
  assert.equal(actionScore(heading, "tit"), 2);
  assert.equal(actionScore(heading, "ding"), 1);
  assert.equal(actionScore(heading, "quote"), 0);
  assert.equal(actionScore(heading, "  "), 1);
  const list: Action[] = [{ id: "a", label: "Archive" }, { id: "s", label: "Star", keywords: ["favorite"] }, { id: "r", label: "Reply all" }];
  assert.deepEqual(findActions(list, "a").map((a) => a.id), ["a", "r", "s"]);
  assert.deepEqual(findActions(list, "", (a) => a).map((a) => a.id), ["a", "s", "r"]);
});

test("reachable shortcuts fall into one section per scope label, innermost first", () => {
  const at = (id: string, scope?: string): ReachableShortcut => ({ action: { id, label: id }, context: undefined, scope, shadowed: false, enabled: true });
  const sections = shortcutSections([at("bold", "Editor"), at("link", "Editor"), at("rename"), at("search", "Docs"), at("theme", "Docs")]);
  assert.deepEqual(
    sections.map((s) => [s.scope, s.shortcuts.map((each) => each.action.id)]),
    [["Editor", ["bold", "link"]], [undefined, ["rename"]], ["Docs", ["search", "theme"]]],
  );
  // A scope further out with the same label as one further in stays below what's between them.
  assert.deepEqual(shortcutSections([at("search", "Docs"), at("go"), at("theme", "Docs")]).map((s) => s.scope), ["Docs", undefined, "Docs"]);
});

test("a press is written as an action's keys, and those keys match it again", () => {
  const cases: [KeyboardEvent, boolean, string][] = [
    [press("k", { metaKey: true }, "KeyK"), true, "Mod+K"],
    [press("k", { ctrlKey: true }, "KeyK"), false, "Mod+K"],
    [press("K", { ctrlKey: true, shiftKey: true }, "KeyK"), false, "Shift+Mod+K"],
    [press("´", { altKey: true }, "KeyE"), true, "Alt+E"],
    [press("?", { shiftKey: true }, "Slash"), false, "?"],
    [press("e", {}, "KeyE"), false, "E"],
    [press("@", { altKey: true, shiftKey: true }, "Digit2"), false, "Alt+Shift+2"],
    [press("F2", {}, "F2"), false, "F2"],
    [press("j", { ctrlKey: true }, "KeyJ"), true, "Control+J"],
    // A sign with another modifier keeps Shift, which matchesKeys then asks for.
    [press("?", { metaKey: true, shiftKey: true }, "Slash"), true, "Shift+Mod+?"],
  ];
  for (const [event, apple, keys] of cases) {
    assert.equal(pressedKeys(event, apple), keys);
    assert.ok(matchesKeys(event, keys, apple), keys);
  }
  assert.equal(pressedKeys(press("Shift", { shiftKey: true }, "ShiftLeft"), false), undefined);
  assert.equal(pressedKeys(press("Meta", { metaKey: true }, "MetaLeft"), true), undefined);
});

test("a single key is one character with no ⌘, Ctrl or Alt", () => {
  for (const keys of ["?", "T", "Shift+T", "/"]) assert.ok(isSingleKey(keys), keys);
  for (const keys of ["Mod+K", "Alt+E", "F2", "Delete", "Escape", "Control+J"]) assert.ok(!isSingleKey(keys), keys);
});

test("a person's keys stand in for an action's own, and single keys can be turned off", () => {
  const archive: Action = { id: "archive", label: "Archive", keys: "E" };
  const palette: Action = { id: "palette", label: "Commands", keys: "Mod+K" };
  try {
    assert.equal(actionKeys(archive), "E");
    setActionKeys("archive", "Alt+E");
    assert.equal(actionKeys(archive), "Alt+E");
    assert.ok(hasOwnKeys(archive));
    setActionKeys("archive", null);
    assert.equal(actionKeys(archive), undefined);
    setActionKeys("archive", undefined);
    assert.equal(actionKeys(archive), "E");
    assert.ok(!hasOwnKeys(archive));
    setSingleKeys(false);
    assert.equal(actionKeys(archive), undefined);
    assert.equal(actionKeys(palette), "Mod+K");
    // A key the person set is a single key too, and off with the rest.
    setActionKeys("palette", "P");
    assert.equal(actionKeys(palette), undefined);
  } finally {
    setShortcutSettings({ singleKeys: true, keys: {} });
  }
});

test("a person's keys are refused where the browser keeps them, or another action reached from here has them", () => {
  const archive: Action = { id: "archive", label: "Archive", keys: "E", run() {} };
  const star: Action = { id: "star", label: "Star", keys: "S", run() {} };
  const reached = [archive, star].map((action) => ({ action, keys: action.keys, context: undefined, shadowed: false, enabled: true }));
  assert.equal(keysProblem(star, "E", reached), "Archive already uses E.");
  assert.match(keysProblem(star, "Mod+W", reached) ?? "", /is the browser's\.$/);
  assert.equal(keysProblem(star, "S", reached), undefined);
  assert.equal(keysProblem(star, "Alt+S", reached), undefined);
  try {
    setSingleKeys(false);
    assert.match(keysProblem(star, "X", reached) ?? "", /^Single-key shortcuts are off/);
  } finally {
    setShortcutSettings({ singleKeys: true, keys: {} });
  }
});
