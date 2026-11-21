import type { JSX } from "@solidjs/web";
import { createContext, createSignal, omit, onSettled, untrack, useContext } from "solid-js";
import { call } from "./handler.ts";
import { forward } from "./popover.tsx";
import { buttonsOf, toggleFor } from "./toggle-group-keys.ts";

/**
 * Toggle group: segments in one groove, in a <beautiful-toggle-group>. One choice is a segmented
 * control, an APG radio group of <button role="radio" aria-checked>. With `multiple`, several at
 * once, a group of <button aria-pressed> with the APG toolbar's keys. The look is CSS
 * (styles/elements/toggle-group.css: a raised pane under what's on, a gliding thumb for one
 * choice), and the keys are toggleFor (toggle-group-keys.ts), the same ones wireToggleGroup gives
 * static markup. The spec is the docs site's Toggle group page.
 *
 * With value, the page owns what's on and the group shows what it says. Without, the group owns
 * it, starting from defaultValue. Either way each choice calls onChange with what's on.
 *
 * The group is one Tab stop: the segment last focused, or else the first enabled one that's on,
 * or else the first enabled one (one choice puts the checked one first). Segments count in the order
 * they were made for the Tab stop, and in the page's order for onChange.
 */

type Item = { value: () => string; disabled: () => boolean };

type Shared = {
  single: () => boolean;
  color: () => "neutral" | "accent";
  disabled: () => boolean;
  isOn: (value: string) => boolean;
  isStop: (value: string) => boolean;
  focus: (value: string) => void;
  choose: (value: string) => void;
  add: (item: Item) => () => void;
};

const ToggleGroupContext = createContext<Shared>();

/** A group is named, so a screen reader says what its segments are for: by aria-label or by aria-labelledby. */
type Named =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

/** One choice: a value, or none until one is chosen. */
type Single = {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

/** Several at once: the values that are on, in the segments' order. */
type Multiple = {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
};

export type ToggleGroupProps = Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "role" | "aria-label" | "aria-labelledby" | "onChange" | "color"
> &
  Named &
  (Single | Multiple) & {
    /** The tint of a segment that's on, and every segment's text. */
    color?: "neutral" | "accent";
    /** Takes the full width, with equal segments. */
    fill?: boolean;
    /** Disables every segment, and the group leaves the Tab order. */
    disabled?: boolean;
  };

const listOf = (value: string | string[] | undefined) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

export function ToggleGroup(props: ToggleGroupProps) {
  const rest = omit(props, "multiple", "value", "defaultValue", "onChange", "color", "fill", "disabled", "onKeyDown", "ref");
  // Read once: defaultValue is where the group starts, not a state to follow.
  const [own, setOwn] = createSignal(listOf(untrack(() => props.defaultValue)));
  // Each segment adds itself as it's made, inside its own component: internal state, so the write is allowed there.
  const [items, setItems] = createSignal<Item[]>([], { ownedWrite: true });
  const [focused, setFocused] = createSignal<string>();
  let root: HTMLElement | undefined;
  const on = () => (props.value !== undefined ? listOf(props.value) : own());
  const enabled = () => (props.disabled ? [] : items().filter((item) => !item.disabled()));

  const shared: Shared = {
    single: () => !props.multiple,
    color: () => props.color ?? "neutral",
    disabled: () => !!props.disabled,
    isOn: (value) => on().includes(value),
    // One choice: the checked segment, as APG's radio group asks, else the one last focused. Several:
    // the one last focused, else the first that's on. Else the first enabled one.
    isStop(value) {
      const list = enabled();
      const last = list.find((item) => item.value() === focused());
      const lit = list.find((item) => on().includes(item.value()));
      const stop = (props.multiple ? (last ?? lit) : (lit ?? last)) ?? list[0];
      return stop?.value() === value;
    },
    focus: setFocused,
    choose(value) {
      const now = untrack(on);
      let next: string[];
      if (!props.multiple) {
        if (now.includes(value)) return;
        next = [value];
      } else {
        const want = now.includes(value) ? now.filter((each) => each !== value) : [...now, value];
        // The segments' order on the page, so a list reads the same whichever was pressed first. A
        // value the page holds with no segment of its own goes last.
        const order = root ? buttonsOf(root).map((button) => button.value) : [];
        const at = (value: string) => (order.includes(value) ? order.indexOf(value) : order.length);
        next = want.sort((a, b) => at(a) - at(b));
      }
      if (props.value === undefined) setOwn(next);
      if (props.multiple) props.onChange?.(next);
      else props.onChange?.(next[0]!);
    },
    add(item) {
      setItems((list) => [...list, item]);
      return () => setItems((list) => list.filter((each) => each !== item));
    },
  };

  // The caller's onKeyDown runs first, and can keep a key from the group with preventDefault.
  function onKeyDown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
    call(props.onKeyDown, event);
    if (event.defaultPrevented) return;
    const to = toggleFor(event, event.currentTarget);
    if (!to) return;
    event.preventDefault();
    setFocused(to.value);
    to.focus();
    if (!props.multiple) shared.choose(to.value);
  }

  return (
    <beautiful-toggle-group
      {...rest}
      ref={(el: HTMLElement) => {
        root = el;
        forward(props.ref, el);
      }}
      role={props.multiple ? "group" : "radiogroup"}
      data-fill={props.fill ? "" : undefined}
      onKeyDown={onKeyDown}
    >
      <ToggleGroupContext value={shared}>{props.children}</ToggleGroupContext>
    </beautiful-toggle-group>
  );
}

export type ToggleGroupItemProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "role" | "value" | "color" | "aria-pressed" | "aria-checked" | "tabindex"
> & {
  /** Names the segment in the group's value and onChange. Unique in its group. */
  value: string;
} & (
    | { /** Shows only an icon: the segment is square, and names itself with aria-label. */ icon: true; "aria-label": string }
    | { icon?: false }
  );

/** One segment: its label, with an optional icon first, or with `icon` only an icon and an aria-label. */
export function ToggleGroupItem(props: ToggleGroupItemProps) {
  const group = useContext(ToggleGroupContext);
  const rest = omit(props, "value", "icon", "disabled", "onClick", "onFocus");
  const remove = group.add({ value: () => props.value, disabled: () => !!props.disabled });
  onSettled(() => remove);
  const disabled = () => group.disabled() || !!props.disabled;
  const state = () => (group.isOn(props.value) ? "true" : "false");

  // The caller's onClick runs first, and can keep the state with preventDefault.
  function onClick(event: MouseEvent) {
    call(props.onClick, event);
    if (event.defaultPrevented) return;
    group.focus(props.value);
    group.choose(props.value);
  }

  function onFocus(event: FocusEvent) {
    call(props.onFocus, event);
    group.focus(props.value);
  }

  return (
    <button
      {...rest}
      type="button"
      role={group.single() ? "radio" : undefined}
      aria-checked={group.single() ? state() : undefined}
      aria-pressed={group.single() ? undefined : state()}
      value={props.value}
      data-color={group.color() === "neutral" ? undefined : group.color()}
      data-icon-button={props.icon ? "" : undefined}
      disabled={disabled()}
      tabindex={group.isStop(props.value) ? "0" : "-1"}
      onClick={onClick}
      onFocus={onFocus}
    />
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-toggle-group": HTMLAttributes<HTMLElement>;
    }
  }
}
