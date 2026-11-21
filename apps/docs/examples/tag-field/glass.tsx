import { type ChipColor, TagField, TagFieldOption } from "beautiful-ui-solid";
import { For } from "solid-js";

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

/** Many tags, on the bright stage, so they wrap and the glass shows. */
export default function Glass() {
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <TagField id="stage-labels" aria-label="Labels" defaultValue={["launch", "landing", "sale", "newsletter", "blog", "seo"]} create>
        <For each={labels}>
          {([value, name, color]) => (
            <TagFieldOption value={value} color={color}>
              {name}
            </TagFieldOption>
          )}
        </For>
      </TagField>
    </beautiful-demo-stage>
  );
}
