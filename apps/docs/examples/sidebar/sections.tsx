import { Sidebar, SidebarBody, SidebarDivider, SidebarItem, SidebarSection } from "beautiful-ui-solid";

export default function Sections() {
  return (
    <Sidebar class="demo-sidebar" aria-label="Site settings">
      <SidebarBody>
        <SidebarSection id="settings-site" heading="Spring launch">
          <SidebarItem href="#general">General</SidebarItem>
          <SidebarItem href="#domains-settings" current>
            Domains
          </SidebarItem>
          <SidebarItem href="#pages">Pages</SidebarItem>
          <SidebarItem href="#forms-settings">Forms</SidebarItem>
        </SidebarSection>
        <SidebarSection id="settings-team" heading="Team">
          <SidebarItem href="#members">Members</SidebarItem>
          <SidebarItem href="#billing">Billing</SidebarItem>
          <SidebarItem href="#api-keys">API keys</SidebarItem>
        </SidebarSection>
        <SidebarDivider />
        <SidebarItem href="https://example.com/llms.txt" target="_blank">
          Agent docs
        </SidebarItem>
      </SidebarBody>
    </Sidebar>
  );
}
