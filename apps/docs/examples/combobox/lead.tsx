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

export default function Lead() {
  return (
    <Combobox id="lead-task-owner" aria-label="Owner" defaultValue="grace">
      <For each={people}>{([value, name]) => <ComboboxOption value={value}>{name}</ComboboxOption>}</For>
    </Combobox>
  );
}
