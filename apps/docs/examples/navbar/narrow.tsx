import { Navbar, NavbarItem } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

const pages = [
  { href: "#general", name: "General" },
  { href: "#members", name: "Members" },
  { href: "#domains-settings", name: "Domains" },
  { href: "#email", name: "Email" },
  { href: "#billing-settings", name: "Billing" },
  { href: "#api-keys", name: "API keys" },
];

export default function Narrow() {
  // A click on a page makes it the current one instead of following it, so the bar can be seen to glide, and the row
  // scrolls it into view.
  const [at, setAt] = createSignal("#domains-settings");
  return (
    <beautiful-demo-phone>
      <Navbar aria-label="Site settings">
        <For each={pages}>
          {(page) => (
            <NavbarItem
              href={page.href}
              current={at() === page.href}
              onClick={(event) => {
                event.preventDefault();
                setAt(page.href);
              }}
            >
              {page.name}
            </NavbarItem>
          )}
        </For>
      </Navbar>
    </beautiful-demo-phone>
  );
}
