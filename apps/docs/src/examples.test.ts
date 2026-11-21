import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { test } from "node:test";

/**
 * Every docs example is a Solid component, examples/<component>/<name>.tsx, rendered by the page's
 * <Example name>. Apps are Solid apps on the kit, so the docs show and test the Solid components, and
 * the markup they render is shown beside them for plain HTML pages.
 *
 * The Websites guide's examples (examples/websites/) stay .html: they are static websites with no JS,
 * the one place plain markup is written.
 */
test("every docs example is a Solid .tsx, not static .html", () => {
  const root = new URL("../examples/", import.meta.url);
  const html = readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((path) => path.endsWith(".html") && !path.startsWith("websites/"))
    .sort();
  assert.deepEqual(html, [], `write these examples as Solid components, examples/<component>/<name>.tsx:\n${html.join("\n")}`);
});
