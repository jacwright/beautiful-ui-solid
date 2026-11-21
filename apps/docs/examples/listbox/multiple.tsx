import { Field, Label, Listbox, ListboxOption } from "beautiful-ui-solid";

export default function Multiple() {
  return (
    <Field id="email-topics">
      <Label>Email me about</Label>
      <Listbox multiple defaultValue={["payments", "disputes"]}>
        <ListboxOption value="payments">Payments</ListboxOption>
        <ListboxOption value="refunds">Refunds</ListboxOption>
        <ListboxOption value="disputes">Disputes</ListboxOption>
        <ListboxOption value="payouts">Payouts</ListboxOption>
        <ListboxOption value="failed">Failed payments</ListboxOption>
        <ListboxOption value="summary">Weekly summary</ListboxOption>
      </Listbox>
    </Field>
  );
}
