import { Skeleton, SkeletonGroup } from "beautiful-ui-solid";

export default function Paragraph() {
  return (
    <beautiful-demo-prose>
      <h2>Release notes</h2>
      <SkeletonGroup label="Loading release notes">
        <Skeleton lines={4} />
      </SkeletonGroup>
    </beautiful-demo-prose>
  );
}
