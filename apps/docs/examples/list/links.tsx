import { List, ListItem } from "beautiful-ui-solid";

export default function Links() {
  return (
    <nav aria-label="Site settings">
      <List variant="rows">
        <ListItem
          href="#domains"
          start={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M3 10h14M10 3c2 2.2 2.8 4.5 2.8 7s-.8 4.8-2.8 7c-2-2.2-2.8-4.5-2.8-7S8 5.2 10 3z" /></svg>}
          description="Connect a domain you own, or buy one."
          end={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5l5 5-5 5" /></svg>}
        >
          Domains
        </ListItem>
        <ListItem
          href="#forms"
          start={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5z" /><path d="M3.5 5l6.5 5 6.5-5" /></svg>}
          description="Where entries go, and who hears about them."
          end={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5l5 5-5 5" /></svg>}
        >
          Forms
        </ListItem>
        <ListItem
          href="#team"
          start={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="7" r="3" /><path d="M2.5 16.5c.6-2.9 2.8-4.5 5.5-4.5s4.9 1.6 5.5 4.5M13 4.2a3 3 0 0 1 0 5.6M15 12.3c1.4.7 2.2 2.1 2.5 4.2" /></svg>}
          description="Who can edit and publish this site."
          end={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5l5 5-5 5" /></svg>}
        >
          Team
        </ListItem>
      </List>
    </nav>
  );
}
