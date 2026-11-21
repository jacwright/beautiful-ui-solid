import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Combobox, ComboboxOption, Field, Label } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then two blocks no example covers: a form that sends, checks and resets its fields and logs what
// changed, and a field whose page filters the options itself, as a search on a server would.

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

const countries: [string, string][] = [
  ["ar", "Argentina"], ["au", "Australia"], ["at", "Austria"], ["be", "Belgium"], ["br", "Brazil"], ["ca", "Canada"],
  ["cl", "Chile"], ["ci", "Côte d’Ivoire"], ["dk", "Denmark"], ["fi", "Finland"], ["fr", "France"], ["de", "Germany"],
  ["in", "India"], ["ie", "Ireland"], ["it", "Italy"], ["jp", "Japan"], ["mx", "Mexico"], ["nl", "Netherlands"],
  ["nz", "New Zealand"], ["no", "Norway"], ["pl", "Poland"], ["pt", "Portugal"], ["sg", "Singapore"], ["za", "South Africa"],
  ["kr", "South Korea"], ["es", "Spain"], ["se", "Sweden"], ["ch", "Switzerland"], ["gb", "United Kingdom"], ["us", "United States"],
];

function FormExample() {
  const [log, setLog] = createSignal<string[]>([]);
  const note = (entry: string) => setLog((all) => [...all, entry]);
  const [owner, setOwner] = createSignal("ada");
  return (
    <beautiful-example data-example="form">
      <p id="log">{log().join(" | ")}</p>
      <form
        id="form"
        class="demo-form"
        onSubmit={(event) => {
          event.preventDefault();
          note(`sent ${new URLSearchParams(new FormData(event.currentTarget) as never).toString()}`);
        }}
      >
        <Field id="plan">
          <Label>Plan</Label>
          <Combobox name="plan" required placeholder="Search plans" onChange={(value) => note(`plan ${value}`)}>
            <ComboboxOption value="hobby">Hobby</ComboboxOption>
            <ComboboxOption value="pro">Pro</ComboboxOption>
            <ComboboxOption value="team">Team</ComboboxOption>
          </Combobox>
        </Field>
        <Field id="region">
          <Label>Region</Label>
          <Combobox name="region" defaultValue="eu" onChange={(value) => note(`region ${value}`)}>
            <ComboboxOption value="us">US</ComboboxOption>
            <ComboboxOption value="eu">Europe</ComboboxOption>
          </Combobox>
        </Field>
        <Field id="owner">
          <Label>Owner</Label>
          <Combobox
            name="owner"
            value={owner()}
            onChange={(value) => {
              note(`owner ${value}`);
              // Radia is away: the page turns her down and keeps the owner it had.
              if (value !== "radia") setOwner(value);
            }}
          >
            <For each={people}>{([value, name]) => <ComboboxOption value={value}>{name}</ComboboxOption>}</For>
          </Combobox>
        </Field>
        <footer>
          <Button type="button" id="set-owner" onClick={() => setOwner("grace")}>
            Grace owns it
          </Button>
          <Button type="reset">Reset</Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </footer>
      </form>
    </beautiful-example>
  );
}

/** A field whose page filters: it shows only what the "server" found for the typed text. */
function SearchExample() {
  const [query, setQuery] = createSignal("");
  const [customer, setCustomer] = createSignal("");
  const found = () => (query() ? countries.filter(([, name]) => name.toLowerCase().startsWith(query().toLowerCase())) : countries.slice(0, 5));
  return (
    <beautiful-example data-example="search">
      <p id="search-value">{customer()}</p>
      <Field id="customer">
        <Label>Customer</Label>
        <Combobox filter={false} onQuery={setQuery} value={customer()} onChange={setCustomer}>
          <For each={found()}>{([value, name]) => <ComboboxOption value={value}>{name}</ComboboxOption>}</For>
        </Combobox>
      </Field>
    </beautiful-example>
  );
}

renderHarness("combobox", () => (
  <>
    <FormExample />
    <SearchExample />
  </>
));
