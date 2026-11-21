import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownMenu, Navbar, NavbarDivider, NavbarItem, NavbarSection, NavbarSpacer } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

export default function App() {
  // A click on a page makes it the current one instead of following it, so the bar can be seen to glide. An app sets
  // current from its router.
  const [at, setAt] = createSignal("#home");
  const choose = (event: MouseEvent) => {
    event.preventDefault();
    setAt((event.currentTarget as HTMLAnchorElement).getAttribute("href")!);
  };
  return (
    <Navbar aria-label="Main">
      <Dropdown id="app-team">
        <DropdownButton>
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 2.5l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" /></svg>
          {" "}Spring Studio{" "}
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8l4 4 4-4" /></svg>
        </DropdownButton>
        <DropdownMenu>
          <DropdownItem href="#team-settings">Team settings</DropdownItem>
          <DropdownDivider />
          <DropdownItem>Spring Studio</DropdownItem>
          <DropdownItem>Northwind Bakery</DropdownItem>
          <DropdownDivider />
          <DropdownItem>New team…</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <NavbarDivider />
      <NavbarSection>
        <NavbarItem href="#home" current={at() === "#home"} onClick={choose}>
          Home
        </NavbarItem>
        <NavbarItem href="#sites" current={at() === "#sites"} onClick={choose}>
          Sites
        </NavbarItem>
        <NavbarItem href="#forms" current={at() === "#forms"} onClick={choose}>
          Forms
        </NavbarItem>
        <NavbarItem href="#billing" current={at() === "#billing"} onClick={choose}>
          Billing
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="#search" aria-label="Search">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="M13 13l4 4" /></svg>
        </NavbarItem>
        <NavbarItem href="#inbox" aria-label="Inbox">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l2.5-6.5h9L17 11v4.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 11h4l1 2h4l1-2h4" /></svg>
        </NavbarItem>
        <Dropdown id="app-account">
          <DropdownButton aria-label="Account">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><circle cx="10" cy="8" r="2.5" /><path d="M5 15.5c1.2-1.8 3-2.7 5-2.7s3.8.9 5 2.7" /></svg>
          </DropdownButton>
          <DropdownMenu anchor="bottom end">
            <DropdownItem href="#profile">Profile</DropdownItem>
            <DropdownItem href="#preferences">Preferences</DropdownItem>
            <DropdownDivider />
            <DropdownItem>Sign out</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarSection>
    </Navbar>
  );
}
