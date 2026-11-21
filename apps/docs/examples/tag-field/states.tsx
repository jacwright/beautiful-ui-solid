import { type ChipColor, ErrorMessage, Field, Label, TagField, TagFieldOption } from "beautiful-ui-solid";
import { For } from "solid-js";

const topics: [value: string, name: string, color: ChipColor][] = [
  ["launch", "Launch", "purple"],
  ["landing", "Landing page", "blue"],
  ["sale", "Spring sale", "green"],
  ["newsletter", "Newsletter", "orange"],
  ["blog", "Blog", "teal"],
  ["urgent", "Urgent", "red"],
  ["draft", "Draft copy", "neutral"],
  ["seo", "SEO", "yellow"],
  ["pricing", "Pricing", "pink"],
];

const owners: [value: string, name: string][] = [
  ["ada", "Ada Lovelace"],
  ["grace", "Grace Hopper"],
  ["katherine", "Katherine Johnson"],
  ["margaret", "Margaret Hamilton"],
  ["dorothy", "Dorothy Vaughan"],
  ["mary", "Mary Jackson"],
  ["hedy", "Hedy Lamarr"],
  ["radia", "Radia Perlman"],
];

/** Invalid and disabled. */
export default function States() {
  return (
    <beautiful-demo-stack>
      <Field id="states-topics">
        <Label>Topics</Label>
        <TagField defaultValue={["urgent"]} create>
          <For each={topics}>
            {([value, name, color]) => (
              <TagFieldOption value={value} color={color}>
                {name}
              </TagFieldOption>
            )}
          </For>
        </TagField>
        <ErrorMessage>Pick at least two topics.</ErrorMessage>
      </Field>
      <Field id="states-owners" disabled>
        <Label>Owners</Label>
        <TagField defaultValue={["ada", "grace"]}>
          <For each={owners}>{([value, name]) => <TagFieldOption value={value}>{name}</TagFieldOption>}</For>
        </TagField>
      </Field>
    </beautiful-demo-stack>
  );
}
