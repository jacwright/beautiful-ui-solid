import { ToggleButton } from "beautiful-ui-solid";

export default function Disabled() {
  return (
    <beautiful-demo-row>
      <ToggleButton defaultPressed disabled>
        Show drafts
      </ToggleButton>
      <ToggleButton disabled>Show archived</ToggleButton>
    </beautiful-demo-row>
  );
}
