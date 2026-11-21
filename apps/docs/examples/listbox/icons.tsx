import { Field, Label, Listbox, ListboxDescription, ListboxOption } from "beautiful-ui-solid";

export default function Icons() {
  return (
    <Field id="site-access">
      <Label>Who can see it</Label>
      <Listbox defaultValue="team">
        <ListboxOption value="private">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V6.5a4 4 0 0 1 8 0V9M5 9h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" /></svg>
          Only me
          <ListboxDescription>Nobody else can open it.</ListboxDescription>
        </ListboxOption>
        <ListboxOption value="team">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2.5 16a5 5 0 0 1 10 0M13 4.2a2.5 2.5 0 0 1 0 4.6M15 11.5a5 5 0 0 1 2.5 4.5" /></svg>
          Team
          <ListboxDescription>Everyone on your team can open it.</ListboxDescription>
        </ListboxOption>
        <ListboxOption value="link">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.8-.8" /></svg>
          Anyone with the link
          <ListboxDescription>Not listed, and not found by search engines.</ListboxDescription>
        </ListboxOption>
        <ListboxOption value="public">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM3 10h14M10 3c1.8 2 2.7 4.3 2.7 7s-.9 5-2.7 7c-1.8-2-2.7-4.3-2.7-7S8.2 5 10 3z" /></svg>
          Public
          <ListboxDescription>Listed, and found by search engines.</ListboxDescription>
        </ListboxOption>
      </Listbox>
    </Field>
  );
}
