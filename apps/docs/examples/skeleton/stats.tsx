import { Skeleton, SkeletonGroup } from "beautiful-ui-solid";
import { For } from "solid-js";

const stats = [
  { id: "stat-visitors", title: "Visitors", width: "5ch" },
  { id: "stat-views", title: "Page views", width: "6ch" },
  { id: "stat-bounce", title: "Bounce rate", width: "4ch" },
];

export default function Stats() {
  return (
    <beautiful-demo-cards>
      <For each={stats}>
        {(stat) => (
          <article class="demo-card" aria-labelledby={stat.id}>
            <h3 id={stat.id}>{stat.title}</h3>
            <SkeletonGroup label={`Loading ${stat.title.toLowerCase()}`}>
              <p class="demo-stat">
                <Skeleton width={stat.width} />
              </p>
              <p data-size="sm">
                <Skeleton width="10ch" />
              </p>
            </SkeletonGroup>
          </article>
        )}
      </For>
    </beautiful-demo-cards>
  );
}
