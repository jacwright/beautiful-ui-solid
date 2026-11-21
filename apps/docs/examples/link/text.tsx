import { Link, Text } from "beautiful-ui-solid";

export default function InText() {
  return (
    <Text>
      Your site is live at <Link href="#spring-launch">spring-launch.example.com</Link>. Share its{" "}
      <Link href="#preview">preview link</Link> to collect feedback before anything goes live.
    </Text>
  );
}
