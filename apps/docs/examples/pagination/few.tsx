import { Pagination } from "beautiful-ui-solid";

export default function Few() {
  return <Pagination page={2} count={4} href={(page) => `#page-${page}`} aria-label="Member pages" />;
}
