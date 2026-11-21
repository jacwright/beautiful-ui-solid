import { Description, Field, Label, Listbox, ListboxOption } from "beautiful-ui-solid";

export default function Fields() {
  return (
    <form>
      <Field id="invoice-status">
        <Label>Status</Label>
        <Listbox defaultValue="paid">
          <ListboxOption value="draft">Draft</ListboxOption>
          <ListboxOption value="sent">Sent</ListboxOption>
          <ListboxOption value="paid">Paid</ListboxOption>
          <ListboxOption value="overdue">Overdue</ListboxOption>
          <ListboxOption value="void" disabled>
            Void
          </ListboxOption>
        </Listbox>
      </Field>
      <Field id="invoice-owner">
        <Label>Owner</Label>
        <Description>They hear when it's paid or overdue.</Description>
        <Listbox placeholder="Pick a teammate">
          <ListboxOption value="ada">Ada Lovelace</ListboxOption>
          <ListboxOption value="grace">Grace Hopper</ListboxOption>
          <ListboxOption value="katherine">Katherine Johnson</ListboxOption>
          <ListboxOption value="margaret">Margaret Hamilton</ListboxOption>
        </Listbox>
      </Field>
    </form>
  );
}
