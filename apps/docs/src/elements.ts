/**
 * The docs site's own elements, for TSX. Each is a styling hook in docs.css, where a div or span
 * would otherwise go: the kit's markup never uses either (CLAUDE.md, Principles). The kit's own
 * elements are declared beside their components in src/.
 */
declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      /** The page: header, nav and main. */
      "beautiful-site": HTMLAttributes<HTMLElement>;
      /** Holds a spec table, and scrolls it sideways on a phone. */
      "beautiful-table-scroll": HTMLAttributes<HTMLElement>;
      /** An example's live preview, above its markup. */
      "beautiful-example-preview": HTMLAttributes<HTMLElement> & { innerHTML?: string };
      /** One example in a test harness, named by data-example. */
      "beautiful-example": HTMLAttributes<HTMLElement>;
      /** Bright content for glass to blur. */
      "beautiful-demo-stage": HTMLAttributes<HTMLElement>;
      /** Blocks one under another. */
      "beautiful-demo-stack": HTMLAttributes<HTMLElement>;
      /** One line of controls. */
      "beautiful-demo-row": HTMLAttributes<HTMLElement>;
      /** A page's outline of headings. */
      "beautiful-demo-outline": HTMLAttributes<HTMLElement>;
      /** A person's name and a line under it, beside their avatar. */
      "beautiful-demo-name": HTMLAttributes<HTMLElement>;
      /** A landing page's top. */
      "beautiful-demo-hero": HTMLAttributes<HTMLElement>;
      /** A phone-sized frame, for a layout that changes on a phone. */
      "beautiful-demo-phone": HTMLAttributes<HTMLElement>;
      "beautiful-demo-sidebar": HTMLAttributes<HTMLElement>;
      "beautiful-demo-sections": HTMLAttributes<HTMLElement>;
      "beautiful-demo-rows": HTMLAttributes<HTMLElement>;
      "beautiful-demo-entry": HTMLAttributes<HTMLElement>;
      "beautiful-demo-cards": HTMLAttributes<HTMLElement>;
      "beautiful-demo-prose": HTMLAttributes<HTMLElement>;
      "beautiful-demo-person": HTMLAttributes<HTMLElement>;
      /** Context menu's list of a site's pages, and one page in it. */
      "beautiful-demo-pages": HTMLAttributes<HTMLElement>;
      "beautiful-demo-page": HTMLAttributes<HTMLElement>;
      /** A color's chip, in the Illustrations palette. */
      "beautiful-swatch": HTMLAttributes<HTMLElement>;
      /** The Shadows page's row of depths, on the page's own canvas. */
      "beautiful-elevations": HTMLAttributes<HTMLElement>;
      /** One depth: a rounded rectangle that wears the shadow named by data-elevation. */
      "beautiful-elevation": HTMLAttributes<HTMLElement>;
      /** The home page's cards to the pages to read first, as many to a row as fit. */
      "beautiful-home-starts": HTMLAttributes<HTMLElement>;
      /** A narrow column, for a component that folds up in one. */
      "beautiful-demo-narrow": HTMLAttributes<HTMLElement>;
    }
  }
}

export {};
