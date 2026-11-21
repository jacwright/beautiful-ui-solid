import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarSection } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";
import { renderHarness } from "./examples.tsx";

// After the docs examples, the blocks no example shows: a long body that starts scrolled to its
// current item, items that log their clicks, and a sidebar that starts hidden, as in a closed sheet.

const [clicks, setClicks] = createSignal(0);

renderHarness("sidebar", () => (
  <>
    <beautiful-example data-example="long">
      <Sidebar class="demo-sidebar" style={{ "block-size": "20rem" }} aria-label="Sites">
          <SidebarHeader>
            <Button variant="primary" color="accent">
              New site
            </Button>
          </SidebarHeader>
          <SidebarBody id="long-body">
            <For each={Array.from({ length: 30 }, (_, i) => i + 1)}>
              {(n) => (
                <SidebarItem href={`#site-${n}`} current={n === 24}>
                  Site {n}
                </SidebarItem>
              )}
            </For>
          </SidebarBody>
          <SidebarFooter>
            <SidebarItem id="counted" data-clicks={clicks()} onClick={() => setClicks(clicks() + 1)}>
              Count a click
            </SidebarItem>
            <SidebarItem id="stepped" href="#step" aria-current="step">
              Step
            </SidebarItem>
            <SidebarItem id="disabled" disabled>
              Archived
            </SidebarItem>
          </SidebarFooter>
      </Sidebar>
    </beautiful-example>
    <beautiful-example data-example="sheet" hidden>
      <Sidebar class="demo-sidebar" style={{ "block-size": "20rem" }} aria-label="Sheet">
        <SidebarBody id="sheet-body">
          <SidebarSection id="unnamed" heading="">
            <For each={Array.from({ length: 30 }, (_, i) => i + 1)}>
              {(n) => (
                <SidebarItem href={`#sheet-${n}`} current={n === 24}>
                  Sheet {n}
                </SidebarItem>
              )}
            </For>
          </SidebarSection>
        </SidebarBody>
      </Sidebar>
    </beautiful-example>
  </>
));
