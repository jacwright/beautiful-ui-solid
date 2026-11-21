import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

// The docs examples, then blocks for the tests: attributes passed through, and layouts no example shows.

renderHarness("description-list", () => (
  <>
    <beautiful-example data-example="attributes">
      <DescriptionList id="summary">
        <DescriptionTerm id="plan-term">Plan</DescriptionTerm>
        <DescriptionDetails aria-labelledby="plan-term">$29 a month</DescriptionDetails>
      </DescriptionList>
    </beautiful-example>
    {/* Two terms that share their details. */}
    <beautiful-example data-example="shared" style={{ display: "block", width: "40rem" }}>
      <DescriptionList>
        <DescriptionTerm>Domain</DescriptionTerm>
        <DescriptionTerm>Alias</DescriptionTerm>
        <DescriptionDetails>springlaunch.com</DescriptionDetails>
        <DescriptionTerm>Plan</DescriptionTerm>
        <DescriptionDetails>$29 a month</DescriptionDetails>
      </DescriptionList>
    </beautiful-example>
    {/* A list in a box that takes its content's width, as a Popover's panel does. */}
    <beautiful-example data-example="fit-content" style={{ display: "inline-block" }}>
      <DescriptionList>
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails>Live</DescriptionDetails>
      </DescriptionList>
    </beautiful-example>
  </>
));
