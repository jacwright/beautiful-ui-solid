import { Button, Chip, ChipGroup } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

const tagNames = ["Landing page", "Spring sale", "Newsletter", "Draft copy"];

/** Removing for real: try the keys and watch where focus goes. */
export default function Removing() {
  const [tags, setTags] = createSignal(tagNames);
  return (
    <>
      <ChipGroup aria-label="Tags you can remove">
        <For each={tags()}>
          {(tag) => (
            <Chip color="blue" onRemove={() => setTags(tags().filter((t) => t !== tag))}>
              {tag}
            </Chip>
          )}
        </For>
      </ChipGroup>
      <Button variant="tertiary" onClick={() => setTags(tagNames)}>
        Put them back
      </Button>
    </>
  );
}
