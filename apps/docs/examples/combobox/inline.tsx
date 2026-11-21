import { Combobox, ComboboxDescription, ComboboxOption, Field, Label } from "beautiful-ui-solid";

export default function Inline() {
  return (
    <Field id="review-assignee">
      <Label>Assigned to</Label>
      <Combobox defaultValue="tom" descriptions="inline">
        <ComboboxOption value="tom">
          Tom Cook
          <ComboboxDescription>@tomcook</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="wade">
          Wade Cooper
          <ComboboxDescription>@wadecooper</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="tanya">
          Tanya Fox
          <ComboboxDescription>@tanyafox</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="arlene">
          Arlene McCoy
          <ComboboxDescription>@arlenemccoy</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="devon">
          Devon Webb
          <ComboboxDescription>@devonwebb</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="lawrence">
          Lawrence Hunter
          <ComboboxDescription>@lawrencehunter</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="yvette">
          Yvette Armstrong
          <ComboboxDescription>@yvettearmstrong</ComboboxDescription>
        </ComboboxOption>
        <ComboboxOption value="angela">
          Angela Fisher
          <ComboboxDescription>@angelafisher</ComboboxDescription>
        </ComboboxOption>
      </Combobox>
    </Field>
  );
}
