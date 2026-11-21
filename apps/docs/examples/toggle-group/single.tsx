import { ToggleGroup, ToggleGroupItem } from "beautiful-ui-solid";

export default function Single() {
  return (
    <ToggleGroup aria-label="Period" defaultValue="week">
      <ToggleGroupItem value="day">Day</ToggleGroupItem>
      <ToggleGroupItem value="week">Week</ToggleGroupItem>
      <ToggleGroupItem value="month">Month</ToggleGroupItem>
      <ToggleGroupItem value="year">Year</ToggleGroupItem>
    </ToggleGroup>
  );
}
