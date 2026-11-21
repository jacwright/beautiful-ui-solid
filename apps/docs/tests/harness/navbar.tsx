import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Navbar, NavbarItem, NavbarSection } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The examples in examples/navbar/, then a row whose current page a router moves, and the pass-throughs.

const settings = ["General", "Members", "Domains", "Email", "Billing", "API keys"];

function Routed() {
  const [at, setAt] = createSignal("General");
  return (
    <beautiful-example data-example="routed">
      <beautiful-demo-phone>
        <Navbar aria-label="Routed">
          <For each={settings}>
            {(name) => (
              <NavbarItem
                href={`#${name.toLowerCase().replace(" ", "-")}`}
                current={at() === name}
                onClick={(event) => {
                  event.preventDefault();
                  setAt(name);
                }}
              >
                {name}
              </NavbarItem>
            )}
          </For>
        </Navbar>
      </beautiful-demo-phone>
      <button type="button" id="go-api-keys" data-variant="tertiary" onClick={() => setAt("API keys")}>
        Go to API keys
      </button>
    </beautiful-example>
  );
}

const [clicks, setClicks] = createSignal(0);
let refd: HTMLElement | undefined;

renderHarness("navbar", () => (
  <>
    <Routed />
    <beautiful-example data-example="attributes">
      <Navbar id="passed" aria-label="Pass-throughs" class="extra">
        <NavbarSection id="section">
          <NavbarItem id="action" data-clicks={clicks()} onClick={() => setClicks(clicks() + 1)}>
            Count a click
          </NavbarItem>
          <NavbarItem id="off" disabled>
            Not now
          </NavbarItem>
          <NavbarItem
            id="refd"
            href="#refd"
            ref={(el) => {
              refd = el;
              el.dataset.refd = String(refd === el);
            }}
          >
            With a ref
          </NavbarItem>
        </NavbarSection>
      </Navbar>
    </beautiful-example>
  </>
));

