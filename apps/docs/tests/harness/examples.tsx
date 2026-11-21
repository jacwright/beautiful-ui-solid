import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import type { Component } from "solid-js";
import { For, Show } from "solid-js";

const all = import.meta.glob<Component>("../../examples/*/*.tsx", { eager: true, import: "default" });

/** A component's docs examples (examples/<component>/<name>.tsx), by name. */
export function examplesOf(component: string): [name: string, example: Component][] {
  const prefix = `../../examples/${component}/`;
  return Object.entries(all)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, example]) => [path.slice(prefix.length, -".tsx".length), example]);
}

/**
 * Renders a harness page: each of the component's docs examples in a <beautiful-example data-example="<name>">, on the
 * kit's plain canvas, then extra, the blocks that test what no example shows. ?example=<name> renders that one alone,
 * so a page has the one <main> a real page has.
 */
export function renderHarness(component: string, extra?: () => JSX.Element) {
  const only = new URLSearchParams(location.search).get("example");
  render(
    () => (
      <>
        <For each={examplesOf(component)}>
          {([name, Example]) => (
            <Show when={!only || only === name}>
              <beautiful-example data-example={name}>
                <Example />
              </beautiful-example>
            </Show>
          )}
        </For>
        <Show when={!only}>{extra?.()}</Show>
      </>
    ),
    document.getElementById("app")!,
  );
}
