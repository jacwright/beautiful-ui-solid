import { Navbar, NavbarItem } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Navbar aria-label="Account">
      <NavbarItem href="#lead-profile" current>
        Profile
      </NavbarItem>
      <NavbarItem href="#lead-teams">Teams</NavbarItem>
      <NavbarItem href="#lead-security">Security</NavbarItem>
      <NavbarItem href="#lead-billing">Billing</NavbarItem>
    </Navbar>
  );
}
