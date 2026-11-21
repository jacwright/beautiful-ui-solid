import { Pagination } from "beautiful-ui-solid";

export default function Middle() {
  return <Pagination page={6} count={12} href={(page) => `#page-${page}`} />;
}
