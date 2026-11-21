import { ToggleGroup, ToggleGroupItem } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <beautiful-demo-row>
        <ToggleGroup aria-label="Period" defaultValue="week">
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup aria-label="Text style" multiple defaultValue={["bold", "italic"]}>
          <ToggleGroupItem value="bold" icon aria-label="Bold">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h5a3 3 0 0 1 0 6H6zM6 10h6a3 3 0 0 1 0 6H6z" /></svg>
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" icon aria-label="Italic">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4h6M5 16h6M12 4l-4 12" /></svg>
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" icon aria-label="Underline">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v6a4 4 0 0 0 8 0V3M4 17h12" /></svg>
          </ToggleGroupItem>
        </ToggleGroup>
      </beautiful-demo-row>
    </beautiful-demo-stage>
  );
}
