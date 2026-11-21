import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseComponents, slugOf } from "./nav.ts";
import { guideNames, pageGroups, pageNames } from "./pages.ts";

const rows = parseComponents(readFileSync(new URL("../../../docs/components.md", import.meta.url), "utf8"));

test("every page has a row in components.md", () => {
  for (const name of pageNames) {
    assert.ok(rows.some((r) => r.name === name), `${name} has a page but no row in components.md`);
  }
});

test("no guide takes a component's path", () => {
  for (const name of guideNames) {
    assert.ok(!rows.some((r) => r.slug === slugOf(name)), `the ${name} guide and a component share /${slugOf(name)}`);
  }
});

test("parseComponents reads rows from every table and skips headers and prose", () => {
  const md = [
    "Intro | not a table row",
    "| Component | Catalyst | Status | Notes |",
    "| --- | --- | --- | --- |",
    "| Button group | | listed | Two words. |",
    "",
    "| Component | Status | Notes |",
    "| --- | --- | --- |",
    "| Skeleton | listed | |",
  ].join("\n");
  assert.deepEqual(parseComponents(md), [
    { name: "Button group", status: "listed", notes: "Two words.", slug: "button-group" },
    { name: "Skeleton", status: "listed", notes: "", slug: "skeleton" },
  ]);
});

test("parseComponents rejects an unknown status", () => {
  assert.throws(() => parseComponents("| Component | Status |\n| --- | --- |\n| Dialog | done |"), /Dialog/);
});

test("every page and guide is in exactly one sidebar section, in name order", () => {
  const grouped = pageGroups.flatMap((group) => group.pages);
  for (const name of [...pageNames, ...guideNames]) {
    assert.equal(grouped.filter((n) => n === name).length, 1, `${name} should be in exactly one of pageGroups' sections`);
  }
  for (const group of pageGroups) {
    assert.deepEqual(group.pages, [...group.pages].sort((a, b) => a.localeCompare(b)), `${group.heading} is out of name order`);
  }
});
