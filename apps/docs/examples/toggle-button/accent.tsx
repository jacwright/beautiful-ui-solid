import { ToggleButton } from "beautiful-ui-solid";

export default function Accent() {
  return (
    <beautiful-demo-row>
      <ToggleButton defaultPressed color="accent">
        Live preview
      </ToggleButton>
      <ToggleButton color="accent">Live preview</ToggleButton>
    </beautiful-demo-row>
  );
}
