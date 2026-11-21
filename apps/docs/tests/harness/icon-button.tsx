import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { IconButton } from "beautiful-ui-solid";
import { renderHarness } from "./examples.tsx";

const line = { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" } as const;

renderHarness("icon-button", () => (
  <form data-example="form" onSubmit={(event) => event.preventDefault()}>
    <IconButton label="Refresh preview"><svg {...line}><path d="M15.5 10a5.5 5.5 0 1 1-1.6-3.9M16 3.5V7h-3.5" /></svg></IconButton>
    <IconButton label="Save" type="submit"><svg {...line}><path d="M4.5 10.5 8 14l7.5-8" /></svg></IconButton>
    <IconButton label="Undo" shortcut="⌘Z" aria-keyshortcuts="Meta+Z" variant="tertiary"><svg {...line}><path d="M7.5 5 4 8.5 7.5 12M4 8.5h8a4 4 0 0 1 0 8h-2" /></svg></IconButton>
    {/* An icon whose svg has a title is still named by the tip. */}
    <IconButton label="Delete" variant="tertiary">
      <svg {...line}><title>Trash can</title><path d="M4 6h12M8 6V4.5h4V6M5.5 6l.7 9.5h7.6l.7-9.5" /></svg>
    </IconButton>
  </form>
));
