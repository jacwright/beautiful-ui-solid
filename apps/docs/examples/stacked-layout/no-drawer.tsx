import { Heading, Navbar, NavbarItem, NavbarSpacer, StackedLayout, Text } from "beautiful-ui-solid";

export default function NoDrawer() {
  return (
    <StackedLayout
      id="settings"
      navbar={
        <Navbar aria-label="Main">
          <NavbarItem href="#account">Account</NavbarItem>
          <NavbarItem href="#teams" current>
            Teams
          </NavbarItem>
          <NavbarItem href="#billing">Billing</NavbarItem>
          <NavbarSpacer />
          <NavbarItem href="#sign-out">Sign out</NavbarItem>
        </Navbar>
      }
    >
      <Heading>Teams</Heading>
      <Text>You're in two teams. A team shares its sites, its numbers and its bill.</Text>
      <dl>
        <dt>Spring Studio</dt>
        <dd>Owner · 4 people</dd>
        <dt>Northwind Bakery</dt>
        <dd>Editor · 2 people</dd>
      </dl>
    </StackedLayout>
  );
}
