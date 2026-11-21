import { Heading, Sidebar, SidebarBody, SidebarItem, SidebarLayout, Text } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <SidebarLayout
      id="lead-site"
      sidebar={
        <Sidebar aria-label="Main">
          <SidebarBody>
            <SidebarItem href="#lead-home">Home</SidebarItem>
            <SidebarItem href="#lead-sites" current>
              Sites
            </SidebarItem>
            <SidebarItem href="#lead-settings">Settings</SidebarItem>
          </SidebarBody>
        </Sidebar>
      }
    >
      <Heading>Sites</Heading>
      <Text>Spring launch and Northwind Bakery, both live.</Text>
    </SidebarLayout>
  );
}
