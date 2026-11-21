import { Combobox, ComboboxOption, Description, ErrorMessage, Field, Label } from "beautiful-ui-solid";

export default function States() {
  return (
    <form>
      <Field id="payout-currency">
        <Label>Payout currency</Label>
        <Combobox placeholder="Search currencies">
          <ComboboxOption value="aud">Australian dollar</ComboboxOption>
          <ComboboxOption value="cad">Canadian dollar</ComboboxOption>
          <ComboboxOption value="eur">Euro</ComboboxOption>
          <ComboboxOption value="gbp">Pound sterling</ComboboxOption>
          <ComboboxOption value="jpy">Japanese yen</ComboboxOption>
          <ComboboxOption value="usd">US dollar</ComboboxOption>
        </Combobox>
        <ErrorMessage>Pick the currency your bank account takes.</ErrorMessage>
      </Field>
      <Field id="payout-timezone">
        <Label>Time zone</Label>
        <Description>Set by your team's settings.</Description>
        <Combobox defaultValue="new-york" disabled>
          <ComboboxOption value="utc">UTC</ComboboxOption>
          <ComboboxOption value="new-york">New York</ComboboxOption>
          <ComboboxOption value="london">London</ComboboxOption>
          <ComboboxOption value="tokyo">Tokyo</ComboboxOption>
        </Combobox>
      </Field>
    </form>
  );
}
