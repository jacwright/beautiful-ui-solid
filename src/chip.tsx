import type { JSX } from "@solidjs/web";
import { children, createContext, flush, omit, Show, useContext } from "solid-js";
import type { BadgeColor } from "./badge.tsx";
import { forward } from "./popover.tsx";

/**
 * Chip: one thing someone picked or typed, such as a tag, a person to invite or a filter, on
 * <beautiful-chip>. With onRemove it ends in a <button> whose × is drawn by CSS, so the button is
 * empty and its aria-label names it. ChipGroup is the named list a row of chips sits in, and it
 * moves focus to the next chip once one is removed. The look is CSS (styles/elements/chip.css),
 * with the colors Badge shares (styles/tints.css). The spec is the docs site's Chip page.
 */

/** Badge's colors, from the same tints. */
export type ChipColor = BadgeColor;

/** What a chip tells its group: that it is in one, and that its × is about to go. */
type Group = { removing: (button: HTMLButtonElement) => void };

const GroupContext = createContext<Group | null>(null);

export type ChipGroupProps = JSX.HTMLAttributes<HTMLElement>;

/** A row of chips: a list, named by aria-label or aria-labelledby. */
export function ChipGroup(props: ChipGroupProps) {
  const rest = omit(props, "children", "ref");
  let group: HTMLElement | undefined;

  /**
   * Called just before a chip's onRemove. Once the chip has left the page, focus goes to the ×
   * that took its place, else the one before, else the group. The place is found again after the
   * change, so an app that rebuilds every chip still lands on the next one. An app that removes
   * the chip after a request is waited for, and one that keeps the chip keeps its focus.
   */
  function removing(button: HTMLButtonElement) {
    const own = group;
    if (!own) return;
    const at = removeButtons(own).indexOf(button);
    let observer: MutationObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      observer?.disconnect();
      clearTimeout(timer);
    };
    const settle = () => {
      if (button.isConnected) return;
      stop();
      const doc = own.ownerDocument;
      // Only take focus back from where a removal drops it, never from wherever it went meanwhile.
      if (doc.activeElement && doc.activeElement !== doc.body) return;
      const buttons = removeButtons(own);
      const next = buttons[at] ?? buttons[at - 1];
      if (next) next.focus();
      else if (own.isConnected) {
        own.tabIndex = -1;
        own.addEventListener("blur", () => own.removeAttribute("tabindex"), { once: true });
        own.focus();
      }
    };
    // Solid applies the app's change on flush. A change that comes later is watched for.
    queueMicrotask(() => {
      flush();
      settle();
      if (!button.isConnected) return;
      observer = new MutationObserver(settle);
      observer.observe(own, { childList: true, subtree: true });
      timer = setTimeout(stop, 10_000);
    });
  }

  function ref(el: HTMLElement) {
    group = el;
    forward(props.ref, el);
  }

  return (
    <beautiful-chips {...rest} ref={ref} role="list">
      <GroupContext value={{ removing }}>{props.children}</GroupContext>
    </beautiful-chips>
  );
}

export type ChipProps = Omit<JSX.HTMLAttributes<HTMLElement>, "color"> & {
  color?: ChipColor;
  /** Shows the × and runs when it is pressed, or on Delete or Backspace. Take the chip out of your list here. */
  onRemove?: () => void;
  /** The ×'s name. Left out, it is "Remove" and the chip's words. */
  removeLabel?: string;
};

/** The × buttons of a group's chips, in order. */
function removeButtons(group: HTMLElement) {
  return [...group.querySelectorAll<HTMLButtonElement>(":scope > beautiful-chip > button")];
}

/** The words of a chip's rendered children, for the ×'s name. An icon hidden from screen readers adds none. */
function words(rendered: unknown): string {
  const parts: string[] = [];
  const walk = (child: unknown) => {
    if (typeof child === "string" || typeof child === "number") parts.push(String(child));
    else if (Array.isArray(child)) child.forEach(walk);
    else if (child instanceof Element) {
      if (child.getAttribute("aria-hidden") !== "true") child.childNodes.forEach(walk);
    } else if (child instanceof Node && child.nodeType === Node.TEXT_NODE) parts.push(child.textContent ?? "");
  };
  walk(rendered);
  return parts.join("").replace(/\s+/g, " ").trim();
}

export function Chip(props: ChipProps) {
  const group = useContext(GroupContext);
  const rest = omit(props, "color", "onRemove", "removeLabel", "children");
  const color = () => (props.color === "neutral" ? undefined : props.color);
  // Resolved once, so the words can be read for the ×'s name without building the children again.
  const shown = children(() => props.children);
  const label = () => props.removeLabel ?? ["Remove", words(shown())].join(" ").trim();

  function remove(button: HTMLButtonElement) {
    group?.removing(button);
    props.onRemove?.();
  }

  return (
    <beautiful-chip {...rest} role={group ? "listitem" : undefined} data-color={color()}>
      {shown()}
      <Show when={props.onRemove}>
        <button
          type="button"
          aria-label={label()}
          onClick={(event) => remove(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key !== "Delete" && event.key !== "Backspace") return;
            // A held key would go on to the next chip's ×, and on through the group. A modifier means another command.
            if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            event.preventDefault();
            remove(event.currentTarget);
          }}
        />
      </Show>
    </beautiful-chip>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-chip": HTMLAttributes<HTMLElement>;
      "beautiful-chips": HTMLAttributes<HTMLElement>;
    }
  }
}
