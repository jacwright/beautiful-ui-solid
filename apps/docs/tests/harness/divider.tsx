import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Divider } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

renderHarness("divider", () => (
  <beautiful-example data-example="attributes">
    <Divider id="decorative" class="custom" role="presentation" orientation="horizontal" />
    <Divider id="hand-written" aria-orientation="vertical" data-soft="" />
  </beautiful-example>
));
