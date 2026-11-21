import { ToggleButton } from "beautiful-ui-solid";

export default function Icons() {
  return (
    <beautiful-demo-row>
      <ToggleButton defaultPressed>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M10 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7L10 13.8 5.8 16l.8-4.7L3.2 8l4.7-.7z" /></svg>
        Favorite
      </ToggleButton>
      <ToggleButton>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4c-3.5 0-6.3 2.5-7.5 6 1.2 3.5 4 6 7.5 6s6.3-2.5 7.5-6c-1.2-3.5-4-6-7.5-6zM10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></svg>
        Watch for changes
      </ToggleButton>
    </beautiful-demo-row>
  );
}
