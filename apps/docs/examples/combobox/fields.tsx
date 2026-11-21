import { Combobox, ComboboxOption, Description, Field, Label } from "beautiful-ui-solid";
import { For } from "solid-js";

// Hedy Lamarr is away: the field lists her, and she can't be picked.
const people = [
  ["ada", "Ada Lovelace"],
  ["grace", "Grace Hopper"],
  ["katherine", "Katherine Johnson"],
  ["margaret", "Margaret Hamilton"],
  ["hedy", "Hedy Lamarr"],
  ["dorothy", "Dorothy Vaughan"],
  ["mary", "Mary Jackson"],
] as const;

const countries: [string, string][] = [
  ["ar", "Argentina"], ["au", "Australia"], ["at", "Austria"], ["be", "Belgium"], ["br", "Brazil"], ["ca", "Canada"],
  ["cl", "Chile"], ["ci", "Côte d’Ivoire"], ["dk", "Denmark"], ["fi", "Finland"], ["fr", "France"], ["de", "Germany"],
  ["in", "India"], ["ie", "Ireland"], ["it", "Italy"], ["jp", "Japan"], ["mx", "Mexico"], ["nl", "Netherlands"],
  ["nz", "New Zealand"], ["no", "Norway"], ["pl", "Poland"], ["pt", "Portugal"], ["sg", "Singapore"], ["za", "South Africa"],
  ["kr", "South Korea"], ["es", "Spain"], ["se", "Sweden"], ["ch", "Switzerland"], ["gb", "United Kingdom"], ["us", "United States"],
];

export default function Fields() {
  return (
    <form>
      <Field id="billing-country">
        <Label>Country</Label>
        <Combobox defaultValue="ca">
          <For each={countries}>{([value, name]) => <ComboboxOption value={value}>{name}</ComboboxOption>}</For>
        </Combobox>
      </Field>
      <Field id="invoice-owner">
        <Label>Owner</Label>
        <Description>They hear when it's paid or overdue.</Description>
        <Combobox placeholder="Search your team">
          <For each={people}>
            {([value, name]) => (
              <ComboboxOption value={value} disabled={value === "hedy"}>
                {name}
              </ComboboxOption>
            )}
          </For>
        </Combobox>
      </Field>
    </form>
  );
}
