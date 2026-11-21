import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  Heading,
  Navbar,
  NavbarItem,
  NavbarSpacer,
  StackedLayout,
  Text,
} from "beautiful-ui-solid";

export default function Lead() {
  return (
    <StackedLayout
      id="lead-settings"
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
      <DescriptionList>
        <DescriptionTerm>Spring Studio</DescriptionTerm>
        <DescriptionDetails>Owner · 4 people</DescriptionDetails>
        <DescriptionTerm>Northwind Bakery</DescriptionTerm>
        <DescriptionDetails>Editor · 2 people</DescriptionDetails>
      </DescriptionList>
    </StackedLayout>
  );
}
