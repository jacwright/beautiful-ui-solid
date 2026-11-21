import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { AuthLayout, Heading } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

// The docs examples, then a block for what the markup can't show: the props.
renderHarness("auth-layout", () => (
  <beautiful-example data-example="attributes">
    <AuthLayout id="labelled" class="custom" data-extra="yes" footer={<p id="small-print">Small print</p>}>
      <Heading>Hello</Heading>
    </AuthLayout>
  </beautiful-example>
));
