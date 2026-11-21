import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";
import { createMemo, createSignal, For } from "solid-js";

const domains = [
  { domain: "springlaunch.com", site: "Spring launch", visits: 12480, added: "2026-03-03", shown: "Mar 3, 2026" },
  { domain: "docs.acme.com", site: "Docs", visits: 3912, added: "2026-01-18", shown: "Jan 18, 2026" },
  { domain: "www.springlaunch.com", site: "Spring launch", visits: 1207, added: "2026-03-03", shown: "Mar 3, 2026" },
  { domain: "careers.acme.com", site: "Careers", visits: 0, added: "2026-10-30", shown: "Oct 30, 2026" },
];

type Column = "domain" | "site" | "visits" | "added";

export default function Sortable() {
  const [by, setBy] = createSignal<Column>("visits");
  const [direction, setDirection] = createSignal<"ascending" | "descending">("descending");
  // The table says which column was picked. The page sorts its own rows.
  const rows = createMemo(() => {
    const key = by();
    const sign = direction() === "ascending" ? 1 : -1;
    return [...domains].sort((a, b) => (a[key] < b[key] ? -sign : a[key] > b[key] ? sign : 0));
  });
  const header = (column: Column, label: string, align?: "end") => (
    <TableHeader
      align={align}
      sort={by() === column ? direction() : "none"}
      onSort={(next) => {
        setBy(column);
        setDirection(next);
      }}
    >
      {label}
    </TableHeader>
  );
  return (
    <Table aria-label="Domains">
      <TableHead>
        <TableRow>
          {header("domain", "Domain")}
          {header("site", "Site")}
          {header("visits", "Visits", "end")}
          {header("added", "Added", "end")}
        </TableRow>
      </TableHead>
      <TableBody>
        <For each={rows()}>
          {(row) => (
            <TableRow>
              <TableCell>{row.domain}</TableCell>
              <TableCell>{row.site}</TableCell>
              <TableCell align="end">{row.visits.toLocaleString("en-US")}</TableCell>
              <TableCell align="end">{row.shown}</TableCell>
            </TableRow>
          )}
        </For>
      </TableBody>
    </Table>
  );
}
