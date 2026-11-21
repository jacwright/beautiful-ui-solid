import { Button, ButtonGroup, Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "beautiful-ui-solid";

export default function Split() {
  return (
    <ButtonGroup aria-label="Publish">
      <Button variant="primary" color="accent">
        Publish
      </Button>
      <Dropdown id="publish-options">
        <DropdownButton variant="primary" color="accent" aria-label="More ways to publish" data-icon-button="">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 8l4 4 4-4" />
          </svg>
        </DropdownButton>
        <DropdownMenu>
          <DropdownItem>Schedule for later</DropdownItem>
          <DropdownItem>Publish to preview only</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  );
}
