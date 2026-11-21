import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";

export default function Empty() {
  return (
    <Table aria-label="Form submissions">
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader align="end">Received</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colspan={3} empty>
            No submissions yet. They show here as visitors send the form.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
