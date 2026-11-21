import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The blocks for the tests that click rows: links that arrive late, and a control in a linked row.
// The sortable example sorts for real, so the sort tests use it.

/** Deploys whose links arrive after the rows, as from a fetch, and whose first cell is drawn again. */
function LateLinks() {
  const [loaded, setLoaded] = createSignal(false);
  const [renamed, setRenamed] = createSignal(false);
  return (
    <>
      <Table aria-label="Deploys, loading">
        <TableBody>
          <TableRow href={loaded() ? "#deploy-142" : undefined}>
            <Show when={renamed()} fallback={<TableCell>New pricing page</TableCell>}>
              <TableCell>Pricing, take two</TableCell>
            </Show>
            <TableCell>Dana</TableCell>
          </TableRow>
          <TableRow href="#deploy-141" onClick={(event: MouseEvent) => event.preventDefault()}>
            <TableCell>Kept back</TableCell>
            <TableCell>Prevented</TableCell>
          </TableRow>
          <TableRow href="#deploy-140" tabindex="-1">
            <TableCell>Roving</TableCell>
            <TableCell>Focusable row</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <input aria-label="Elsewhere" value="Some words to select" />
      <Button onClick={() => setLoaded(true)}>Load links</Button>
      <Button onClick={() => setRenamed(true)}>Rename</Button>
    </>
  );
}

function RollBack() {
  const [status, setStatus] = createSignal("");
  return (
    <>
      <Table aria-label="Deploys you can roll back to">
        <TableHead>
          <TableRow>
            <TableHeader>Deploy</TableHeader>
            <TableHeader align="end">Action</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow href="#deploy-140">
            <TableCell>Spring launch</TableCell>
            <TableCell align="end">
              <Button onClick={() => setStatus("Rolled back")}>Roll back</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p role="status">{status()}</p>
    </>
  );
}

renderHarness("table", () => (
  <>
    <beautiful-example data-example="live-late">
      <LateLinks />
    </beautiful-example>
    <beautiful-example data-example="live-links">
      <RollBack />
    </beautiful-example>
  </>
));
