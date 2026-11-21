import { Range } from "beautiful-ui-solid";

export default function Alone() {
  return (
    <beautiful-demo-row>
      <svg class="demo-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
        <circle cx="9" cy="9" r="5.5" />
        <path d="m13 13 3.5 3.5M6.5 9h5" />
      </svg>
      <Range class="demo-zoom" name="zoom" min={25} max={200} step={25} value={100} aria-label="Zoom" format={(v) => `${v}%`} />
      <svg class="demo-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
        <circle cx="9" cy="9" r="5.5" />
        <path d="m13 13 3.5 3.5M6.5 9h5M9 6.5v5" />
      </svg>
    </beautiful-demo-row>
  );
}
