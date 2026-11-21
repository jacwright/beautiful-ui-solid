import { DescriptionDetails, DescriptionList, DescriptionTerm } from "beautiful-ui-solid";

export default function Narrow() {
  return (
    <beautiful-demo-sidebar>
      <DescriptionList size="sm">
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails>Live</DescriptionDetails>
        <DescriptionTerm>Visitors this month</DescriptionTerm>
        <DescriptionDetails>12,480</DescriptionDetails>
        <DescriptionTerm>Form submissions</DescriptionTerm>
        <DescriptionDetails>36, with 4 caught as spam</DescriptionDetails>
      </DescriptionList>
    </beautiful-demo-sidebar>
  );
}
