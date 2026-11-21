import { Button } from "beautiful-ui-solid";

export default function Link() {
  return (
    <beautiful-demo-row>
      <Button href="#pricing" variant="primary" color="accent">See pricing</Button>
      <Button href="#docs">
        Read the docs
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 4.5H4.5v11h11v-4M11.5 4.5h4v4M15.5 4.5 9 11" /></svg>
      </Button>
    </beautiful-demo-row>
  );
}
