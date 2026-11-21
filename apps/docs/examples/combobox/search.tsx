import { Combobox, ComboboxDescription, ComboboxOption } from "beautiful-ui-solid";
import { For } from "solid-js";

const sites = [
  { id: "spring-launch", name: "Spring launch", domain: "springlaunch.com" },
  { id: "harbor-coffee", name: "Harbor Coffee", domain: "harborcoffee.co" },
  { id: "fern-studio", name: "Fern Studio", domain: "fern.studio" },
];

export default function Search() {
  return (
    <Combobox search aria-label="Search sites" placeholder="Search sites" descriptions="inline">
      <For each={sites}>
        {(site) => (
          <ComboboxOption value={site.id}>
            {site.name}
            <ComboboxDescription>{site.domain}</ComboboxDescription>
          </ComboboxOption>
        )}
      </For>
    </Combobox>
  );
}
