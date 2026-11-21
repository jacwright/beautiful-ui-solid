import { Skeleton, SkeletonGroup } from "beautiful-ui-solid";

export default function Chart() {
  return (
    <article class="demo-card" aria-labelledby="chart-title">
      <h3 id="chart-title">Visitors, last 30 days</h3>
      <SkeletonGroup label="Loading the chart">
        <Skeleton shape="rect" height="12rem" />
      </SkeletonGroup>
    </article>
  );
}
