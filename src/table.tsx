import type { JSX } from "@solidjs/web";
import { type Accessor, createContext, createSignal, omit, onSettled, Show, useContext } from "solid-js";
import { forward } from "./popover.tsx";

/**
 * Table: rows of data on a native <table>, held in a <beautiful-table> pane that scrolls sideways
 * when the table is wider than it. The look is CSS (styles/elements/table.css), keyed on data-*
 * attributes left out at their defaults, so the markup matches a hand-written table. The spec is
 * the docs site's Table page, after Catalyst's Table and APG's Table pattern.
 *
 * Two things here need JS, because the platform lacks them. A row with href follows its first
 * cell's link on a click anywhere in it: a link stretched over a <tr> in CSS covers the whole
 * table in Safari before 2026. And the pane takes focus while it scrolls sideways, so a keyboard
 * can scroll it where the browser doesn't make a scroller focusable on its own (Safari).
 */

export type TableProps = JSX.HTMLAttributes<HTMLTableElement> & {
  /** 32px rows, a menu item's height; 44px on a touch screen. */
  dense?: boolean;
  /** Tints every other row in the body. */
  striped?: boolean;
  /** Lines between the columns as well as the rows. */
  grid?: boolean;
  /** No pane: the rows sit on what holds the table. A table in a Dialog, a Popover or a Card is plain already. */
  plain?: boolean;
  /** A visible title above the rows, which names the table too. Without it, pass aria-label or aria-labelledby. */
  caption?: JSX.Element;
};

const flag = (on: boolean | undefined) => (on ? "" : undefined);

export function Table(props: TableProps) {
  const rest = omit(props, "dense", "striped", "grid", "plain", "caption", "children");
  let pane: HTMLElement | undefined;

  /*
   * The pane takes focus only while the table is wider than it, so a table that fits isn't a tab
   * stop. While it scrolls it is a region named as the table is, so focus on it says what it holds.
   * It keeps its focus if it stops scrolling while focused, and lets go when focus leaves.
   */
  onSettled(() => {
    const table = pane?.querySelector("table");
    if (!pane || !table) return;
    const scroller = pane;
    const check = () => {
      if (scroller.scrollWidth > scroller.clientWidth) {
        const label = table.getAttribute("aria-label") ?? table.querySelector("caption")?.textContent ?? null;
        const labelledby = table.getAttribute("aria-labelledby");
        const set = (name: string, value: string | null) =>
          value === null ? scroller.removeAttribute(name) : scroller.setAttribute(name, value);
        set("tabindex", "0");
        set("aria-labelledby", labelledby);
        set("aria-label", labelledby ? null : label);
        set("role", labelledby || label ? "region" : null);
      } else if (document.activeElement !== scroller) {
        for (const name of ["tabindex", "role", "aria-label", "aria-labelledby"]) scroller.removeAttribute(name);
      }
    };
    const observer = new ResizeObserver(check);
    observer.observe(scroller);
    observer.observe(table);
    scroller.addEventListener("focusout", check);
    return () => {
      observer.disconnect();
      scroller.removeEventListener("focusout", check);
    };
  });

  return (
    <beautiful-table
      ref={(el: HTMLElement) => (pane = el)}
      data-dense={flag(props.dense)}
      data-striped={flag(props.striped)}
      data-grid={flag(props.grid)}
      data-plain={flag(props.plain)}
    >
      <table {...rest}>
        <Show when={props.caption} keyed>
          {(caption) => <caption>{caption}</caption>}
        </Show>
        {props.children}
      </table>
    </beautiful-table>
  );
}

/** Whether a header cell heads a column, in the head, or a row, in the body. */
const SectionContext = createContext<"head" | "body">("body");

export function TableHead(props: JSX.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead {...props}>
      <SectionContext value="head">{props.children}</SectionContext>
    </thead>
  );
}

export function TableBody(props: JSX.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

/**
 * A row's link, and the row's first cell, which takes it. The first cell drawn claims it, so the
 * link is there from the first render. Once on the page, the row reads its first cell from the
 * DOM, so a cell that is drawn again, such as under a Show, takes the link where it lands.
 */
type RowLink = {
  href: Accessor<string | undefined>;
  target: Accessor<string | undefined>;
  first: Accessor<Element | null>;
  claim: () => boolean;
};

const RowContext = createContext<RowLink | null>(null);

export type TableRowProps = JSX.HTMLAttributes<HTMLTableRowElement> & {
  /** Makes the row a link: its first cell's content links here, and a click anywhere in the row follows it. */
  href?: string;
  /** The link's target, such as _blank. */
  target?: string;
};

/** What a click in a row is for already: a control in the row, or the link itself. */
const controls = "a[href], button, input, select, textarea, label, summary, [role='button'], [tabindex]";

export function TableRow(props: TableRowProps) {
  const rest = omit(props, "href", "target", "children", "ref");

  function follow(event: MouseEvent) {
    const row = event.currentTarget as HTMLTableRowElement;
    const link = row.querySelector<HTMLAnchorElement>("a[data-row-link]");
    if (!link) return;
    // Only a control inside the row, not the row itself: the pane around it takes a tabindex while it scrolls.
    const control = (event.target as Element).closest(controls);
    if (control && control !== row && row.contains(control)) return;
    // A drag that selects text in the row isn't a click on it.
    const selection = getSelection();
    if (selection && !selection.isCollapsed && selection.anchorNode && row.contains(selection.anchorNode)) return;
    const modified = event.metaKey || event.ctrlKey || event.shiftKey;
    const newTab = event.button === 1 || (event.button === 0 && modified);
    if (event.button !== 0 && !newTab) return;
    // After the click has passed through every handler, Solid's delegated onClick included, so a
    // handler that prevents it stops the row from following its link.
    setTimeout(() => {
      if (event.defaultPrevented) return;
      // The link's own click, so a router that listens for clicks on links follows it too.
      if (!newTab) link.click();
      else window.open(link.href, "_blank", "noopener");
    });
  }

  const [first, setFirst] = createSignal<Element | null>(null);
  let claimed = false;
  const claim = () => !claimed && (claimed = true);
  let tr: HTMLTableRowElement | undefined;

  // Wired on every row, so a row that gets its href later follows it: a row without a link ignores clicks.
  function ref(el: HTMLTableRowElement) {
    tr = el;
    forward(props.ref, el);
    el.addEventListener("click", follow);
    el.addEventListener("auxclick", follow);
  }

  onSettled(() => {
    if (!tr) return;
    const row = tr;
    const read = () => setFirst(row.firstElementChild);
    read();
    const observer = new MutationObserver(read);
    observer.observe(row, { childList: true });
    return () => observer.disconnect();
  });

  return (
    <tr {...rest} ref={ref}>
      <RowContext value={{ href: () => props.href, target: () => props.target, first, claim }}>{props.children}</RowContext>
    </tr>
  );
}

/** A cell's content: in a linked row's first cell, the row's link. */
function Linked(props: { cell: Accessor<Element | undefined>; children: JSX.Element }) {
  const row = useContext(RowContext);
  if (!row) return <>{props.children}</>;
  const claimed = row.claim();
  const first = () => {
    const cell = row.first();
    return cell ? cell === props.cell() : claimed;
  };
  // Not keyed, so a new href updates the link without drawing the cell's content again.
  return (
    <Show when={row.href() !== undefined && first()} fallback={props.children}>
      <a href={row.href()} target={row.target()} data-row-link="">
        {props.children}
      </a>
    </Show>
  );
}

type Align = { align?: "start" | "end" };

const alignOf = (align: Align["align"]) => (align === "end" ? "end" : undefined);

export type TableHeaderProps = Omit<JSX.ThHTMLAttributes<HTMLTableCellElement>, "align"> &
  Align & {
    /** Makes the column sortable, and says whether the rows are sorted by it. Left out, it can't be sorted. */
    sort?: "ascending" | "descending" | "none";
    /** The direction to sort by next: descending if the rows are ascending by this column, otherwise ascending. */
    onSort?: (next: "ascending" | "descending") => void;
  };

/** A column's header in TableHead, or a row's in TableBody. */
export function TableHeader(props: TableHeaderProps) {
  const section = useContext(SectionContext);
  const rest = omit(props, "align", "sort", "onSort", "children", "ref");
  let cell: HTMLTableCellElement | undefined;
  const sorted = () => (props.sort === "ascending" || props.sort === "descending" ? props.sort : undefined);
  const sort = () => props.onSort?.(props.sort === "ascending" ? "descending" : "ascending");

  return (
    <th
      scope={section === "head" ? "col" : "row"}
      {...rest}
      ref={(el: HTMLTableCellElement) => {
        cell = el;
        forward(props.ref, el);
      }}
      data-align={alignOf(props.align)}
      aria-sort={sorted()}
    >
      <Show when={props.sort !== undefined} fallback={<Linked cell={() => cell}>{props.children}</Linked>}>
        <button type="button" data-sort="" onClick={sort}>
          {props.children}
        </button>
      </Show>
    </th>
  );
}

export type TableCellProps = Omit<JSX.TdHTMLAttributes<HTMLTableCellElement>, "align"> &
  Align & {
    /** The one cell of an empty table, across every column, saying why it's empty. */
    empty?: boolean;
  };

export function TableCell(props: TableCellProps) {
  const rest = omit(props, "align", "empty", "children", "ref");
  let cell: HTMLTableCellElement | undefined;
  return (
    <td
      {...rest}
      ref={(el: HTMLTableCellElement) => {
        cell = el;
        forward(props.ref, el);
      }}
      data-align={alignOf(props.align)}
      data-empty={flag(props.empty)}
    >
      <Linked cell={() => cell}>{props.children}</Linked>
    </td>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-table": HTMLAttributes<HTMLElement>;
    }
  }
}
