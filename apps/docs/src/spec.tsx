import { Button } from "beautiful-ui-solid";
import type { JSX } from "@solidjs/web";
import type { Component } from "solid-js";
import { createSignal, For, onCleanup } from "solid-js";

// Every example is a Solid component in examples/<component>/<name>.tsx, whose default export is the example. Tests
// run against the same examples, on the docs pages.
const examples = import.meta.glob<Component>("../examples/*/*.tsx", { eager: true, import: "default" });
const sources = import.meta.glob<string>("../examples/*/*.tsx", { eager: true, query: "?raw", import: "default" });

/** The example examples/<name>.tsx, such as "button/primary": its component and its code. */
export function exampleOf(name: string) {
  const key = `../examples/${name}.tsx`;
  const component = examples[key];
  if (!component) throw new Error(`No example ${key}`);
  return { component, code: sources[key]! };
}

/**
 * The markup an element holds, as a static website would write it: an element whose children are all elements one a
 * line, indented, any other (an <svg>, text, inline elements among text) whole on its line, and without Solid's empty
 * anchor comments. State Solid sets as properties, a control's value, checked and selected, is written back as the
 * attributes a page would write.
 */
function markupOf(element: HTMLElement) {
  const root = element.cloneNode(true) as HTMLElement;
  const controls = (from: Element) => from.querySelectorAll("input, textarea, option");
  const live = [...controls(element)];
  controls(root).forEach((copy, i) => {
    const control = live[i];
    if (control instanceof HTMLInputElement && copy instanceof HTMLInputElement) {
      if (control.type === "checkbox" || control.type === "radio") copy.toggleAttribute("checked", control.checked);
      else if (control.value) copy.setAttribute("value", control.value);
    } else if (control instanceof HTMLTextAreaElement) copy.textContent = control.value;
    else if (control instanceof HTMLOptionElement) copy.toggleAttribute("selected", control.selected && (control.index > 0 || control.disabled));
  });
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  for (const comment of comments) comment.parentNode!.removeChild(comment);

  const htmlOf = (node: Element) => {
    const box = document.createElement("template");
    box.content.append(node.cloneNode(true));
    return box.getHTML();
  };
  const lines: string[] = [];
  const write = (node: Element, depth: number) => {
    const indent = "  ".repeat(depth);
    const children = [...node.childNodes].filter((child) => child.nodeType !== Node.TEXT_NODE || child.textContent!.trim());
    const blocks = children.length > 0 && children.every((child) => child instanceof Element);
    if (!blocks || node instanceof SVGElement || node.closest("pre, textarea")) {
      lines.push(indent + htmlOf(node).replace(/\n\s*/g, node.closest("pre, textarea") ? "\n" : " "));
      return;
    }
    const [open, close] = htmlOf(node.cloneNode(false) as Element).split(/(?=<\/[^>]+>$)/);
    lines.push(indent + open);
    for (const child of children) write(child as Element, depth + 1);
    if (close) lines.push(indent + close);
  };
  for (const child of root.children) write(child, 0);
  return lines.join("\n");
}

/**
 * An example: the Solid component examples/<name>.tsx live, then its code, then the markup it renders, which is what
 * a static website writes for the same look with no JS. children go above it, for a control that drives it. A `hero`
 * example is the one a page opens with, under its title: no header bar, and its title is an h2 for screen readers
 * only, since it comes before the page's first h2.
 *
 * An example given as `html` is a static page with no JS, the Websites guide's (examples/websites/). Every
 * other example is Solid (examples.test.ts).
 */
export function Example(props: { title: string; hero?: boolean; children?: JSX.Element } & ({ name: string } | { html: string })) {
  if ("html" in props) return <StaticExample {...props} />;
  const example = exampleOf(props.name);
  const [markup, setMarkup] = createSignal("");
  let preview!: HTMLElement;
  // Read when the reader opens Markup, so an example that changes as it's used shows the markup it has then.
  const refresh = (event: Event) => {
    if ((event.currentTarget as HTMLDetailsElement).open) setMarkup(markupOf(preview));
  };
  return (
    <section class="example" data-hero={props.hero || undefined}>
      <ExampleTitle title={props.title} hero={props.hero} />
      {props.children}
      <beautiful-example-preview ref={preview}>
        <example.component />
      </beautiful-example-preview>
      <details>
        <summary>Code</summary>
        <pre tabindex="0"><code>{example.code.trim()}</code></pre>
      </details>
      <details onToggle={refresh}>
        <summary>Markup</summary>
        <pre tabindex="0"><code>{markup()}</code></pre>
      </details>
    </section>
  );
}

/** A static example: the markup rendered live, then the same markup as text. */
function StaticExample(props: { title: string; html: string; hero?: boolean; children?: JSX.Element }) {
  return (
    <section class="example" data-hero={props.hero || undefined}>
      <ExampleTitle title={props.title} hero={props.hero} />
      {props.children}
      <beautiful-example-preview innerHTML={props.html} />
      <details>
        <summary>Markup</summary>
        <pre tabindex="0"><code>{props.html.trim()}</code></pre>
      </details>
    </section>
  );
}

function ExampleTitle(props: { title: string; hero?: boolean }) {
  return props.hero ? (
    <h2>
      <beautiful-visually-hidden>{props.title}</beautiful-visually-hidden>
    </h2>
  ) : (
    <h3>{props.title}</h3>
  );
}

export type Prop = { name: string; type: string; default?: string; description: JSX.Element };

export function PropsTable(props: { rows: Prop[] }) {
  return (
    <beautiful-table-scroll>
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.rows}>
            {(row) => (
              <tr>
                <td><code>{row.name}</code></td>
                <td><code>{row.type}</code></td>
                <td>{row.default ? <code>{row.default}</code> : "required"}</td>
                <td>{row.description}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </beautiful-table-scroll>
  );
}

/** A prompt to paste into another tool, such as ChatGPT: its words as they go, and a button that copies them. */
export function Prompt(props: { title: string; text: string }) {
  const [label, setLabel] = createSignal("Copy");
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));
  async function copy() {
    let next = "Copied";
    try {
      await navigator.clipboard.writeText(props.text);
    } catch {
      // The browser can refuse the clipboard. The words are still there to select.
      next = "Select the text";
    }
    setLabel(next);
    clearTimeout(timer);
    timer = setTimeout(() => setLabel("Copy"), 2000);
  }
  return (
    <section class="prompt">
      <header class="prompt-head">
        <h3>{props.title}</h3>
        <Button variant="tertiary" onClick={copy}>
          {label()}
        </Button>
      </header>
      <pre tabindex="0"><code>{props.text}</code></pre>
    </section>
  );
}
