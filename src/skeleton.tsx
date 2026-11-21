import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { forward } from "./popover.tsx";

/**
 * Skeleton: a placeholder in the shape of content that is still loading. The look is CSS
 * (styles/elements/skeleton.css), so a static page gets it with no JS. The component adds one
 * thing the platform lacks: every skeleton's light sweeps in step, whenever it mounted. The spec is
 * the docs site's Skeleton page.
 */

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-skeleton": HTMLAttributes<HTMLElement>;
      "beautiful-skeleton-group": HTMLAttributes<HTMLElement>;
      "beautiful-visually-hidden": HTMLAttributes<HTMLElement>;
    }
  }
}

export type SkeletonProps = Omit<JSX.HTMLAttributes<HTMLElement>, "style" | "children"> & {
  /** Left out, lines of the surrounding text. rect is a block for a chart or an image, circle an avatar. */
  shape?: "text" | "rect" | "circle";
  /** For text: how many lines. The last of several is shorter. */
  lines?: number;
  /** Any CSS length. Left out, the full width; for a circle, 2.5rem. */
  width?: string;
  /** For rect: any CSS length, in place of 16:9. */
  height?: string;
};

/**
 * Starts the light's sweep at the timeline's origin, so every skeleton on the page sweeps in step
 * whenever it mounted. It runs on each start of the sweep, so a sweep the browser rebuilds, as when
 * reduced motion is turned off again, falls back in step too. Only the sweep: the breathing fade
 * under reduced motion keeps its own start, or it would show before the skeleton's wait is over.
 */
function inStep(event: AnimationEvent) {
  if (event.animationName !== "skeleton-shimmer") return;
  const shape = event.currentTarget as HTMLElement;
  for (const animation of shape.getAnimations({ subtree: true })) {
    if (animation instanceof CSSAnimation && animation.animationName === "skeleton-shimmer") animation.startTime = 0;
  }
}

export function Skeleton(props: SkeletonProps) {
  const rest = omit(props, "shape", "lines", "width", "height", "ref");
  const style = () => {
    const lines = props.lines ?? 1;
    const parts = [
      props.width && `width: ${props.width}`,
      props.height && `height: ${props.height}`,
      lines > 1 && `--lines: ${lines}`,
    ].filter(Boolean);
    return parts.length ? `${parts.join("; ")};` : undefined;
  };

  // A listener, not a JSX handler, so the caller's own onAnimationStart passes through untouched.
  function wire(el: HTMLElement) {
    el.addEventListener("animationstart", inStep);
    forward(props.ref, el);
  }

  return (
    <beautiful-skeleton
      {...rest}
      ref={wire}
      aria-hidden="true"
      data-shape={props.shape === "text" ? undefined : props.shape}
      style={style()}
    />
  );
}

export type SkeletonGroupProps = JSX.HTMLAttributes<HTMLElement> & {
  /** What a screen reader reads in place of the shapes. Name what is loading: "Loading visitors". */
  label?: string;
};

/** The region that is loading: busy, with its label for screen readers, then the shapes. */
export function SkeletonGroup(props: SkeletonGroupProps) {
  const rest = omit(props, "label", "children");
  return (
    <beautiful-skeleton-group {...rest} aria-busy="true">
      <beautiful-visually-hidden>{props.label ?? "Loading"}</beautiful-visually-hidden>
      {props.children}
    </beautiful-skeleton-group>
  );
}
