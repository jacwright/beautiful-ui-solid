import { Sidebar, SidebarBody, SidebarItem } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Sidebar class="demo-sidebar" aria-label="Spring launch">
      <SidebarBody>
        <SidebarItem href="#lead-overview" current>
          Overview
        </SidebarItem>
        <SidebarItem href="#lead-pages">Pages</SidebarItem>
        <SidebarItem href="#lead-forms">Forms</SidebarItem>
        <SidebarItem href="#lead-analytics">Analytics</SidebarItem>
        <SidebarItem href="#lead-settings">Settings</SidebarItem>
      </SidebarBody>
    </Sidebar>
  );
}
