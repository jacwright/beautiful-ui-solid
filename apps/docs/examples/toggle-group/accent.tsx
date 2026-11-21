import { ToggleGroup, ToggleGroupItem } from "beautiful-ui-solid";

export default function Accent() {
  return (
    <ToggleGroup aria-label="Chart" color="accent" defaultValue="visitors">
      <ToggleGroupItem value="visitors">Visitors</ToggleGroupItem>
      <ToggleGroupItem value="views">Page views</ToggleGroupItem>
      <ToggleGroupItem value="revenue">Revenue</ToggleGroupItem>
    </ToggleGroup>
  );
}
