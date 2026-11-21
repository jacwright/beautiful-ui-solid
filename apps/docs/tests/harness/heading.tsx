import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Heading } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

renderHarness("heading", () => (
  <beautiful-example data-example="attributes">
    <Heading level={6} id="labelled" class="custom" aria-describedby="labelled-note">
      Billing
    </Heading>
  </beautiful-example>
));
