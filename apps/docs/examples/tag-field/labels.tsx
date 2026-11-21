import { type ChipColor, Description, Field, Label, TagField, TagFieldOption } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

const labels: [value: string, name: string, color: ChipColor][] = [
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

/** Labels on a site: picked from the list, or typed new. */
export default function Labels() {
  const [chosen, setChosen] = createSignal(["launch", "landing"]);
  return (
    <beautiful-demo-stack>
      <Field id="site-labels">
        <Label>Labels</Label>
        <Description>Pick some, or type a new one and press comma.</Description>
        <TagField value={chosen()} onChange={setChosen} create placeholder="Add labels">
          <For each={labels}>
            {([value, name, color]) => (
              <TagFieldOption value={value} color={color}>
                {name}
              </TagFieldOption>
            )}
          </For>
        </TagField>
      </Field>
      <p class="demo-sent" id="site-labels-value">
        Value: {chosen().join(", ") || "none"}
      </p>
    </beautiful-demo-stack>
  );
}
