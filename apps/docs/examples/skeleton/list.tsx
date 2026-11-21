import { Skeleton, SkeletonGroup } from "beautiful-ui-solid";
import { For } from "solid-js";

/** The widths of each person's name and email, so the rows don't line up like a grid. */
const team = [
  [40, 60],
  [30, 50],
  [45, 55],
];

export default function List() {
  return (
    <article class="demo-card demo-narrow" aria-labelledby="team-title">
      <h3 id="team-title">Team</h3>
      <SkeletonGroup label="Loading the team" class="demo-people">
        <For each={team}>
          {([name, email]) => (
            <beautiful-demo-person>
              <Skeleton shape="circle" />
              <p>
                <Skeleton width={`${name}%`} />
              </p>
              <p>
                <Skeleton width={`${email}%`} />
              </p>
            </beautiful-demo-person>
          )}
        </For>
      </SkeletonGroup>
    </article>
  );
}
