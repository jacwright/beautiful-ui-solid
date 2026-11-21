import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
  Heading,
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
  Sidebar,
  SidebarBody,
  SidebarItem,
  StackedLayout,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "beautiful-ui-solid";

export default function App() {
  return (
    <StackedLayout
      id="studio"
      navbar={
        <Navbar aria-label="Main">
          <Dropdown id="studio-team">
            <DropdownButton>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <defs>
                  <linearGradient id="studio-logo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#8b5cf6" />
                    <stop offset="1" stop-color="#ec4899" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="16" height="16" rx="4" fill="url(#studio-logo)" />
              </svg>{" "}
              Spring Studio{" "}
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8l4 4 4-4" /></svg>
            </DropdownButton>
            <DropdownMenu>
              <DropdownItem href="#team-settings">Team settings</DropdownItem>
              <DropdownDivider />
              <DropdownItem>Spring Studio</DropdownItem>
              <DropdownItem>Northwind Bakery</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <NavbarDivider />
          <NavbarSection data-collapse="">
            <NavbarItem href="#home">Home</NavbarItem>
            <NavbarItem href="#sites" current>Sites</NavbarItem>
            <NavbarItem href="#forms">Forms</NavbarItem>
            <NavbarItem href="#billing">Billing</NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="#search" aria-label="Search">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="M13 13l4 4" /></svg>
            </NavbarItem>
            <Dropdown id="studio-account">
              <DropdownButton aria-label="Account">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><circle cx="10" cy="8" r="2.5" /><path d="M5 15.5c1.2-1.8 3-2.7 5-2.7s3.8.9 5 2.7" /></svg>
              </DropdownButton>
              <DropdownMenu anchor="bottom end">
                <DropdownItem href="#profile">Profile</DropdownItem>
                <DropdownDivider />
                <DropdownItem>Sign out</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar aria-label="Main">
          <SidebarBody>
            <SidebarItem href="#home">Home</SidebarItem>
            <SidebarItem href="#sites" current>Sites</SidebarItem>
            <SidebarItem href="#forms">Forms</SidebarItem>
            <SidebarItem href="#billing">Billing</SidebarItem>
          </SidebarBody>
        </Sidebar>
      }
    >
      <Heading>Sites</Heading>
      <Text>Three sites, all live. Spring launch had the most visitors this week.</Text>
      <Table>
        <caption>Your sites</caption>
        <TableHead>
          <TableRow>
            <TableHeader>Site</TableHeader>
            <TableHeader align="end">Visitors, 7 days</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Spring launch</TableCell>
            <TableCell align="end">12,408</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Corner bakery menu</TableCell>
            <TableCell align="end">3,190</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Portfolio</TableCell>
            <TableCell align="end">842</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </StackedLayout>
  );
}
