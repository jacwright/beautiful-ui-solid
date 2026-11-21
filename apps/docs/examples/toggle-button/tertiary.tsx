import { ToggleButton } from "beautiful-ui-solid";

export default function Tertiary() {
  return (
    <beautiful-demo-row role="group" aria-label="Editor view">
      <ToggleButton defaultPressed variant="tertiary">
        Grid
      </ToggleButton>
      <ToggleButton variant="tertiary">Outlines</ToggleButton>
      <ToggleButton variant="tertiary">Spellcheck</ToggleButton>
    </beautiful-demo-row>
  );
}
