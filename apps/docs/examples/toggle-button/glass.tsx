import { ToggleButton } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <beautiful-demo-row role="group" aria-label="Editor view">
        <ToggleButton defaultPressed>Grid</ToggleButton>
        <ToggleButton>Outlines</ToggleButton>
        <ToggleButton defaultPressed color="accent">
          Live preview
        </ToggleButton>
        <ToggleButton variant="tertiary">Spellcheck</ToggleButton>
      </beautiful-demo-row>
    </beautiful-demo-stage>
  );
}
