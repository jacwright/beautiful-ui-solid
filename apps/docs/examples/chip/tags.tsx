import { Chip, ChipGroup } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

export default function Tags() {
  const [tags, setTags] = createSignal([
    { name: "Landing page", color: "blue" },
    { name: "Spring sale", color: "green" },
    { name: "Newsletter", color: "purple" },
    { name: "Draft copy", color: "neutral" },
  ] as const);
  return (
    <ChipGroup aria-label="Tags">
      <For each={tags()}>
        {(tag) => (
          <Chip color={tag.color} onRemove={() => setTags(tags().filter((t) => t !== tag))}>
            {tag.name}
          </Chip>
        )}
      </For>
    </ChipGroup>
  );
}
