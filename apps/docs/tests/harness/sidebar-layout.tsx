import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Sidebar, SidebarBody, SidebarItem, SidebarLayout } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

// After the docs examples, the props no example shows, and a Sidebar given as JSX, built twice.

renderHarness("sidebar-layout", () => (
  <beautiful-example data-example="attributes">
    <SidebarLayout
      class="custom"
      data-extra="yes"
      sidebar={
        <Sidebar aria-label="Plain">
          <SidebarBody>
            <SidebarItem href="#one">One</SidebarItem>
          </SidebarBody>
        </Sidebar>
      }
    >
      <p id="plain-content">Content</p>
    </SidebarLayout>
  </beautiful-example>
));
