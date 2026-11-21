import { Dropdown, DropdownButton, DropdownDescription, DropdownDivider, DropdownHeading, DropdownItem, DropdownMenu, DropdownSection } from "beautiful-ui-solid";

export default function Sections() {
  return (
    <Dropdown id="new-menu">
      <DropdownButton variant="primary" color="accent">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
        {" "}New
      </DropdownButton>
      <DropdownMenu>
        <DropdownSection>
          <DropdownHeading id="new-menu-pages">Pages</DropdownHeading>
          <DropdownItem>
            Blank page <DropdownDescription>Start from nothing.</DropdownDescription>
          </DropdownItem>
          <DropdownItem>
            Landing page <DropdownDescription>A headline, three features and a sign-up form.</DropdownDescription>
          </DropdownItem>
        </DropdownSection>
        <DropdownDivider />
        <DropdownSection>
          <DropdownHeading id="new-menu-sites">Sites</DropdownHeading>
          <DropdownItem>
            Import a site <DropdownDescription>From WordPress, Squarespace or a folder.</DropdownDescription>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
