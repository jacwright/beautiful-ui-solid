import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * The kit renders through Solid's JSX, which escapes text, so a component never parses a string as
 * HTML (CLAUDE.md, Security). This reads the components, the examples and the docs app, and fails
 * on any HTML sink outside the two that are needed. Example in spec.tsx renders an example file
 * that the build imports with ?raw, so the HTML it parses is ours. The Editor's HTML format reads a
 * value into an inert document that runs nothing, and keeps only what its schema holds (CLAUDE.md,
 * Security). Tests may build markup freely.
 */
const roots = ["../../../src/", "../../../packages/editor/src/", "../examples/", "./", "../tests/harness/", "../index.html"].map(
  (path) => new URL(path, import.meta.url),
);
/** The sinks, by their lines: Example's preview and the type that lets JSX set it, and the Editor's parser. */
const allowed = new Map([
  [new URL("./spec.tsx", import.meta.url).href, ["<beautiful-example-preview innerHTML={props.html} />"]],
  [new URL("./elements.ts", import.meta.url).href, ['"beautiful-example-preview": HTMLAttributes<HTMLElement> & { innerHTML?: string };']],
  [
    new URL("../../../packages/editor/src/format.ts", import.meta.url).href,
    [
      'import { DOMParser as SchemaParser, DOMSerializer, type Node, type Schema } from "prosemirror-model";',
      'const inert = new globalThis.DOMParser().parseFromString(html, "text/html");',
    ],
  ],
]);
const sink =
  /\b(?:innerHTML|outerHTML|insertAdjacentHTML|setHTMLUnsafe|parseHTMLUnsafe|createContextualFragment|DOMParser|document\.write\w*|eval|Function)\b|srcdoc/;
/** A comment may name the sinks it does without. */
const comment = /^\s*(?:\*|\/\/|\/\*|<!--)/;

function files(url: URL): URL[] {
  if (!url.pathname.endsWith("/")) return [url];
  return readdirSync(url, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(new URL(`${entry.name}/`, url)) : [new URL(entry.name, url)],
  );
}

test("no HTML sink in the kit, the Editor or the docs, but the docs examples and the Editor's parser", () => {
  const found = roots
    .flatMap(files)
    .filter((url) => /\.(m?[jt]sx?|html|svg)$/.test(url.pathname) && !/\.test\.ts$/.test(url.pathname))
    .flatMap((url) =>
      readFileSync(url, "utf8")
        .split("\n")
        .flatMap((line, i) => (sink.test(line) && !comment.test(line) && !allowed.get(url.href)?.includes(line.trim()) ? [`${url.pathname}:${i + 1}: ${line.trim()}`] : [])),
    );
  assert.deepEqual(found, [], `render through JSX instead, or say why in CLAUDE.md (Security):\n${found.join("\n")}`);
});
