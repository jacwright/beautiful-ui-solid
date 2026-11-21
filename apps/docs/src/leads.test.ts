import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { pageGroups, pageNames } from "./pages.ts";

/**
 * Every component page leads with the bare component, right after the lede (CLAUDE.md, Docs site):
 * examples/<component>/lead.tsx, rendered <Example title="<Component>" hero name="<component>/lead" />.
 * The lead is the example people copy most, so it is built from the page's own Solid component, imported
 * from the kit, never hand-written markup. Foundations, such as Focus ring, are rules rather than a
 * component, and have no lead.
 */
const foundations = new Set<string>(pageGroups.find((group) => group.heading === "Foundations")!.pages);
const components = pageNames.filter((name) => !foundations.has(name));
const slug = (name: string) => name.toLowerCase().replaceAll(" ", "-");

/** The export a lead must use, where it isn't the page's name in PascalCase. */
const exportOf: Record<string, string> = {
  // A toast is written by toast() into a corner; the lead writes one in the page with the same fillToast.
  Toast: "fillToast",
};

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

/** Native elements the kit has a component for: Text, Heading, Link, DescriptionList. */
const handWritten = /<(p|h[1-6]|a|dl|dt|dd)[\s>]/g;

for (const name of components) {
  test(`${name}'s page leads with ${slug(name)}/lead, built from its component`, () => {
    const pagePath = `./pages/${slug(name)}.tsx`;
    assert.ok(existsSync(new URL(pagePath, import.meta.url)), `write src/pages/${slug(name)}.tsx, ${name}'s page`);
    const lead = `../examples/${slug(name)}/lead.tsx`;
    assert.ok(existsSync(new URL(lead, import.meta.url)), `write examples/${slug(name)}/lead.tsx: the bare ${name}`);

    // An <Example> with the bare hero attribute, whatever the order of its attributes.
    const heroes = [...read(pagePath).matchAll(/<Example\b((?:[^>{]|\{[^}]*\})*)\/>/g)]
      .map((match) => match[1]!)
      .filter((attributes) => /(^|\s)hero(?=[\s/]|$)/.test(attributes));
    assert.equal(heroes.length, 1, "the page has one hero");
    assert.match(heroes[0]!, new RegExp(`\\btitle="${name}"`), `the hero's title is "${name}"`);
    assert.match(heroes[0]!, new RegExp(`\\bname="${slug(name)}/lead"`), `the hero is ${slug(name)}/lead`);

    const source = read(lead);
    const used = exportOf[name] ?? name.replaceAll(" ", "");
    const imported = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']beautiful-ui-solid(?:-editor)?["']/g)]
      .flatMap((match) => match[1]!.split(","))
      .map((part) => part.replace(/^\s*type\s+/, "").trim());
    // contextMenu is a ref, not a tag, so the name is matched apart from its first letter's case.
    const own = imported.find((part) => part.toLowerCase() === used.toLowerCase());
    assert.ok(own, `the lead imports ${used} from the kit`);
    assert.match(source, new RegExp(`(<${own}\\b|\\b${own}\\()`), `the lead renders ${own}`);

    const raw = [...source.matchAll(handWritten)].map((match) => match[0].trim());
    assert.deepEqual(raw, [], "the lead uses the kit's Text, Heading, Link and DescriptionList, not hand-written tags");
  });
}
