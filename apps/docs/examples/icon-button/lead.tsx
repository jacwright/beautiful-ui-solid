import { IconButton } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <beautiful-demo-row>
      <IconButton label="New site" tooltipId="lead-tip-new-site" variant="primary" color="accent">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
      </IconButton>
      <IconButton label="Site settings" tooltipId="lead-tip-site-settings">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 6h7.5M15 6h1.5M3.5 14h1.5M9 14h7.5" /><circle cx="13" cy="6" r="2" /><circle cx="7" cy="14" r="2" /></svg>
      </IconButton>
      <IconButton label="More actions" tooltipId="lead-tip-more-actions" variant="tertiary">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><circle cx="4.5" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="15.5" cy="10" r="1.5" /></svg>
      </IconButton>
    </beautiful-demo-row>
  );
}
