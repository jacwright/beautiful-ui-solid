import { Checkbox, Field, Fieldset, Label, Legend } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

const pages = [
  { value: "home", label: "Home" },
  { value: "pricing", label: "Pricing" },
  { value: "blog", label: "Blog" },
];

export default function SelectAll() {
  // The pages that are on. The "all" box is on when every page is, and mixed when only some are.
  const [picked, setPicked] = createSignal(["home", "pricing"]);
  const toggle = (value: string, checked: boolean) =>
    setPicked((now) => (checked ? [...now, value] : now.filter((other) => other !== value)));
  const all = () => picked().length === pages.length;
  const some = () => picked().length > 0 && !all();

  return (
    <Fieldset id="publish-pages">
      <Legend>Pages to publish</Legend>
      <Field id="publish-all">
        <Checkbox
          aria-controls={pages.map((page) => `publish-${page.value}`).join(" ")}
          checked={all()}
          indeterminate={some()}
          onChange={(event) => setPicked(event.currentTarget.checked ? pages.map((page) => page.value) : [])}
        />
        <Label>All changed pages</Label>
      </Field>
      <For each={pages}>
        {(page) => (
          <Field id={`publish-${page.value}`}>
            <Checkbox
              name="page"
              value={page.value}
              checked={picked().includes(page.value)}
              onChange={(event) => toggle(page.value, event.currentTarget.checked)}
            />
            <Label>{page.label}</Label>
          </Field>
        )}
      </For>
    </Fieldset>
  );
}
