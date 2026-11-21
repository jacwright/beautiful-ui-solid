import { DescriptionDetails, DescriptionList, DescriptionTerm } from "beautiful-ui-solid";

export default function Site() {
  return (
    <DescriptionList>
      <DescriptionTerm>Site</DescriptionTerm>
      <DescriptionDetails>Spring launch</DescriptionDetails>
      <DescriptionTerm>Address</DescriptionTerm>
      <DescriptionDetails>
        <a href="#spring-launch">spring-launch.example.com</a>
      </DescriptionDetails>
      <DescriptionTerm>Plan</DescriptionTerm>
      <DescriptionDetails>$29 a month, renews on December 3</DescriptionDetails>
      <DescriptionTerm>Last published</DescriptionTerm>
      <DescriptionDetails>November 3, 2026 at 9:41 AM</DescriptionDetails>
    </DescriptionList>
  );
}
