import { Combobox, ComboboxDescription, ComboboxOption, Field, Label } from "beautiful-ui-solid";

export default function Icons() {
  return (
    <Field id="expense-category">
      <Label>Category</Label>
      <Combobox placeholder="Search categories">
        <ComboboxOption value="travel">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 17 5l-4 12-3-5-7-.5zM10 12l7-7" /></svg>
          Travel
          <ComboboxDescription>Flights, trains, hotels.</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="meals">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v5a2 2 0 0 0 4 0V3M8 8v9M14 17V3c-1.7 1-2.5 3-2.5 5.5S12.3 11 14 11" /></svg>
          Meals
          <ComboboxDescription>Food with clients or on the road.</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="software">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM7 17h6M10 14v3" /></svg>
          Software
          <ComboboxDescription>Subscriptions and licenses.</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="hardware">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5h10v7H5zM3 15h14" /></svg>
          Hardware
          <ComboboxDescription>Laptops, phones, screens.</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="office">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12M12 9h3a1 1 0 0 1 1 1v7M3 17h14M7 7h2M7 10h2M7 13h2" /></svg>
          Office
          <ComboboxDescription>Rent, desks, supplies.</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="marketing">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8v4h3l6 4V4L7 8H4zM15.5 7.5a3.5 3.5 0 0 1 0 5" /></svg>
          Marketing
          <ComboboxDescription>Ads, events, sponsorships.</ComboboxDescription>
        </ComboboxOption>
      </Combobox>
    </Field>
  );
}
