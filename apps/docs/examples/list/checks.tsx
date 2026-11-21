import { List, ListItem } from "beautiful-ui-solid";

export default function Checks() {
  return (
    <beautiful-demo-stack>
      <p>
        <strong>Pro</strong>, for a site that's open for business:
      </p>
      <List marker="check">
        <ListItem>Your own domain, with a certificate we renew</ListItem>
        <ListItem>Unlimited pages, previews and forms</ListItem>
        <ListItem>A database for each site</ListItem>
        <ListItem>Scheduled releases, so a launch goes out while you sleep</ListItem>
      </List>
    </beautiful-demo-stack>
  );
}
