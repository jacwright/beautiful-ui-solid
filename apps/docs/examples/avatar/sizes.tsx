import { Avatar } from "beautiful-ui-solid";

export default function Sizes() {
  return (
    <beautiful-demo-stack>
      <beautiful-demo-row>
        <Avatar name="Maya Chen" src="/avatars/maya.svg" size="xs" />
        <Avatar name="Maya Chen" src="/avatars/maya.svg" size="sm" />
        <Avatar name="Maya Chen" src="/avatars/maya.svg" />
        <Avatar name="Maya Chen" src="/avatars/maya.svg" size="lg" />
        <Avatar name="Maya Chen" src="/avatars/maya.svg" size="xl" />
      </beautiful-demo-row>
      <beautiful-demo-row>
        <Avatar name="Sam Okafor" size="xs" />
        <Avatar name="Sam Okafor" size="sm" />
        <Avatar name="Sam Okafor" />
        <Avatar name="Sam Okafor" size="lg" />
        <Avatar name="Sam Okafor" size="xl" />
      </beautiful-demo-row>
    </beautiful-demo-stack>
  );
}
