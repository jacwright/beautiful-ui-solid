import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";
import { For } from "solid-js";

const sources = [
  ["Search", "5,204", "312", "6.0%"],
  ["Newsletter", "2,871", "402", "14.0%"],
  ["Social", "2,113", "96", "4.5%"],
  ["Direct", "1,690", "141", "8.3%"],
  ["Referral", "602", "58", "9.6%"],
];

export default function Glass() {
  return (
    <beautiful-demo-stage>
      <Table dense caption="Spring launch, this week">
        <TableHead>
          <TableRow>
            <TableHeader>Source</TableHeader>
            <TableHeader align="end">Visitors</TableHeader>
            <TableHeader align="end">Sign-ups</TableHeader>
            <TableHeader align="end">Conversion</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <For each={sources}>
            {([source, ...numbers]) => (
              <TableRow>
                <TableCell>{source}</TableCell>
                <For each={numbers}>{(number) => <TableCell align="end">{number}</TableCell>}</For>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </beautiful-demo-stage>
  );
}
