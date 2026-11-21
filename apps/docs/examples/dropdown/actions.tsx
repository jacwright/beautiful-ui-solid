import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownMenu, DropdownShortcut } from "beautiful-ui-solid";

export default function Actions() {
  return (
    <Dropdown id="site-actions">
      <DropdownButton>
        Actions{" "}
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8l4 4 4-4" /></svg>
      </DropdownButton>
      <DropdownMenu>
        <DropdownItem>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 3.5l3 3L7 16H4v-3z" /></svg>
          {" "}Rename <DropdownShortcut>⌘R</DropdownShortcut>
        </DropdownItem>
        <DropdownItem>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7V4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5v7a1.5 1.5 0 0 1-1.5 1.5H13M3 8.5A1.5 1.5 0 0 1 4.5 7h7A1.5 1.5 0 0 1 13 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 15.5z" /></svg>
          {" "}Duplicate <DropdownShortcut>⌘D</DropdownShortcut>
        </DropdownItem>
        <DropdownItem>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-6L8.5 5H4a1 1 0 0 0-1 1zM8 11.5h5M11 9.5l2 2-2 2" /></svg>
          {" "}Move to folder
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem disabled>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l14 14M8.6 8.6a2 2 0 0 0 2.8 2.8M6 6.2C4.4 7.2 3.2 8.6 2.5 10c1.2 2.5 4 5 7.5 5 1.4 0 2.7-.4 3.8-1M8.5 5.1A7 7 0 0 1 10 5c3.5 0 6.3 2.5 7.5 5-.4.8-1 1.7-1.8 2.5" /></svg>
          {" "}Unpublish
        </DropdownItem>
        <DropdownItem color="danger">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h12M8 6V4.5h4V6M5.5 6l.7 9.6a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4L14.5 6" /></svg>
          {" "}Delete <DropdownShortcut>⌘⌫</DropdownShortcut>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
