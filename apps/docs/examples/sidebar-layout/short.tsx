import { Heading, Sidebar, SidebarBody, SidebarItem, SidebarLayout, Text } from "beautiful-ui-solid";

export default function Short() {
  return (
    <SidebarLayout
      id="site"
      sidebar={
        <Sidebar aria-label="Main">
          <SidebarBody>
            <SidebarItem href="#home">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 9.5l7-6 7 6V16a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1z" />
              </svg> Home
            </SidebarItem>
            <SidebarItem href="#sites">
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
            <SidebarItem href="#settings" current>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 6h8.5M15.5 6H17M3 14h1.5M8.5 14H17" />
                <circle cx="13.5" cy="6" r="2" />
                <circle cx="6.5" cy="14" r="2" />
              </svg> Settings
            </SidebarItem>
          </SidebarBody>
        </Sidebar>
      }
    >
      <Heading>Settings</Heading>
      <Text>Your site's name and address, as visitors see them.</Text>
      <dl>
        <dt>Name</dt>
        <dd>Spring launch</dd>
        <dt>Address</dt>
        <dd>spring.example.com</dd>
      </dl>
    </SidebarLayout>
  );
}
