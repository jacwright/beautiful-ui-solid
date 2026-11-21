import { Checkbox, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

const submissions = [
  { id: "1", from: "Maya Chen", sent: "Today, 9:41" },
  { id: "2", from: "Omar Haddad", sent: "Yesterday" },
  { id: "3", from: "Lena Fischer", sent: "Oct 30" },
];

export default function Submissions() {
  // The rows that are picked. The header's box is on when every row is, and mixed when only some are.
  const [picked, setPicked] = createSignal(["2"]);
  const toggle = (id: string, checked: boolean) =>
    setPicked((now) => (checked ? [...now, id] : now.filter((other) => other !== id)));
  const all = () => picked().length === submissions.length;
  const some = () => picked().length > 0 && !all();

  return (
    <Table aria-label="Form submissions">
      <TableHead>
        <TableRow>
          <TableHeader>
            <Checkbox
              aria-label="Select every submission"
              aria-controls={submissions.map((row) => `submission-${row.id}`).join(" ")}
              checked={all()}
              indeterminate={some()}
              onChange={(event) => setPicked(event.currentTarget.checked ? submissions.map((row) => row.id) : [])}
            />
          </TableHeader>
          <TableHeader>From</TableHeader>
          <TableHeader>Sent</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <For each={submissions}>
          {(row) => (
            <TableRow>
              <TableCell>
                <Checkbox
                  id={`submission-${row.id}`}
                  aria-label={`Select the submission from ${row.from}`}
                  checked={picked().includes(row.id)}
                  onChange={(event) => toggle(row.id, event.currentTarget.checked)}
                />
              </TableCell>
              <TableCell>{row.from}</TableCell>
              <TableCell>{row.sent}</TableCell>
            </TableRow>
          )}
        </For>
      </TableBody>
    </Table>
  );
}
