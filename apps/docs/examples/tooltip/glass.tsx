import { Button, Tooltip } from "beautiful-ui-solid";

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <beautiful-demo-row role="toolbar" aria-label="Site">
        <Tooltip id="tip-stage-share" content="Share">
          <Button>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3v10M6 7l4-4 4 4M4 12v4h12v-4" /></svg>
          </Button>
        </Tooltip>
        <Tooltip id="tip-stage-visits" content="Since it went live 2 hours ago">
          <Button>1,284 visits</Button>
        </Tooltip>
      </beautiful-demo-row>
    </beautiful-demo-stage>
  );
}
