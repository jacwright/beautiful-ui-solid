import { IconButton } from "beautiful-ui-solid";

export default function Link() {
  return (
    <beautiful-demo-row>
      <IconButton href="#view-site" label="View site" tooltipId="tip-view-site">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 10S5 4.5 10 4.5 17.5 10 17.5 10 15 15.5 10 15.5 2.5 10 2.5 10z" /><circle cx="10" cy="10" r="2.5" /></svg>
      </IconButton>
    </beautiful-demo-row>
  );
}
