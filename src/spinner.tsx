import type { JSX } from "@solidjs/web";
import { children, createSignal, omit, onSettled } from "solid-js";
import { forward } from "./popover.tsx";

/**
 * Spinner: something is loading, for a time no one can say. A <beautiful-spinner role="status">,
 * a polite live region. The ring is CSS (styles/elements/spinner.css), keyed on data-size,
 * data-color, data-label and data-delay, each left out at its default so the markup matches a
 * hand-written one.
 *
 * Its words go in when the CSS fade begins, after --spinner-delay, not with the element: a region
 * that appears with its words already in is often not announced, and a load quicker than the wait
 * should say nothing. A spinner inside an aria-busy region isn't heard: screen readers hold back
 * a busy region's changes, its live regions' too. The spec is the docs site's Spinner page.
 */

export type SpinnerProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children" | "color"> & {
  /** The words a screen reader hears, when none are shown. */
  label?: string;
  /** Words shown beside the ring, in place of label. */
  children?: JSX.Element;
  /** sm is the size of the text around it, md a card's or a panel's, lg a page's. */
  size?: "sm" | "md" | "lg";
  /** neutral is the color of the text it sits in. */
  color?: "neutral" | "accent";
  /** false shows it at once, for a wait known to be long. */
  delay?: boolean;
};

export function Spinner(props: SpinnerProps) {
  const rest = omit(props, "label", "children", "size", "color", "delay", "ref");
  const shown = children(() => props.children);
  const [faded, setFaded] = createSignal(false);
  let spinner: HTMLElement | undefined;

  // The words follow the fade itself, not a clock of their own: a spinner mounted in a closed
  // panel waits until it's shown, and a theme's --spinner-delay holds for the words too.
  onSettled(() => {
    const el = spinner;
    if (!el) return;
    // No fade to wait for: data-delay="none", or a stylesheet that turns animation off. A spinner
    // not in the document yet has no style, and waits for the fade that starts when it's added.
    const names = getComputedStyle(el).animationName.split(/,\s*/);
    if (el.isConnected && !names.includes("spinner-in")) {
      setFaded(true);
      return;
    }
    // The fade begins: the words go in. It is cancelled: by hiding its panel, so the words wait
    // for the fade that starts again when it shows, or by a later stylesheet on a spinner that
    // still shows, which has no fade left to wait for.
    const follow = (event: AnimationEvent) => {
      if (event.target !== el || event.animationName !== "spinner-in") return;
      setFaded(event.type === "animationstart" || (el.checkVisibility?.() ?? true));
    };
    el.addEventListener("animationstart", follow);
    el.addEventListener("animationcancel", follow);
    // Chrome sends no animationcancel for a fade cancelled before its first frame, but its
    // finished promise still rejects.
    const fade = el.getAnimations().find((a) => a instanceof CSSAnimation && a.animationName === "spinner-in");
    fade?.finished.catch(() => {
      if (el.isConnected && el.getAnimations().every((a) => !(a instanceof CSSAnimation && a.animationName === "spinner-in"))) {
        setFaded(el.checkVisibility?.() ?? true);
      }
    });
    return () => {
      el.removeEventListener("animationstart", follow);
      el.removeEventListener("animationcancel", follow);
    };
  });

  // Children that render nothing, such as {false} or a list of them, show no words.
  const visible = () => shown.toArray().some((word) => word !== undefined && word !== null && word !== false && word !== "");
  const words = () => {
    if (!faded() && props.delay !== false) return undefined;
    return visible() ? shown() : (props.label ?? "Loading");
  };

  return (
    <beautiful-spinner
      {...rest}
      ref={(element: HTMLElement) => {
        spinner = element;
        forward(props.ref, element);
      }}
      role="status"
      data-size={props.size === "sm" ? undefined : props.size}
      data-color={props.color === "accent" ? "accent" : undefined}
      data-label={visible() ? "visible" : undefined}
      data-delay={props.delay === false ? "none" : undefined}
    >
      {words()}
    </beautiful-spinner>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-spinner": HTMLAttributes<HTMLElement>;
    }
  }
}
