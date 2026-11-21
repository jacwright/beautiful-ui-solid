import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";
import { For } from "solid-js";

const pages = [
  ["/", "48,210", "31,904"],
  ["/pricing", "14,388", "11,021"],
  ["/changelog", "4,119", "3,870"],
];

export default function Lead() {
  return (
    <Table caption="Top pages, last 30 days">
      <TableHead>
        <TableRow>
          <TableHeader>Page</TableHeader>
          <TableHeader align="end">Views</TableHeader>
          <TableHeader align="end">Visitors</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <For each={pages}>
          {([page, ...numbers]) => (
            <TableRow>
              <TableCell>{page}</TableCell>
              <For each={numbers}>{(number) => <TableCell align="end">{number}</TableCell>}</For>
            </TableRow>
          )}
        </For>
      </TableBody>
    </Table>
  );
}
