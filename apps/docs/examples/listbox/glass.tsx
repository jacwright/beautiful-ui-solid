import { Listbox, ListboxOption } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <Listbox id="site-region" aria-label="Region" defaultValue="eu">
        <ListboxOption value="us-east">US East</ListboxOption>
        <ListboxOption value="us-west">US West</ListboxOption>
        <ListboxOption value="eu">Europe</ListboxOption>
        <ListboxOption value="apac">Asia Pacific</ListboxOption>
      </Listbox>
    </beautiful-demo-stage>
  );
}
