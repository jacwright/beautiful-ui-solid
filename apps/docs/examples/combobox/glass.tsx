import { Combobox, ComboboxOption } from "beautiful-ui-solid";
import { For } from "solid-js";

const people = [
  ["ada", "Ada Lovelace"],
  ["grace", "Grace Hopper"],
  ["katherine", "Katherine Johnson"],
  ["margaret", "Margaret Hamilton"],
  ["dorothy", "Dorothy Vaughan"],
  ["mary", "Mary Jackson"],
  ["hedy", "Hedy Lamarr"],
  ["radia", "Radia Perlman"],
] as const;

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <Combobox id="task-owner" aria-label="Owner" defaultValue="grace">
        <For each={people}>{([value, name]) => <ComboboxOption value={value}>{name}</ComboboxOption>}</For>
      </Combobox>
    </beautiful-demo-stage>
  );
}
