import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";
import { For } from "solid-js";

const sites = [
  { site: "Spring launch", domain: "springlaunch.com", status: "Live", visits: "12,480" },
  { site: "Docs", domain: "docs.acme.com", status: "Live", visits: "3,912" },
  { site: "Careers", domain: "careers.acme.com", status: "Draft", visits: "0" },
  { site: "Holiday sale", domain: "holiday.springlaunch.com", status: "Scheduled", visits: "—" },
];

export default function Sites() {
  return (
    <Table aria-label="Sites">
      <TableHead>
        <TableRow>
          <TableHeader>Site</TableHeader>
          <TableHeader>Domain</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader align="end">Visits this week</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <For each={sites}>
          {(row) => (
            <TableRow>
              <TableCell>{row.site}</TableCell>
              <TableCell>{row.domain}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell align="end">{row.visits}</TableCell>
            </TableRow>
          )}
        </For>
      </TableBody>
    </Table>
  );
}
