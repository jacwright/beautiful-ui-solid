import { Button, Drawer, Sidebar, SidebarBody, SidebarFooter, SidebarItem } from "beautiful-ui-solid";

export default function Navigation() {
  return (
    <>
      {/* A plain Button: IconButton names itself with a Tooltip, which the approved example doesn't show. */}
      <Button commandfor="main-menu" command="show-modal" data-icon-button="" aria-label="Open the menu">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3.5 6h13M3.5 10h13M3.5 14h13" /></svg>
      </Button>
      <Drawer id="main-menu" side="start" size="sm" aria-label="Main menu">
        <Sidebar aria-label="Main">
          <SidebarBody>
            <SidebarItem href="#home">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5l7-6 7 6V16a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1z" /></svg>
              {" "}Home
            </SidebarItem>
            <SidebarItem href="#sites" current>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M3 10h14M10 3c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z" /></svg>
              {" "}Sites
            </SidebarItem>
            <SidebarItem href="#forms">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l2-7h10l2 7v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 11h4l1 2h4l1-2h4" /></svg>
              {" "}Forms
            </SidebarItem>
            <SidebarItem href="#settings">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h8.5M15.5 6H17M3 14h1.5M8.5 14H17" /><circle cx="13.5" cy="6" r="2" /><circle cx="6.5" cy="14" r="2" /></svg>
              {" "}Settings
            </SidebarItem>
          </SidebarBody>
          <SidebarFooter>
            <SidebarItem href="#support">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M8 8a2 2 0 1 1 2.6 1.9c-.4.1-.6.5-.6.9v.7M10 13.75v.01" /></svg>
              {" "}Support
            </SidebarItem>
          </SidebarFooter>
        </Sidebar>
      </Drawer>
    </>
  );
}
