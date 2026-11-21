import { DescriptionDetails, DescriptionList, DescriptionTerm } from "beautiful-ui-solid";

export default function Several() {
  return (
    <DescriptionList>
      <DescriptionTerm>Domains</DescriptionTerm>
      <DescriptionDetails>springlaunch.com</DescriptionDetails>
      <DescriptionDetails>www.springlaunch.com</DescriptionDetails>
      <DescriptionTerm>Form emails go to</DescriptionTerm>
      <DescriptionDetails>hello@springlaunch.com</DescriptionDetails>
      <DescriptionTerm>Scheduled release</DescriptionTerm>
      <DescriptionDetails />
      <DescriptionTerm>Preview link</DescriptionTerm>
      <DescriptionDetails>
        <code>https://preview-4f9c2a1e7b3d.spring-launch.example.com/collections/spring</code>
      </DescriptionDetails>
    </DescriptionList>
  );
}
