import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
  Heading,
  Navbar,
  NavbarSpacer,
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLayout,
  SidebarSection,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "beautiful-ui-solid";

/**
 * The app's Sidebar. The layout builds it twice, once beside the content and once in the drawer,
 * so its ids start with p, which differs between the copies.
 */
function StudioSidebar(props: { p: string }) {
  const p = props.p;
  return (
    <Sidebar aria-label="Main">
      <SidebarHeader>
        <Dropdown id={`${p}-team`}>
          <DropdownButton>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <defs>
                <linearGradient id={`${p}-logo`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#8b5cf6" />
                  <stop offset="1" stop-color="#ec4899" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="16" height="16" rx="4" fill={`url(#${p}-logo)`} />
            </svg> Spring Studio{" "}
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 8l4 4 4-4" />
            </svg>
          </DropdownButton>
          <DropdownMenu>
            <DropdownItem href="#team-settings">Team settings</DropdownItem>
            <DropdownDivider />
            <DropdownItem>Spring Studio</DropdownItem>
            <DropdownItem>Northwind Bakery</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <SidebarItem>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13 13l4 4" />
          </svg> Search
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarItem href="#home">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 9.5l7-6 7 6V16a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1z" />
          </svg> Home
        </SidebarItem>
        <SidebarItem href="#sites" current>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="10" cy="10" r="7" />
            <path d="M3 10h14M10 3c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z" />
          </svg> Sites
        </SidebarItem>
        <SidebarItem href="#forms">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 11l2-7h10l2 7v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 11h4l1 2h4l1-2h4" />
          </svg> Forms
        </SidebarItem>
        <SidebarItem href="#domains">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.8-.8" />
          </svg> Domains
        </SidebarItem>
        <SidebarItem href="#settings">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h8.5M15.5 6H17M3 14h1.5M8.5 14H17" />
            <circle cx="13.5" cy="6" r="2" />
            <circle cx="6.5" cy="14" r="2" />
          </svg> Settings
        </SidebarItem>
        <SidebarSection id={`${p}-recent`} heading="Recent sites">
          <SidebarItem href="#spring-launch">Spring launch</SidebarItem>
          <SidebarItem href="#bakery">Corner bakery menu</SidebarItem>
          <SidebarItem href="#portfolio">Portfolio</SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="#support">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="10" cy="10" r="7" />
            <path d="M8 8a2 2 0 1 1 2.6 1.9c-.4.1-.6.5-.6.9v.7M10 13.75v.01" />
          </svg> Support
        </SidebarItem>
        <Dropdown id={`${p}-account`}>
          <DropdownButton>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="10" cy="7.5" r="3" />
              <path d="M4.5 16.5a5.5 5.5 0 0 1 11 0" />
            </svg> Ada Park{" "}
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 12l4-4 4 4" />
            </svg>
          </DropdownButton>
          <DropdownMenu anchor="top start">
            <DropdownItem href="#profile">Profile</DropdownItem>
            <DropdownDivider />
            <DropdownItem>Sign out</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </SidebarFooter>
    </Sidebar>
  );
}

/** The whole app page. Its id names the layout, and starts the ids of everything in it. */
export function Studio(props: { id: string }) {
  const id = props.id;
  return (
    <SidebarLayout
      id={id}
      sidebar={(copy) => <StudioSidebar p={copy === "page" ? id : `${id}-drawer`} />}
      navbar={
        <Navbar aria-label="Account">
          <NavbarSpacer />
          <Dropdown id={`${id}-me`}>
            <DropdownButton aria-label="Account">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="10" cy="7.5" r="3" />
                <path d="M4.5 16.5a5.5 5.5 0 0 1 11 0" />
              </svg>
            </DropdownButton>
            <DropdownMenu anchor="bottom end">
              <DropdownItem href="#profile">Profile</DropdownItem>
              <DropdownDivider />
              <DropdownItem>Sign out</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Navbar>
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
    </SidebarLayout>
  );
}

export default function App() {
  return <Studio id="studio" />;
}
