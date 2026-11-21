import { Field, Input, InputGroup, Label } from "beautiful-ui-solid";

export default function Icons() {
  return (
    <form>
      <Field id="find-page">
        <Label>Find a page</Label>
        <InputGroup>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="m13 13 3.5 3.5" /></svg>
          <Input type="search" name="q" placeholder="Pricing, About, Contact…" />
        </InputGroup>
      </Field>
      <Field id="redirect-to">
        <Label>Redirect to</Label>
        <InputGroup>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 11.5a3 3 0 0 0 4.24 0l2.5-2.5a3 3 0 0 0-4.24-4.24l-.75.75M11.5 8.5a3 3 0 0 0-4.24 0l-2.5 2.5a3 3 0 0 0 4.24 4.24l.75-.75" /></svg>
          <Input type="url" name="url" value="https://springlaunch.com/summer" />
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3 3 7-7" /></svg>
        </InputGroup>
      </Field>
    </form>
  );
}
