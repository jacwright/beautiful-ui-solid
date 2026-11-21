import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Every raised thing takes one of the four depths (tokens.css, --shadow-1 to --shadow-4). A theme
 * may tune a depth's light (--shadow-cast, --shadow-halo) but never defines a shadow of its own, so
 * a drop shadow in a theme file fails here. Wells and tracks sink instead of rise: an inset shadow
 * or none is theirs.
 */
const themes = new URL("../../../src/styles/themes/", import.meta.url);

test("a theme's shadow tokens are a depth, an inset well or none", () => {
  const bad = readdirSync(themes)
    .filter((name) => name.endsWith(".css"))
    .flatMap((name) => {
      const css = readFileSync(new URL(name, themes), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      // Each declaration of a --*shadow* property, whatever lines it spans.
      return [...css.matchAll(/(--[\w-]*shadow[\w-]*)\s*:\s*([^;]+);/g)].flatMap(([, token, value]) => {
        const v = (value ?? "").trim();
        if (/^(?:none|revert-layer|var\(--shadow-(?:[1-4]|cast|halo)\)|var\(--control-shadow\)|var\(--glass-halo\)|-?[\d.]+|transparent)$/.test(v)) return [];
        if (/^inset\b/.test(v)) return [];
        if (token === "--glass-halo") return [];
        return [`${name}: ${token}: ${v}`];
      });
    });
  assert.deepEqual(bad, [], "a theme defines its own outer shadow; use a depth in tokens.css");
});
