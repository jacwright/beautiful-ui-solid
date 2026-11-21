import { ToggleGroup, ToggleGroupItem } from "beautiful-ui-solid";

export default function Disabled() {
  return (
    <beautiful-demo-row>
      <ToggleGroup aria-label="Period" defaultValue="day">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month" disabled>
          Month
        </ToggleGroupItem>
        <ToggleGroupItem value="year">Year</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup aria-label="Period, while it loads" defaultValue="week" disabled>
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>
    </beautiful-demo-row>
  );
}
