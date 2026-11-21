import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Chip, ChipGroup } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then blocks for the tests. "live" removes its chips for real, for the keyboard tests.

const all = ["Landing page", "Spring sale", "Newsletter", "Draft copy"];
const [live, setLive] = createSignal(all);
const [kept, setKept] = createSignal(0);
const noop = () => {};
const [later, setLater] = createSignal(["Ana", "Sam", "Lee"]);
const [rebuilt, setRebuilt] = createSignal(all.map((name) => ({ name })));

renderHarness("chip", () => (
  <>
    <beautiful-example data-example="live">
      <button type="button" id="before">Before</button>
      <ChipGroup aria-label="Live tags">
        <For each={live()}>{(tag) => <Chip onRemove={() => setLive(live().filter((t) => t !== tag))}>{tag}</Chip>}</For>
      </ChipGroup>
      <button type="button" id="reset" onClick={() => setLive(all)}>
        Reset
      </button>
    </beautiful-example>
    <beautiful-example data-example="later">
      <ChipGroup aria-label="Removed after a request">
        <For each={later()}>
          {(name) => <Chip onRemove={() => setTimeout(() => setLater(later().filter((n) => n !== name)), 300)}>{name}</Chip>}
        </For>
      </ChipGroup>
    </beautiful-example>
    <beautiful-example data-example="rebuilt">
      <ChipGroup aria-label="Rebuilt">
        <For each={rebuilt()}>
          {(tag) => (
            <Chip onRemove={() => setRebuilt(rebuilt().filter((t) => t.name !== tag.name).map((t) => ({ ...t })))}>{tag.name}</Chip>
          )}
        </For>
      </ChipGroup>
    </beautiful-example>
    <beautiful-example data-example="element">
      <ChipGroup aria-label="People">
        <Chip onRemove={noop}>
          <strong>Ana Ruiz</strong> (owner)
        </Chip>
      </ChipGroup>
    </beautiful-example>
    <beautiful-example data-example="kept">
      <ChipGroup aria-label="Kept">
        <Chip onRemove={() => setKept(kept() + 1)} removeLabel="Remove filter Archived" data-removes={kept()} id="kept-chip">
          Archived
        </Chip>
      </ChipGroup>
      <Chip id="alone">Alone</Chip>
    </beautiful-example>
  </>
));
