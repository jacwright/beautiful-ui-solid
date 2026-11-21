import { Disclosure, Text } from "beautiful-ui-solid";

export default function Questions() {
  return (
    <beautiful-demo-stack>
      <Disclosure summary="Can I use my own domain?">
        <Text tone="muted">
          Yes. Add it under Domains, then point a CNAME record at your site. It's live in a few minutes.
        </Text>
      </Disclosure>
      <Disclosure summary="What happens if I cancel?">
        <Text tone="muted">
          Your site stays online until the end of the month you paid for. You can export every file first.
        </Text>
      </Disclosure>
      <Disclosure summary="Do you take a cut of my sales?">
        <Text tone="muted">No. You pay the plan's price, and the card processor's fee is the only other cost.</Text>
      </Disclosure>
    </beautiful-demo-stack>
  );
}
