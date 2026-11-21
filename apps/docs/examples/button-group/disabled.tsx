import { Button, ButtonGroup } from "beautiful-ui-solid";

export default function Disabled() {
  return (
    <ButtonGroup aria-label="History">
      <Button>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7.5 5L4 8.5 7.5 12M4 8.5h8a4 4 0 0 1 0 8h-2" />
        </svg>
        Undo
      </Button>
      <Button disabled>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12.5 5L16 8.5 12.5 12M16 8.5H8a4 4 0 0 0 0 8h2" />
        </svg>
        Redo
      </Button>
    </ButtonGroup>
  );
}
