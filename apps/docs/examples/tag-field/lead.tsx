import { type ChipColor, Field, Label, TagField, TagFieldOption } from "beautiful-ui-solid";
import { For } from "solid-js";

const labels: [value: string, name: string, color: ChipColor][] = [
  ["launch", "Launch", "purple"],
  ["landing", "Landing page", "blue"],
  ["sale", "Spring sale", "green"],
  ["newsletter", "Newsletter", "orange"],
  ["blog", "Blog", "teal"],
];

/** The field alone, with two labels in it. */
export default function Lead() {
  return (
    <Field>
      <Label>Tags</Label>
      <TagField defaultValue={["launch", "landing"]} create placeholder="Add tags">
        <For each={labels}>
          {([value, name, color]) => (
            <TagFieldOption value={value} color={color}>
              {name}
            </TagFieldOption>
          )}
        </For>
      </TagField>
    </Field>
  );
}
