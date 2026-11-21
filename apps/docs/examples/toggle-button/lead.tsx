import { ToggleButton } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <beautiful-demo-row>
      <ToggleButton defaultPressed>Show drafts</ToggleButton>
      <ToggleButton>Show archived</ToggleButton>
    </beautiful-demo-row>
  );
}
