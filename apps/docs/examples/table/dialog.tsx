import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "beautiful-ui-solid";

export default function InADialog() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="dns-records" command="show-modal">DNS records</Button>
      </beautiful-demo-stage>
      <Dialog id="dns-records" size="lg">
        <DialogTitle>Connect springlaunch.com</DialogTitle>
        <DialogDescription>Add these records where you bought the domain. Changes can take an hour to reach everyone.</DialogDescription>
        <DialogBody>
          <Table aria-label="DNS records">
            <TableHead>
              <TableRow>
                <TableHeader>Type</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Value</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>A</TableCell>
                <TableCell>@</TableCell>
                <TableCell><code>192.0.2.10</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>CNAME</TableCell>
                <TableCell>www</TableCell>
                <TableCell><code>springlaunch.example.com</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TXT</TableCell>
                <TableCell>_verify</TableCell>
                <TableCell><code>verify=4f9c2a</code></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogBody>
        <DialogActions>
          <Button commandfor="dns-records" command="close">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
