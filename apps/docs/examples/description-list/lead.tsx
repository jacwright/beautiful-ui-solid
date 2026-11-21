import { DescriptionDetails, DescriptionList, DescriptionTerm, Link } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <DescriptionList>
      <DescriptionTerm>Site</DescriptionTerm>
      <DescriptionDetails>Spring launch</DescriptionDetails>
      <DescriptionTerm>Address</DescriptionTerm>
      <DescriptionDetails>
        <Link href="#lead-spring-launch">spring-launch.example.com</Link>
      </DescriptionDetails>
      <DescriptionTerm>Plan</DescriptionTerm>
      <DescriptionDetails>$29 a month, renews on December 3</DescriptionDetails>
      <DescriptionTerm>Last published</DescriptionTerm>
      <DescriptionDetails>November 3, 2026 at 9:41 AM</DescriptionDetails>
    </DescriptionList>
  );
}
