import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "beautiful-ui-solid";

export default function InATable() {
  return (
    <Table plain aria-label="Invoices">
      <TableHead>
        <TableRow>
          <TableHeader>Invoice</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader>Amount</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>INV-1042</TableCell>
          <TableCell>Harbor Coffee</TableCell>
          <TableCell>$1,280.00</TableCell>
          <TableCell>
            <Badge color="green">Paid</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV-1043</TableCell>
          <TableCell>Northwind Studio</TableCell>
          <TableCell>$640.00</TableCell>
          <TableCell>
            <Badge color="yellow">Pending</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV-1044</TableCell>
          <TableCell>Juniper &amp; Co.</TableCell>
          <TableCell>$2,150.00</TableCell>
          <TableCell>
            <Badge color="red">Overdue 12 days</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV-1045</TableCell>
          <TableCell>Kestrel Labs</TableCell>
          <TableCell>$300.00</TableCell>
          <TableCell>
            <Badge>Draft</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
