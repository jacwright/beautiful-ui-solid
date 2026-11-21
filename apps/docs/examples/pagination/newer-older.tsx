import { Pagination, PaginationNext, PaginationPrevious } from "beautiful-ui-solid";

export default function NewerOlder() {
  return (
    <Pagination aria-label="Log pages">
      <PaginationPrevious href="#newer">Newer</PaginationPrevious>
      <PaginationNext href="#older">Older</PaginationNext>
    </Pagination>
  );
}
