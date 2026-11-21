import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Navbar, StackedLayout } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

// For the tests of what the markup can't show: the props.
renderHarness("stacked-layout", () => (
  <beautiful-example data-example="attributes">
    <StackedLayout class="custom" data-extra="yes" navbar={<Navbar aria-label="Plain" />}>
      <p id="plain-content">Content</p>
    </StackedLayout>
  </beautiful-example>
));
