import { Avatar, AvatarGroup } from "beautiful-ui-solid";

export default function Group() {
  return (
    <beautiful-demo-stack>
      <AvatarGroup label="Editing now">
        <Avatar name="Maya Chen" src="/avatars/maya.svg" />
        <Avatar name="Sam Okafor" src="/avatars/sam.svg" />
        <Avatar name="Lucía Reyes" src="/avatars/lucia.svg" />
        <Avatar name="Jonas Weber" />
        <Avatar name="3 more people" initials="+3" color="neutral" />
      </AvatarGroup>
      <AvatarGroup label="Viewing now" size="sm">
        <Avatar name="Theo Larsen" src="/avatars/theo.svg" />
        <Avatar name="Maya Chen" src="/avatars/maya.svg" />
        <Avatar name="Aiko Kim" />
      </AvatarGroup>
    </beautiful-demo-stack>
  );
}
