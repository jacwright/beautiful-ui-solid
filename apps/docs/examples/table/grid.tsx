import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";
import { For } from "solid-js";

const plans = [
  ["Sites", "1", "10", "Unlimited"],
  ["Custom domains", "1", "10", "Unlimited"],
  ["Form submissions a month", "100", "5,000", "50,000"],
  ["Scheduled releases", "No", "Yes", "Yes"],
  ["Price", "Free", "$29 a month", "$99 a month"],
];

export default function Grid() {
  return (
    <Table grid aria-label="Compare plans">
      <TableHead>
        <TableRow>
          <TableCell />
          <TableHeader>Starter</TableHeader>
          <TableHeader>Pro</TableHeader>
          <TableHeader>Team</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <For each={plans}>
          {([feature, ...values]) => (
            <TableRow>
              <TableHeader>{feature}</TableHeader>
              <For each={values}>{(value) => <TableCell>{value}</TableCell>}</For>
            </TableRow>
          )}
        </For>
      </TableBody>
    </Table>
  );
}
