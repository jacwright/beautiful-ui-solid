import { ToggleGroup, ToggleGroupItem } from "beautiful-ui-solid";

export default function Fill() {
  return (
    <ToggleGroup aria-label="Billing" fill defaultValue="yearly">
      <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
      <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
    </ToggleGroup>
  );
}
