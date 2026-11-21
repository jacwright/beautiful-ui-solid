import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownMenu } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Dropdown id="lead-launch-options">
      <DropdownButton>
        Options{" "}
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8l4 4 4-4" /></svg>
      </DropdownButton>
      <DropdownMenu>
        <DropdownItem shortcut="E">Edit</DropdownItem>
        <DropdownItem shortcut="D">Duplicate</DropdownItem>
        <DropdownItem shortcut="S">Share</DropdownItem>
        <DropdownDivider />
        <DropdownItem color="danger" shortcut="X">Delete</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
