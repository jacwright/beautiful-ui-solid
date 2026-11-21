import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Skeleton, SkeletonGroup } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";
import { renderHarness } from "./examples.tsx";

// After the docs examples, the blocks for the tests of props and of the sweep running in step.

/** A skeleton that mounts a while after the page, as one in a later card would. */
function Late() {
  const [shown, setShown] = createSignal(false);
  setTimeout(() => setShown(true), 700);
  return (
    <Show when={shown()}>
      <Skeleton id="late" />
    </Show>
  );
}

renderHarness("skeleton", () => (
  <>
    <beautiful-example data-example="props">
      <SkeletonGroup id="group" class="custom">
        <Skeleton id="one-line" class="custom" />
        <Skeleton id="text-shape" shape="text" lines={1} />
        <Skeleton id="circle" shape="circle" width="4rem" />
        <Skeleton id="with-ref" ref={(el) => el.setAttribute("data-ref", "")} />
      </SkeletonGroup>
    </beautiful-example>
    <beautiful-example data-example="late">
      <Skeleton id="early" />
      <Late />
    </beautiful-example>
  </>
));
