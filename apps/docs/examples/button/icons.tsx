import { Button } from "beautiful-ui-solid";

export default function Icons() {
  return (
    <beautiful-demo-row>
      <Button variant="primary" color="accent">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
        New site
      </Button>
      <Button>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3v10M6 9l4 4 4-4M4 14v2.5h12V14" /></svg>
        Download files
      </Button>
      <Button variant="tertiary">
        Next step
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
      </Button>
    </beautiful-demo-row>
  );
}
