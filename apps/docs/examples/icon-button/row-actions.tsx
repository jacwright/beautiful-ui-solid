import { IconButton } from "beautiful-ui-solid";

export default function RowActions() {
  return (
    <beautiful-demo-row>
      <p>Spring launch</p>
      <IconButton label="Rename" tooltipId="tip-rename" variant="tertiary">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 3.5l3 3L7 16H4v-3zM11.5 5.5l3 3" /></svg>
      </IconButton>
      <IconButton label="Duplicate" tooltipId="tip-duplicate" variant="tertiary">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="9.5" height="9.5" rx="1.5" /><path d="M13 7V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v6.5A1.5 1.5 0 0 0 5 13h2" /></svg>
      </IconButton>
      <IconButton label="Delete" tooltipId="tip-delete" variant="tertiary" color="danger">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 5.5l.8 10a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4l.8-10M8.5 9v4.5M11.5 9v4.5" /></svg>
      </IconButton>
    </beautiful-demo-row>
  );
}
