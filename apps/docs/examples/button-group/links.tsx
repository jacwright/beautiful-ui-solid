import { Button, ButtonGroup } from "beautiful-ui-solid";

export default function Links() {
  return (
    <ButtonGroup aria-label="Pages of entries">
      <Button href="#entries-page-1">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 5l-5 5 5 5" />
        </svg>
        Newer
      </Button>
      <Button href="#entries-page-3">
        Older
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 5l5 5-5 5" />
        </svg>
      </Button>
    </ButtonGroup>
  );
}
