import { Button, Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

export default function Site() {
  // A click on a page makes it the current one instead of following it, so the bar can be seen to glide.
  const [at, setAt] = createSignal("#pricing");
  const choose = (event: MouseEvent) => {
    event.preventDefault();
    setAt((event.currentTarget as HTMLAnchorElement).getAttribute("href")!);
  };
  return (
    <Navbar aria-label="Site">
      <NavbarItem href="#top">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 2.5l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" /></svg>
        {" "}Spring Studio
      </NavbarItem>
      <NavbarSection>
        <NavbarItem href="#features" current={at() === "#features"} onClick={choose}>
          Features
        </NavbarItem>
        <NavbarItem href="#pricing" current={at() === "#pricing"} onClick={choose}>
          Pricing
        </NavbarItem>
        <NavbarItem href="#stories" current={at() === "#stories"} onClick={choose}>
          Stories
        </NavbarItem>
        <NavbarItem href="#blog" current={at() === "#blog"} onClick={choose}>
          Blog
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="#sign-in">Sign in</NavbarItem>
        <Button href="#start" variant="primary" color="accent">
          Start free
        </Button>
      </NavbarSection>
    </Navbar>
  );
}
