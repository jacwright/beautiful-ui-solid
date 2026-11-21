import { Heading, Skeleton, SkeletonGroup } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <beautiful-demo-prose>
      <Heading level={2}>Release notes</Heading>
      <SkeletonGroup label="Loading release notes">
        <Skeleton lines={4} />
      </SkeletonGroup>
    </beautiful-demo-prose>
  );
}
