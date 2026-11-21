import { Button, Skeleton, SkeletonGroup } from "beautiful-ui-solid";
import { createSignal, For, onCleanup, Show } from "solid-js";

const numbers = [
  { id: "live-visitors", title: "Visitors", value: "12,480", note: "Up 8% on last month", width: "5ch" },
  { id: "live-views", title: "Page views", value: "48,102", note: "Up 3% on last month", width: "6ch" },
  { id: "live-bounce", title: "Bounce rate", value: "41%", note: "Down 2 points", width: "4ch" },
];

/** The stat cards loading for two seconds, then their numbers, so the swap and its timing can be seen. */
export default function Reload() {
  const [loading, setLoading] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));
  function reload() {
    clearTimeout(timer);
    setLoading(true);
    timer = setTimeout(() => setLoading(false), 2000);
  }
  return (
    <>
      <beautiful-demo-cards>
        <For each={numbers}>
          {(stat) => (
            <article class="demo-card" aria-labelledby={stat.id}>
              <h3 id={stat.id}>{stat.title}</h3>
              <Show
                when={!loading()}
                fallback={
                  <SkeletonGroup label={`Loading ${stat.title.toLowerCase()}`}>
                    <p class="demo-stat">
                      <Skeleton width={stat.width} />
                    </p>
                    <p data-size="sm">
                      <Skeleton width="10ch" />
                    </p>
                  </SkeletonGroup>
                }
              >
                <p class="demo-stat">{stat.value}</p>
                <p data-size="sm" data-tone="muted">
                  {stat.note}
                </p>
              </Show>
            </article>
          )}
        </For>
      </beautiful-demo-cards>
      <Button onClick={reload}>Reload</Button>
    </>
  );
}
