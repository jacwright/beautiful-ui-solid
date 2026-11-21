import { ToggleGroup, ToggleGroupItem } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <ToggleGroup aria-label="View" defaultValue="list">
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
    </ToggleGroup>
  );
}
