import "beautiful-ui-solid/styles.css";
import "./harness.css";
import {
  Button,
  Dropdown,
  DropdownButton,
  DropdownDescription,
  DropdownHeading,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
} from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The one block no example covers: a menu a parent opens, which logs what was picked.

function Controlled() {
  const [open, setOpen] = createSignal(false);
  const [log, setLog] = createSignal<string[]>([]);
  const note = (entry: string) => setLog((all) => [...all, entry]);
  return (
    <beautiful-example data-example="controlled">
      <p id="log">{log().join(" ")}</p>
      <beautiful-demo-row>
        <Button onClick={() => setOpen(true)}>Open from outside</Button>
        <Dropdown
          id="controlled"
          open={open()}
          onToggle={(next) => {
            setOpen(next);
            note(next ? "open" : "closed");
          }}
        >
          <DropdownButton ref={(el) => (el.dataset.ref = "button")}>Site</DropdownButton>
          <DropdownMenu ref={(el) => (el.dataset.ref = "menu")}>
            <DropdownSection>
              <DropdownHeading>Changes</DropdownHeading>
              <DropdownItem shortcut="P" onClick={() => note("publish")}>
                Publish
              </DropdownItem>
              <DropdownItem onClick={() => note("preview")}>
                Preview <DropdownDescription>Opens a copy only you can see.</DropdownDescription>
              </DropdownItem>
            </DropdownSection>
            <DropdownItem disabled onClick={() => note("unpublish")}>
              Unpublish
            </DropdownItem>
            <DropdownItem href="#site-settings">Settings</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <button type="button">After</button>
      </beautiful-demo-row>
    </beautiful-example>
  );
}

renderHarness("dropdown", () => <Controlled />);
