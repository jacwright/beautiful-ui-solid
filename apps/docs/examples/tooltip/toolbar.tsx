import { Button, IconButton, Tooltip } from "beautiful-ui-solid";

export default function Toolbar() {
  return (
    <beautiful-demo-row role="toolbar" aria-label="Editing">
      <IconButton tooltipId="tip-undo" label="Undo" shortcut="⌘Z" variant="tertiary" aria-keyshortcuts="Meta+Z">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 5 4 8.5 7.5 12M4 8.5h8a4 4 0 0 1 0 8h-2" /></svg>
      </IconButton>
      <IconButton tooltipId="tip-redo" label="Redo" shortcut="⇧⌘Z" variant="tertiary" aria-keyshortcuts="Shift+Meta+Z">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 5 16 8.5 12.5 12M16 8.5H8a4 4 0 0 0 0 8h2" /></svg>
      </IconButton>
      {/* A bare Tooltip around a Button with no words names it too, as IconButton does. */}
      <Tooltip id="tip-copy" content="Copy link">
        <Button variant="tertiary" data-icon-button="">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2L10 5.8M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2L10 14.2" /></svg>
        </Button>
      </Tooltip>
      <IconButton tooltipId="tip-delete" label="Delete page" variant="tertiary" color="danger">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h12M8 6V4.5h4V6M5.5 6l.7 9.5h7.6l.7-9.5" /></svg>
      </IconButton>
    </beautiful-demo-row>
  );
}
