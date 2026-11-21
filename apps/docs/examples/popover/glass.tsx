import { Popover, PopoverButton, PopoverPanel, Text } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <Popover id="launch-details">
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <PopoverButton>Details</PopoverButton>
      </beautiful-demo-stage>
      <PopoverPanel>
        <p>
          <strong>Published 2 hours ago</strong>
        </p>
        <Text tone="muted">3 pages, 14 images and one form. 1,284 visits since it went live.</Text>
      </PopoverPanel>
    </Popover>
  );
}
