import { Navbar, NavbarItem, NavbarSection } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

export default function Icons() {
  // A click on a page makes it the current one instead of following it, so the bar can be seen to glide.
  const [at, setAt] = createSignal("#pages");
  const choose = (event: MouseEvent) => {
    event.preventDefault();
    setAt((event.currentTarget as HTMLAnchorElement).getAttribute("href")!);
  };
  return (
    <Navbar aria-label="Site tools">
      <NavbarSection>
        <NavbarItem href="#overview" current={at() === "#overview"} onClick={choose}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 9L10 3.5 16.5 9v7a1 1 0 0 1-1 1H13v-5H7v5H4.5a1 1 0 0 1-1-1z" /></svg>
          {" "}Overview
        </NavbarItem>
        <NavbarItem href="#pages" current={at() === "#pages"} onClick={choose}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 2.5h6l3 3v11a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM7.5 9.5h5M7.5 12.5h5" /></svg>
          {" "}Pages
        </NavbarItem>
        <NavbarItem href="#domains" current={at() === "#domains"} onClick={choose}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M3 10h14M10 3c2 2.2 2.8 4.6 2.8 7S12 14.8 10 17c-2-2.2-2.8-4.6-2.8-7S8 5.2 10 3z" /></svg>
          {" "}Domains
        </NavbarItem>
        <NavbarItem href="#payments" current={at() === "#payments"} onClick={choose}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="11" rx="1.5" /><path d="M2.5 8h15M5.5 12.5h3" /></svg>
          {" "}Payments
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  );
}
