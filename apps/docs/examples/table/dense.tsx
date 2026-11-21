import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";
import { For } from "solid-js";

const pages = [
  ["/", "48,210", "31,904", "38.2%", "1:12"],
  ["/pricing", "14,388", "11,021", "24.7%", "2:05"],
  ["/blog/agents-build-sites", "9,876", "8,410", "61.0%", "3:41"],
  ["/docs/quickstart", "7,502", "5,233", "19.8%", "4:27"],
  ["/changelog", "4,119", "3,870", "52.3%", "0:58"],
  ["/about", "2,961", "2,744", "44.1%", "0:47"],
  ["/careers", "1,208", "1,113", "33.9%", "1:31"],
  ["/legal/privacy", "411", "398", "71.5%", "0:22"],
];

export default function Dense() {
  return (
    <Table dense striped caption="Top pages, last 30 days">
      <TableHead>
        <TableRow>
          <TableHeader>Page</TableHeader>
          <TableHeader align="end">Views</TableHeader>
          <TableHeader align="end">Visitors</TableHeader>
          <TableHeader align="end">Bounce rate</TableHeader>
          <TableHeader align="end">Avg. time</TableHeader>
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
