import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";
import { For } from "solid-js";

const deploys = [
  { id: 142, name: "New pricing page", author: "Dana", pages: "3", when: "10 minutes ago" },
  { id: 141, name: "Fix footer links", author: "Claude", pages: "12", when: "2 hours ago" },
  { id: 140, name: "Spring launch", author: "Sam", pages: "27", when: "Yesterday" },
];

export default function Links() {
  return (
    <Table aria-label="Deploys">
      <TableHead>
        <TableRow>
          <TableHeader>Deploy</TableHeader>
          <TableHeader>Author</TableHeader>
          <TableHeader align="end">Pages changed</TableHeader>
          <TableHeader align="end">When</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <For each={deploys}>
          {(row) => (
            <TableRow href={`#deploy-${row.id}`}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.author}</TableCell>
              <TableCell align="end">{row.pages}</TableCell>
              <TableCell align="end">{row.when}</TableCell>
            </TableRow>
          )}
        </For>
      </TableBody>
    </Table>
  );
}
