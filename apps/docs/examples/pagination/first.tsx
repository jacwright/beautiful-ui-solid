import { Pagination } from "beautiful-ui-solid";

export default function First() {
  return <Pagination page={1} count={12} href={(page) => `#page-${page}`} aria-label="Site pages" />;
}
