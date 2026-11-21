import { List, ListItem } from "beautiful-ui-solid";

export default function Bullets() {
  return (
    <beautiful-demo-stack>
      <p>Every site comes with:</p>
      <List>
        <ListItem>A preview link for each change, so you can share it before it goes live.</ListItem>
        <ListItem>Forms that send their entries to you, with spam filtered out.</ListItem>
        <ListItem>
          Your own domain, with{" "}
          <List>
            <ListItem>a certificate we renew for you</ListItem>
            <ListItem>
              a redirect from <code>www</code> to the bare domain
            </ListItem>
          </List>
        </ListItem>
      </List>
      <p>To move a site from another host:</p>
      <List ordered>
        <ListItem>Export its pages as HTML.</ListItem>
        <ListItem>
          Publish them with one call to <code>sites.publish</code>.
        </ListItem>
        <ListItem>
          Point your domain at <code>sites.example.com</code>.
        </ListItem>
      </List>
    </beautiful-demo-stack>
  );
}
