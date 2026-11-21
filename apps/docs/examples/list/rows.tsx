import { List, ListItem } from "beautiful-ui-solid";

export default function Rows() {
  return (
    <List variant="rows">
      <ListItem
        start={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M3 10h14M10 3c2 2.2 2.8 4.5 2.8 7s-.8 4.8-2.8 7c-2-2.2-2.8-4.5-2.8-7S8 5.2 10 3z" /></svg>}
        description="spring-launch.example.com"
        end="Live"
      >
        Spring launch
      </ListItem>
      <ListItem
        start={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M3 10h14M10 3c2 2.2 2.8 4.5 2.8 7s-.8 4.8-2.8 7c-2-2.2-2.8-4.5-2.8-7S8 5.2 10 3z" /></svg>}
        description="docs.northwind.com"
        end="Live"
      >
        Northwind docs
      </ListItem>
      <ListItem
        start={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h7l3 3v11H5z" /><path d="M12 3v3h3" /></svg>}
        description="Not published yet"
        end="Draft"
      >
        Winter sale
      </ListItem>
    </List>
  );
}
