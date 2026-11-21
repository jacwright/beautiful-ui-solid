import { Disclosure, Text } from "beautiful-ui-solid";

export default function Open() {
  return (
    <beautiful-demo-stack>
      <Disclosure summary="What's in this release" open>
        <Text tone="muted">A new pricing page, a faster home page, and a fix for the contact form on phones.</Text>
      </Disclosure>
    </beautiful-demo-stack>
  );
}
