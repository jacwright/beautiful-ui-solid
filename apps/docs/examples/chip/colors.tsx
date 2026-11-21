import { Chip, ChipGroup } from "beautiful-ui-solid";
import { For } from "solid-js";

const colors = ["neutral", "accent", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"] as const;

export default function Colors() {
  return (
    <ChipGroup aria-label="Every color">
      <For each={colors}>{(color) => <Chip color={color}>{color[0]!.toUpperCase() + color.slice(1)}</Chip>}</For>
    </ChipGroup>
  );
}
