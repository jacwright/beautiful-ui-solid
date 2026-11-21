import { IconButton } from "beautiful-ui-solid";

export default function Disabled() {
  return (
    <beautiful-demo-row>
      <IconButton label="Previous page" tooltipId="tip-previous-page" disabled>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5 6.5 10l5.5 5.5" /></svg>
      </IconButton>
      <IconButton label="Next page" tooltipId="tip-next-page">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4.5l5.5 5.5L8 15.5" /></svg>
      </IconButton>
      <IconButton label="Delete" tooltipId="tip-delete-disabled" variant="tertiary" color="danger" disabled>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 5.5l.8 10a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4l.8-10M8.5 9v4.5M11.5 9v4.5" /></svg>
      </IconButton>
    </beautiful-demo-row>
  );
}
