import assert from "node:assert/strict";
import { test } from "node:test";
import { safeHref, safeSrc } from "./commands.ts";

// The addresses the editor keeps. Its menus, parsing and Markdown are tested in the browser, in
// apps/docs/tests/editor.spec.ts.

test("a link keeps only an address people can follow safely", () => {
  for (const href of ["https://example.com", "http://example.com", "mailto:ava@example.com", "tel:+15551234", "/about", "#prices", "?plan=pro"]) {
    assert.equal(safeHref(href), href);
  }
  for (const href of ["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,hi", "vbscript:x", "//evil.example", "file:///etc/passwd", "", null, 3]) {
    assert.equal(safeHref(href), null, String(href));
  }
});

test("a picture or video keeps the web, a path on the site, or a file not yet uploaded", () => {
  for (const src of ["https://cdn.example/a.webp", "/illustrations/a.webp", "blob:https://site.example/1234"]) assert.equal(safeSrc(src), src);
  for (const src of ["javascript:alert(1)", "data:image/svg+xml,<svg onload=alert(1)>", "//evil.example/a.png", "", undefined]) {
    assert.equal(safeSrc(src), null, String(src));
  }
});
