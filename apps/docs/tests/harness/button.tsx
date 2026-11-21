import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

renderHarness("button", () => (
  <form data-example="form" onSubmit={(event) => event.preventDefault()}>
    <Button>Preview</Button>
    <Button type="submit" variant="primary">Save</Button>
  </form>
));
