import { Button } from "beautiful-ui-solid";

export default function Pill() {
  return (
    <beautiful-demo-row>
      <Button variant="primary" color="accent" shape="pill">Publish</Button>
      <Button shape="pill">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z" /></svg>
        Add a contact form
      </Button>
      <Button shape="pill">Start a blog</Button>
    </beautiful-demo-row>
  );
}
