import { Description, ErrorMessage, Field, Label, Listbox, ListboxOption } from "beautiful-ui-solid";

export default function States() {
  return (
    <form>
      <Field id="payout-currency">
        <Label>Payout currency</Label>
        <Listbox placeholder="Pick a currency">
          <ListboxOption value="aud">Australian dollar</ListboxOption>
          <ListboxOption value="eur">Euro</ListboxOption>
          <ListboxOption value="gbp">Pound sterling</ListboxOption>
          <ListboxOption value="usd">US dollar</ListboxOption>
        </Listbox>
        <ErrorMessage>Pick the currency your bank account takes.</ErrorMessage>
      </Field>
      <Field id="payout-schedule">
        <Label>Payout schedule</Label>
        <Description>Set by your plan.</Description>
        <Listbox defaultValue="weekly" disabled>
          <ListboxOption value="daily">Daily</ListboxOption>
          <ListboxOption value="weekly">Weekly</ListboxOption>
          <ListboxOption value="monthly">Monthly</ListboxOption>
        </Listbox>
      </Field>
    </form>
  );
}
