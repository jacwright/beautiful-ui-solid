import { Chip, ChipGroup } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";

export default function Filters() {
  const [form, setForm] = createSignal(true);
  const [dates, setDates] = createSignal(true);
  return (
    <ChipGroup aria-label="Filters">
      <Show when={form()}>
        <Chip onRemove={() => setForm(false)}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3.5 5h13M6 10h8M8.5 15h3" />
          </svg>
          Form: Contact us
        </Chip>
      </Show>
      <Show when={dates()}>
        <Chip onRemove={() => setDates(false)}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
            <path d="M3.5 8.5h13M7 3v3M13 3v3" />
          </svg>
          Last 30 days
        </Chip>
      </Show>
    </ChipGroup>
  );
}
