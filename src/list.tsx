import type { JSX } from "@solidjs/web";
import { dynamic } from "@solidjs/web";
import { Match, omit, Show, Switch } from "solid-js";

/**
 * List: a native <ul> or <ol>, in two looks. It adds no behavior: a list is document structure,
 * not a widget. The look is CSS (styles/elements/list.css). Bullets are every bare list's look, so
 * the markup matches a hand-written one. Rows are data-variant="rows". Rows and checks say
 * role="list", because Safari drops a list's role when its markers are hidden. The spec is the
 * docs site's List page.
 */

type ListBase = Omit<JSX.HTMLAttributes<HTMLUListElement>, "role">;

/** Checks go on a bullet <ul> only: an <ol> keeps its numbers, and rows have no markers. */
export type ListProps = ListBase &
  (
    | { variant?: "bullets"; ordered?: false; marker?: "check" }
    | { variant?: "bullets"; ordered: true; marker?: never }
    | { variant: "rows"; ordered?: boolean; marker?: never }
  );

export function List(props: ListProps) {
  const rest = omit(props, "variant", "ordered", "marker");
  const Tag = dynamic(() => (props.ordered ? "ol" : "ul"));
  const rows = () => props.variant === "rows";
  const unmarked = () => rows() || props.marker !== undefined;

  return (
    <Tag
      {...rest}
      data-variant={rows() ? "rows" : undefined}
      data-marker={props.marker}
      role={unmarked() ? "list" : undefined}
    />
  );
}

type ItemOwn = {
  /** The item's text. In rows, the title. */
  children?: JSX.Element;
  /** Rows: the line under the title. */
  description?: JSX.Element;
  /** Rows: an <svg> icon or an <img> at the row's start. */
  start?: JSX.Element;
  /** Rows: a status, a time, an icon or a Button at the row's end. Text is wrapped in a <beautiful-list-end>. */
  end?: JSX.Element;
};

type ItemPlain = ItemOwn &
  Omit<JSX.LiHTMLAttributes<HTMLLIElement>, "children" | "onClick"> & {
    href?: never;
    onClick?: never;
    commandfor?: never;
  };

/** The whole row is a link. A link can't be disabled, so the types don't allow it. */
type ItemLink = ItemOwn &
  Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
    disabled?: never;
  };

/** The whole row is a button: it runs onClick, or a command on the element commandfor names. */
type ItemButton = ItemOwn &
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> & { href?: never } & (
    | { onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>; commandfor?: string }
    | { onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>; commandfor: string }
  );

export type ListItemProps = ItemPlain | ItemLink | ItemButton;

/**
 * One item: an <li>. Given only children, that is all it renders, for bullets. Given a start,
 * description or end, its parts go in order: the start, a <beautiful-list-body> with the title
 * and a <small> description, then the end. With href or onClick the parts go in an <a> or a <button>,
 * the row's one target, and the other attributes go on it rather than the <li>.
 */
export function ListItem(props: ListItemProps) {
  const rest = omit(props, "children", "description", "start", "end");
  const kind = () => {
    if (props.href !== undefined) return "link";
    if (props.onClick || props.commandfor) return "button";
    return given(props.start) || given(props.description) || given(props.end) ? "row" : "item";
  };

  const end = () => {
    const end = props.end;
    return typeof end === "string" || typeof end === "number" ? <beautiful-list-end>{end}</beautiful-list-end> : end;
  };
  const parts = () => (
    <>
      {props.start}
      <beautiful-list-body>
        {props.children}
        <Show when={given(props.description)}>
          {" "}
          <small>{props.description}</small>
        </Show>
      </beautiful-list-body>
      {given(props.end) ? end() : undefined}
    </>
  );

  return (
    <Switch>
      <Match when={kind() === "link"}>
        <li>
          <a {...(rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}>{parts()}</a>
        </li>
      </Match>
      <Match when={kind() === "button"}>
        <li>
          <button {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} type="button">
            {parts()}
          </button>
        </li>
      </Match>
      <Match when={kind() === "row"}>
        <li {...(rest as JSX.LiHTMLAttributes<HTMLLIElement>)}>{parts()}</li>
      </Match>
      <Match when={kind() === "item"}>
        <li {...(rest as JSX.LiHTMLAttributes<HTMLLIElement>)}>{props.children}</li>
      </Match>
    </Switch>
  );
}

/** Whether a part was given: a condition that came out false, null or "" leaves it out, as it would render nothing. */
function given(part: JSX.Element) {
  return part !== undefined && part !== null && part !== false && part !== "";
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-list-body": HTMLAttributes<HTMLElement>;
      "beautiful-list-end": HTMLAttributes<HTMLElement>;
    }
  }
}
