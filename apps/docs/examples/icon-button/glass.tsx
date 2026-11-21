import { IconButton } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <beautiful-demo-row>
        <IconButton label="Previous image" tooltipId="tip-previous-image">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5 6.5 10l5.5 5.5" /></svg>
        </IconButton>
        <IconButton label="Next image" tooltipId="tip-next-image">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4.5l5.5 5.5L8 15.5" /></svg>
        </IconButton>
        <IconButton label="Add image" tooltipId="tip-add-image" variant="primary" color="accent">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
        </IconButton>
        <IconButton label="Close" tooltipId="tip-close" variant="tertiary">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" /></svg>
        </IconButton>
      </beautiful-demo-row>
    </beautiful-demo-stage>
  );
}
