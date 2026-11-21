import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, ButtonGroup } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

// The docs examples, then a block for the props no example shows.

renderHarness("button-group", () => (
  <>
    <h2 id="toolbar-name">Formatting</h2>
    <beautiful-example data-example="labelledby">
      <ButtonGroup aria-labelledby="toolbar-name" id="labelled" class="extra">
        <Button>Bold</Button>
        <Button>Italic</Button>
      </ButtonGroup>
    </beautiful-example>
  </>
));

// The types require a name: a group without one is a type error, which typecheck checks.
// @ts-expect-error ButtonGroup needs aria-label or aria-labelledby.
void (() => <ButtonGroup><Button>Alone</Button></ButtonGroup>);
// @ts-expect-error and not both.
void (() => <ButtonGroup aria-label="Both" aria-labelledby="toolbar-name"><Button>Both</Button></ButtonGroup>);
