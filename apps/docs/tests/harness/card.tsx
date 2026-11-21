import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Card, CardLink, Heading, Text } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then a block for the tests that pass attributes through.

const [saved, setSaved] = createSignal(0);

renderHarness("card", () => (
  <beautiful-example data-example="attributes">
    <Card
      as="form"
      id="saving"
      class="settings"
      aria-label="Saving"
      data-saved={saved()}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(saved() + 1);
      }}
    >
      <Heading level={3}>
        <CardLink id="open-billing" href="#billing" aria-describedby="billing-note">
          Billing
        </CardLink>
      </Heading>
      <Text id="billing-note">Paid through December.</Text>
      <footer>
        <Button type="submit">Save</Button>
      </footer>
    </Card>
    <Card id="plain">
      <Text>A card with no element named.</Text>
    </Card>
  </beautiful-example>
));
