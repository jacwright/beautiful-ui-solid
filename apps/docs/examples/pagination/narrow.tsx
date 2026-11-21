import { Pagination } from "beautiful-ui-solid";

export default function Narrow() {
  return (
    <beautiful-demo-narrow>
      <Pagination page={6} count={12} href={(page) => `#page-${page}`} aria-label="Order pages" />
    </beautiful-demo-narrow>
  );
}
