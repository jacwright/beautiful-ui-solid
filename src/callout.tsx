import type { JSX } from "@solidjs/web";
import { createSignal, omit, onSettled, Show } from "solid-js";
import { Button } from "./button.tsx";
import { forward } from "./popover.tsx";

/**
 * Callout: a notice in the page's flow, on <beautiful-callout role="note">. CalloutTitle is its
 * <strong> title and CalloutActions a row of buttons under the text. The look is CSS
 * (styles/elements/callout.css), keyed on data-tone, which is left out at info, so the markup
 * matches a hand-written callout. The spec is the docs site's Callout page.
 *
 * What it adds to the markup: live, which makes it a live region so a callout that appears after
 * an action is read out, and onDismiss, which draws a × that fades the callout out, hands focus on,
 * and then asks the page to remove it.
 */

export type CalloutTone = "info" | "success" | "warning" | "danger" | "neutral";

export type CalloutProps = JSX.HTMLAttributes<HTMLElement> & {
  /** The tint and the icon. Defaults to info. */
  tone?: CalloutTone;
  /**
   * Read out when it appears: role="alert" for warning and danger, which interrupts, and
   * role="status" for the others, which waits. Left out, it is a note, read where it sits.
   */
  live?: boolean;
  /**
   * Draws a × at the end of the first line. Called once the callout has faded out: remove it then,
   * or when the promise it returns settles.
   */
  onDismiss?: () => unknown;
  /** The × button's name for screen readers. */
  dismissLabel?: string;
};

export function Callout(props: CalloutProps) {
  const rest = omit(props, "tone", "live", "onDismiss", "dismissLabel", "children", "ref", "role");
  let el: HTMLElement | undefined;
  const tone = () => (props.tone === "info" ? undefined : props.tone);
  const role = () => {
    if (props.role) return props.role;
    if (!props.live) return "note";
    return props.tone === "warning" || props.tone === "danger" ? "alert" : "status";
  };
  // A live region is read when its content changes, and a screen reader can miss one that arrives
  // already full. So a live callout goes in empty, and its content follows a frame later.
  const [filled, setFilled] = createSignal(!props.live);
  if (props.live) onSettled(() => void requestAnimationFrame(() => setFilled(true)));

  const dismiss = async () => {
    if (!el || el.hasAttribute("data-leaving")) return;
    const callout = el;
    // Focus would fall to the page's top with the callout. It goes to what comes next instead.
    const next = callout.contains(document.activeElement) ? neighbors(callout) : [];
    callout.setAttribute("data-leaving", "");
    // Only the fade: an animation of the page's own on the callout may never finish.
    const fades = callout.getAnimations().filter((animation) => animation instanceof CSSTransition);
    await Promise.allSettled(fades.map((animation) => animation.finished));
    // A handler that throws still lets the callout come back.
    await Promise.allSettled([Promise.resolve().then(() => props.onDismiss?.())]);
    requestAnimationFrame(() => {
      // A page that kept the callout gets it back.
      if (callout.isConnected) {
        callout.removeAttribute("data-leaving");
        return;
      }
      // Unless the person has moved on while it faded.
      const lost = !document.activeElement || document.activeElement === document.body;
      // The first that is still there, in case the page removed more than the callout.
      if (lost) next.find((node) => node.isConnected && node.checkVisibility({ visibilityProperty: true }))?.focus();
    });
  };

  return (
    <beautiful-callout
      {...rest}
      ref={(node: HTMLElement) => {
        el = node;
        forward(props.ref, node);
      }}
      role={role()}
      data-tone={tone()}
    >
      <Show when={filled()}>{props.children}</Show>
      <Show when={props.onDismiss}>
        <Button variant="tertiary" aria-label={props.dismissLabel ?? "Dismiss"} data-dismiss="" onClick={dismiss} />
      </Show>
    </beautiful-callout>
  );
}

export type CalloutTitleProps = JSX.HTMLAttributes<HTMLElement>;

/** The callout's first line, heavier: what kind of notice it is, in words. */
export function CalloutTitle(props: CalloutTitleProps) {
  return <strong {...props} />;
}

export type CalloutActionsProps = JSX.HTMLAttributes<HTMLElement>;

/** A row of Buttons under the callout's text. */
export function CalloutActions(props: CalloutActionsProps) {
  return <beautiful-callout-actions {...props} />;
}

const focusable =
  "a[href], button:not(:disabled), input:not(:disabled):not([type='hidden']), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]:not([tabindex='-1']), [contenteditable='true']";

/**
 * Where focus can go when the callout goes, best first: the focusable things after it, nearest
 * first, then the ones before it, nearest first. Only those in its dialog or popover, so focus
 * doesn't leave one and close it, or else in the page.
 */
function neighbors(callout: HTMLElement): HTMLElement[] {
  const scope = callout.closest("dialog, [popover]") ?? document.body;
  const all = [...scope.querySelectorAll<HTMLElement>(focusable)].filter(
    (node) => !callout.contains(node) && node.checkVisibility({ visibilityProperty: true }),
  );
  const after = all.filter((node) => callout.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING);
  const before = all.filter((node) => callout.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING);
  return [...after, ...before.reverse()];
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-callout": HTMLAttributes<HTMLElement>;
      "beautiful-callout-actions": HTMLAttributes<HTMLElement>;
    }
  }
}
