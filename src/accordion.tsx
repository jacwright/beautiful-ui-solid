import type { JSX } from "@solidjs/web";
import { createContext, createUniqueId, omit, useContext } from "solid-js";
import { call } from "./handler.ts";

/**
 * Accordion: Disclosures that open one at a time. Each item is a Disclosure, a native <details>,
 * and the group gives them all one name, so the browser closes the open one when another opens.
 * The look is CSS (styles/elements/accordion.css). This adds what the platform lacks: the APG
 * arrow keys between the summaries. The spec is the docs site's Accordion page.
 */

export type AccordionProps = JSX.HTMLAttributes<HTMLElement> &
  (
    | {
        /** Opening one item closes the one that was open. */
        multiple?: false;
        /** The name the items share. A unique one by default: one open per name across the page. */
        name?: string;
      }
    | {
        /** Lets several items be open together, so the items share no name. */
        multiple: true;
        name?: never;
      }
  );

/**
 * The name a Disclosure inside an Accordion takes, or undefined when several may be open. A
 * Disclosure sets it back to undefined for its panel, so one nested in an item stays out of the group.
 */
export const AccordionContext = createContext<() => string | undefined>(() => undefined);

/** For Disclosure: the name of the Accordion around it, if any. */
export const useAccordionName = () => useContext(AccordionContext);

export function Accordion(props: AccordionProps) {
  const rest = omit(props, "multiple", "name", "children", "onKeyDown");
  const fallback = createUniqueId();
  const name = () => (props.multiple ? undefined : (props.name ?? fallback));

  // Up and Down move between this group's own summaries, wrapping, and Home and End go to the ends.
  // The caller's handler runs first, and its preventDefault keeps the key from the group, as in Tabs.
  function onKeyDown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
    call(props.onKeyDown, event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const group = event.currentTarget;
    const target = event.target as HTMLElement;
    if (target.tagName !== "SUMMARY" || target.parentElement?.parentElement !== group) return;
    const summaries = [...group.querySelectorAll<HTMLElement>(":scope > details > summary")];
    const at = summaries.indexOf(target);
    const last = summaries.length - 1;
    const to = { ArrowDown: at === last ? 0 : at + 1, ArrowUp: at === 0 ? last : at - 1, Home: 0, End: last }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    summaries[to]?.focus();
  }

  return (
    <AccordionContext value={name}>
      <beautiful-accordion {...rest} onKeyDown={onKeyDown}>
        {props.children}
      </beautiful-accordion>
    </AccordionContext>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-accordion": HTMLAttributes<HTMLElement>;
    }
  }
}
