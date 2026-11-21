import { Accordion, Disclosure, Text } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Accordion name="lead-release">
      <Disclosure summary="Pricing page" open>
        <Text tone="muted">Three plans side by side, with a yearly switch that shows the saving.</Text>
      </Disclosure>
      <Disclosure summary="Home page">
        <Text tone="muted">Loads in half the time: the hero image is smaller and comes in after the words.</Text>
      </Disclosure>
      <Disclosure summary="Contact form">
        <Text tone="muted">Sends on phones again. The button was hidden under the keyboard.</Text>
      </Disclosure>
    </Accordion>
  );
}
