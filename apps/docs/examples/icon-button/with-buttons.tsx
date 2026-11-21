import { Button, IconButton } from "beautiful-ui-solid";

export default function WithButtons() {
  return (
    <beautiful-demo-row>
      <IconButton label="Refresh preview" tooltipId="tip-refresh-preview">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 10a5.5 5.5 0 1 1-1.6-3.9M16 3.5V7h-3.5" /></svg>
      </IconButton>
      <IconButton label="Copy link" tooltipId="tip-copy-link">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9" /></svg>
      </IconButton>
      <Button variant="primary" color="accent">Publish</Button>
    </beautiful-demo-row>
  );
}
