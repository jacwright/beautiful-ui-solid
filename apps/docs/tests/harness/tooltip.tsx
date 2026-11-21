import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Tooltip } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

// The docs examples, then the blocks that test what no example shows.

renderHarness("tooltip", () => (
  <>
    <beautiful-example data-example="described">
      <Tooltip id="tip-extra" content="Ends the trial today">
        <Button aria-describedby="trial-note">Upgrade</Button>
      </Tooltip>
      <p id="trial-note">Billed monthly</p>
    </beautiful-example>
    <beautiful-example data-example="field">
      <Tooltip id="tip-field" content="Letters, numbers and dashes">
        <input aria-label="Site address" />
      </Tooltip>
    </beautiful-example>
    <beautiful-example data-example="alone">
      <Tooltip id="tip-alone" content="Search" shortcut="⌘K" anchor="bottom">
        <Button>Find</Button>
      </Tooltip>
    </beautiful-example>
  </>
));
