import type { JSX } from "@solidjs/web";
import { For, omit, Show } from "solid-js";

/**
 * Pagination: links to the pages of a long list, on a labelled <nav data-pagination>. It adds no
 * keys: every part is a plain link, and the browser gives it Tab and Enter. The look is CSS
 * (styles/elements/pagination.css), which also folds the row up where it's narrow. Given a page, a
 * count and an href, Pagination works out which pages to show and writes its parts; given children,
 * it is the nav around them. The spec is the docs site's Pagination page.
 */

type NavProps = JSX.HTMLAttributes<HTMLElement>;

/** Given a page, a count and an href, Pagination writes its own parts. */
type PaginationOfPages = Omit<NavProps, "children"> & {
  /** The current page, counting from 1. */
  page: number;
  /** How many pages there are. Under 2, Pagination renders nothing. */
  count: number;
  /** Each page's address. Previous and Next use it too. */
  href: (page: number) => string;
  children?: never;
};

/** Given children, it is the nav around them, for a row such as Newer and Older. */
type PaginationOfParts = NavProps & { page?: never; count?: never; href?: never };

export type PaginationProps = PaginationOfPages | PaginationOfParts;

export function Pagination(props: PaginationProps) {
  const rest = omit(props, "page", "count", "href", "children");
  const count = () => props.count;
  // A page that isn't a number, such as one read from ?page=abc, is the first.
  const page = () => {
    const at = Math.round(props.page ?? 1);
    return Math.min(Math.max(1, Number.isFinite(at) ? at : 1), props.count ?? 1);
  };
  const href = (to: number) => props.href!(to);

  const nav = (children: JSX.Element) => (
    <nav aria-label="Pages" {...rest} data-pagination="">
      {children}
    </nav>
  );

  return (
    <Show when={count() !== undefined} fallback={nav(props.children)}>
      <Show when={(count() ?? 0) >= 2}>
        {nav(
          <>
            <PaginationPrevious href={page() > 1 ? href(page() - 1) : null} />
            <PaginationList>
              <For each={pagesAround(page(), count()!)}>
                {(item) => (
                  <Show when={item !== "gap"} fallback={<PaginationGap />}>
                    <PaginationPage href={href(item as number)} current={item === page()}>
                      {item as number}
                    </PaginationPage>
                  </Show>
                )}
              </For>
            </PaginationList>
            <PaginationNext href={page() < count()! ? href(page() + 1) : null} />
          </>,
        )}
      </Show>
    </Show>
  );
}

/**
 * The pages to show: the first, the last, the current one and one on each side. A gap stands for
 * two or more pages left out, never one, so from seven pages on there are always seven slots.
 */
function pagesAround(page: number, count: number): (number | "gap")[] {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (count <= 7) return range(1, count);
  if (page <= 4) return [...range(1, 5), "gap", count];
  if (page >= count - 3) return [1, "gap", ...range(count - 4, count)];
  return [1, "gap", page - 1, page, page + 1, "gap", count];
}

export type PaginationArrowProps = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** Where it goes. null or left out where there is no page that way, which fades it. */
  href?: string | null;
};

/**
 * Previous or Next. With no page that way it is an <a> with no href: not a link, so it can't be
 * focused or followed. role="link" and aria-disabled keep it read as a link that's unavailable.
 */
function arrow(rel: "prev" | "next", words: string, props: PaginationArrowProps) {
  const rest = omit(props, "href", "children");
  const off = () => props.href == null;
  return (
    <a
      {...rest}
      href={props.href ?? undefined}
      rel={off() ? undefined : rel}
      role={off() ? "link" : undefined}
      aria-disabled={off() ? "true" : undefined}
    >
      {props.children ?? words}
    </a>
  );
}

/** The first thing in the row, with an arrow. Its words default to "Previous". */
export function PaginationPrevious(props: PaginationArrowProps) {
  return arrow("prev", "Previous", props);
}

/** The last thing in the row, with an arrow. Its words default to "Next". */
export function PaginationNext(props: PaginationArrowProps) {
  return arrow("next", "Next", props);
}

/** The pages, in a row between Previous and Next. */
export function PaginationList(props: JSX.HTMLAttributes<HTMLElement>) {
  return <beautiful-pagination-list {...props} />;
}

export type PaginationPageProps = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  href: string;
  /** The page you're on. Writes aria-current="page", which draws its pane. */
  current?: boolean;
  /** The page's number. It names the link "Page 6". */
  children: number;
};

/** One page's link. */
export function PaginationPage(props: PaginationPageProps) {
  const rest = omit(props, "current", "children");
  return (
    <a aria-label={`Page ${props.children}`} {...rest} aria-current={props.current ? "page" : undefined}>
      {props.children}
    </a>
  );
}

/** The pages left out between two links. */
export function PaginationGap(props: JSX.HTMLAttributes<HTMLElement>) {
  return <beautiful-pagination-gap {...props}>{props.children ?? "…"}</beautiful-pagination-gap>;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-pagination-list": HTMLAttributes<HTMLElement>;
      "beautiful-pagination-gap": HTMLAttributes<HTMLElement>;
    }
  }
}
