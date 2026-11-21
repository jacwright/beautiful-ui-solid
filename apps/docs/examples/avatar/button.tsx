import { Avatar, Button } from "beautiful-ui-solid";

export default function InAButton() {
  return (
    <beautiful-demo-row>
      <Button aria-label="Your account, Theo Larsen">
        <Avatar name="Theo Larsen" src="/avatars/theo.svg" decorative />
      </Button>
      <Button aria-label="Switch team, Northwind Studio">
        <Avatar name="Northwind Studio" square decorative />
      </Button>
    </beautiful-demo-row>
  );
}
