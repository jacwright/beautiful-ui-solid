import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * The kit's markup never uses <div> or <span> (CLAUDE.md, Principles). Where no semantic element
 * fits, a beautiful-* element is the styling hook. This reads every component, the kit's packages
 * (the Editor), every example, docs page and test, so a generic wrapper fails here before review.
 */
const roots = ["../../../src/", "../../../packages/editor/src/", "../examples/", "./", "../tests/", "../index.html"].map((path) => new URL(path, import.meta.url));
const generic = /<(?:div|span)(?=[\s>/]|$)|createElement\(\s*["'`](?:div|span)["'`]/i;
/** A comment may name the elements it does without. */
const comment = /^\s*(?:\*|\/\/|\/\*|<!--)/;

function files(url: URL): URL[] {
  if (!url.pathname.endsWith("/")) return [url];
  return readdirSync(url, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(new URL(`${entry.name}/`, url)) : [new URL(entry.name, url)],
  );
}

test("no <div> or <span> in the kit or its docs", () => {
  const found = roots
    .flatMap(files)
    .filter((url) => /\.(tsx?|html|css)$/.test(url.pathname) && url.href !== import.meta.url)
    .flatMap((url) =>
      readFileSync(url, "utf8")
        .split("\n")
        .flatMap((line, i) => (generic.test(line) && !comment.test(line) ? [`${url.pathname}:${i + 1}: ${line.trim()}`] : [])),
    );
  assert.deepEqual(found, [], `use a beautiful-* element instead:\n${found.join("\n")}`);
});

/**
 * A docs page's code block scrolls sideways when a line is long, and whether one does depends on
 * the width and the font that has loaded. One that scrolls must take focus, so the keyboard can
 * scroll it (axe's scrollable-region-focusable), so every one does.
 */
test("every docs code block takes focus", () => {
  const found = ["./", "../examples/", "../tests/harness/"]
    .flatMap((path) => files(new URL(path, import.meta.url)))
    .filter((url) => /\.(tsx|html)$/.test(url.pathname))
    .flatMap((url) => {
      const text = readFileSync(url, "utf8");
      // Each <pre> tag whole, over as many lines as it takes, without tabindex="0".
      return [...text.matchAll(/<pre(?=[\s>])(?:\{[^}]*\}|[^>{])*>/g)]
        .filter((tag) => !/\btabindex="0"/.test(tag[0]))
        .map((tag) => `${url.pathname}:${text.slice(0, tag.index).split("\n").length}: ${tag[0]}`);
    });
  assert.deepEqual(found, [], `give the <pre> tabindex="0":\n${found.join("\n")}`);
});
