import { Pagination } from "beautiful-ui-solid";

export default function Lead() {
  return <Pagination page={6} count={12} href={(page) => `#lead-page-${page}`} aria-label="Pages of sites" />;
}
