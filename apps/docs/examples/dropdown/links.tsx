import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownMenu } from "beautiful-ui-solid";

export default function Links() {
  return (
    <beautiful-demo-row>
      <p>Spring launch</p>
      <Dropdown id="row-actions">
        <DropdownButton aria-label="More actions" variant="tertiary" data-icon-button="">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><circle cx="4.5" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="15.5" cy="10" r="1.5" /></svg>
        </DropdownButton>
        <DropdownMenu anchor="bottom end">
          <DropdownItem href="#view-site">View site</DropdownItem>
          <DropdownItem href="#site-settings">Settings</DropdownItem>
          <DropdownItem>Copy link</DropdownItem>
          <DropdownDivider />
          <DropdownItem color="danger">Delete</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </beautiful-demo-row>
  );
}
