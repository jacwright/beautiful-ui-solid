import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, List, ListItem } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

// The examples in examples/list/, then a block for the tests of the props.

renderHarness("list", () => (
  <beautiful-example data-example="attributes">
    <List variant="rows" id="pages" aria-label="Pages" ordered>
      <ListItem id="plain-row">Home</ListItem>
      <ListItem id="opens" onClick={() => document.body.setAttribute("data-opened", "pricing")} description="/pricing/">
        Pricing
      </ListItem>
      <ListItem commandfor="nowhere" command="show-modal" disabled description="/blog/">
        Blog
      </ListItem>
      <ListItem href="https://example.com" target="_blank" rel="noopener" description="example.com">
        Elsewhere
      </ListItem>
    </List>
    <List id="plain-bullets">
      <ListItem>One</ListItem>
      <ListItem id="falsy-parts" description={false} end={null}>
        Two
      </ListItem>
    </List>
    <List variant="rows" id="invites">
      <ListItem end={<Button variant="primary" color="accent">Invite</Button>} description="sam@example.com">
        Jonas Weber
      </ListItem>
    </List>
  </beautiful-example>
));
