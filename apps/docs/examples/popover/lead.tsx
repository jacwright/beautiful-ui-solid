import { Popover, PopoverButton, PopoverPanel, Text } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Popover id="lead-launch-details">
      <PopoverButton>Details</PopoverButton>
      <PopoverPanel>
        <Text>
          <strong>Published 2 hours ago</strong>
        </Text>
        <Text tone="muted">3 pages, 14 images and one form. 1,284 visits since it went live.</Text>
      </PopoverPanel>
    </Popover>
  );
}
