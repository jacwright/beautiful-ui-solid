import { Listbox, ListboxOption } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Listbox id="lead-language" aria-label="Language" defaultValue="en">
      <ListboxOption value="en">English</ListboxOption>
      <ListboxOption value="fr">French</ListboxOption>
      <ListboxOption value="de">German</ListboxOption>
      <ListboxOption value="es">Spanish</ListboxOption>
    </Listbox>
  );
}
