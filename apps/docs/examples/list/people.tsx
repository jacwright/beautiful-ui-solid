import { Avatar, Button, List, ListItem } from "beautiful-ui-solid";

export default function People() {
  return (
    <List variant="rows">
      <ListItem start={<Avatar name="Maya Chen" src="/avatars/maya.svg" size="lg" decorative />} description="maya@northwind.studio" end="Owner">
        Maya Chen
      </ListItem>
      <ListItem
        start={<Avatar name="Sam Okafor" src="/avatars/sam.svg" size="lg" decorative />}
        description="sam@northwind.studio"
        end={
          <Button variant="tertiary" aria-label="Remove Sam Okafor">
            Remove
          </Button>
        }
      >
        Sam Okafor
      </ListItem>
      <ListItem
        start={<Avatar name="Jonas Weber" size="lg" decorative />}
        description="Invited 2 days ago"
        end={
          <Button variant="tertiary" aria-label="Remove Jonas Weber">
            Remove
          </Button>
        }
      >
        Jonas Weber
      </ListItem>
    </List>
  );
}
