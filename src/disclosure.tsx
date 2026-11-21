import type { JSX } from "@solidjs/web";
import { omit, untrack } from "solid-js";
import { AccordionContext, useAccordionName } from "./accordion.tsx";
import { forward } from "./popover.tsx";

/**
 * Disclosure: a native <details> with its <summary>. The browser opens and closes it on a press,
 * Enter or Space, tells screen readers whether it's expanded, and opens it for find in page. The
 * look is CSS (styles/elements/disclosure.css), so the children are the panel with no wrapper.
 *
 * This adds what the platform lacks for a parent: open sets it, and onToggle says when it opened
 * or closed, however that happened. The spec is the docs site's Disclosure page.
 */

export type DisclosureProps = Omit<JSX.DetailsHtmlAttributes<HTMLDetailsElement>, "open" | "onToggle"> & {
  /** The words on the button that opens it. */
  summary: JSX.Element;
  /** Open at first, and opened or closed when it changes. The person can still open and close it. */
  open?: boolean;
  /** Called whenever it opens or closes, however it happens. */
  onToggle?: (open: boolean) => void;
};

export function Disclosure(props: DisclosureProps) {
  const rest = omit(props, "summary", "open", "onToggle", "children", "ref", "name");
  // Inside an Accordion, the group's name, so one item opens at a time. Its own name wins.
  const group = useAccordionName();

  // A listener, not a JSX handler: the native toggle event, read as open or closed. The browser
  // also fires it for an open at first, and once for a quick open and close, so only a change from
  // what was last shown counts.
  function wire(el: HTMLDetailsElement) {
    let shown = untrack(() => !!props.open);
    el.addEventListener("toggle", (event) => {
      const open = (event as ToggleEvent).newState === "open";
      if (open === shown) return;
      shown = open;
      props.onToggle?.(open);
    });
    forward(props.ref, el);
  }

  // open is set only when it changes, so a person's own press stands until the parent says otherwise.
  return (
    <details {...rest} ref={wire} name={props.name ?? group()} open={props.open}>
      <summary>{props.summary}</summary>
      <AccordionContext value={() => undefined}>{props.children}</AccordionContext>
    </details>
  );
}
