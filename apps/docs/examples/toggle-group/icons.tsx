import { ToggleGroup, ToggleGroupItem } from "beautiful-ui-solid";

export default function Icons() {
  return (
    <ToggleGroup aria-label="Layout" defaultValue="grid">
      <ToggleGroupItem value="grid">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 3.5h5v5h-5zM11.5 3.5h5v5h-5zM3.5 11.5h5v5h-5zM11.5 11.5h5v5h-5z" /></svg>
        Grid
      </ToggleGroupItem>
      <ToggleGroupItem value="list">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M7 5h10M7 10h10M7 15h10M3.5 5h.01M3.5 10h.01M3.5 15h.01" /></svg>
        List
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
