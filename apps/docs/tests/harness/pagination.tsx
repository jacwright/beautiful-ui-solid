import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Pagination } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The examples in examples/pagination/, then the rows for each page of twelve, the edge cases, and a
// page that moves.

const href = (page: number) => `#page-${page}`;
const [page, setPage] = createSignal(1);

renderHarness("pagination", () => (
  <>
    <beautiful-example data-example="every-page">
      <For each={Array.from({ length: 12 }, (_, i) => i + 1)}>
        {(at) => <Pagination page={at} count={12} href={href} aria-label={`On page ${at}`} />}
      </For>
    </beautiful-example>
    <beautiful-example data-example="edges">
      <Pagination id="one-page" page={1} count={1} href={href} />
      <Pagination id="out-of-range" page={40} count={3} href={href} aria-label="Out of range" />
      <Pagination page={Number("abc")} count={3} href={href} aria-label="Not a number" />
    </beautiful-example>
    <beautiful-example data-example="moving">
      <Pagination
        id="moving"
        page={page()}
        count={9}
        href={href}
        aria-label="Moving"
        onClick={(event: MouseEvent) => {
          const to = (event.target as Element).closest("a")?.getAttribute("href")?.match(/^#page-(\d+)$/)?.[1];
          if (!to) return;
          event.preventDefault();
          setPage(Number(to));
        }}
      />
    </beautiful-example>
  </>
));
