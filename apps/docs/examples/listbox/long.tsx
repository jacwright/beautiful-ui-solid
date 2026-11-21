import { Field, Label, Listbox, ListboxOption } from "beautiful-ui-solid";
import { For } from "solid-js";

const countries = ["Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "Denmark", "Finland", "France", "Germany", "India", "Ireland", "Italy", "Japan", "Mexico", "Netherlands", "New Zealand", "Norway", "Poland", "Portugal", "Singapore", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "United Kingdom", "United States"];
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function Long() {
  return (
    <Field id="billing-country">
      <Label>Country</Label>
      <Listbox defaultValue="new-zealand">
        <For each={countries}>{(country) => <ListboxOption value={slug(country)}>{country}</ListboxOption>}</For>
      </Listbox>
    </Field>
  );
}
