import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, createSignal, createUniqueId, flush, For, omit, onSettled, Show, untrack } from "solid-js";
import { onFormReset, useField } from "./fieldset.tsx";
import { IconButton } from "./icon-button.tsx";
import { Popover, PopoverButton, PopoverPanel } from "./popover.tsx";

/**
 * DatePicker: a text field for a date, with a button at its end that opens a calendar in a
 * Popover. It follows APG's Date Picker Dialog: arrow keys move by day and week, Page Up and
 * Page Down by month (with Shift, by year), Home and End to the week's ends, Enter or Space
 * picks, and Escape closes. The look is CSS (styles/elements/date-picker.css). The spec is the
 * docs site's Input page.
 *
 * The field takes a date typed in the locale's order, such as 11/20/2026 in the US or
 * 20/11/2026 in the UK, and shows it back in that order. The form gets the ISO date, 2026-11-20,
 * from a hidden input with the name, so a server never parses a locale's format.
 *
 * Dates are calendar days with no time or zone: every sum is done in UTC, so a day never
 * shifts across a daylight-saving change.
 */

export type DatePickerProps = {
  /** The control's id. In a Field, the Field sets it. */
  id?: string;
  /** The name the form sends the ISO date under. */
  name?: string;
  /** The date, as YYYY-MM-DD. Empty for none. */
  value?: string;
  /** Called with the new YYYY-MM-DD, or "" when the field is cleared. */
  onChange?: (value: string) => void;
  /** The earliest and latest dates that can be picked, as YYYY-MM-DD. */
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  /** The language the dates are written in. Left out, the browser's. */
  locale?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: JSX.InputHTMLAttributes<HTMLInputElement>["aria-invalid"];
  ref?: unknown;
};

/** A calendar day, as numbers. month is 0 to 11, as in Date. */
type Day = { year: number; month: number; day: number };

/** A UTC Date for a day. setUTCFullYear, because Date.UTC reads years 0 to 99 as 1900 to 1999. */
const utc = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(2000, month, day));
  date.setUTCFullYear(year, month, day);
  return date;
};
const toDate = (d: Day) => utc(d.year, d.month, d.day);
const fromDate = (date: Date): Day => ({ year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate() });
const iso = (d: Day) => `${String(d.year).padStart(4, "0")}-${String(d.month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
const addDays = (d: Day, days: number) => fromDate(new Date(toDate(d).getTime() + days * 86_400_000));
const daysIn = (year: number, month: number) => utc(year, month + 1, 0).getUTCDate();
/** The same day some months away, or the month's last day when it has fewer. */
const addMonths = (d: Day, months: number): Day => {
  const first = fromDate(utc(d.year, d.month + months, 1));
  return { ...first, day: Math.min(d.day, daysIn(first.year, first.month)) };
};

function parseIso(value: string | undefined): Day | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return undefined;
  const day = { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
  return real(day) ? day : undefined;
}

/** Whether the numbers make a day that exists: no 31 November. */
const real = (d: Day) => d.month >= 0 && d.month < 12 && d.day >= 1 && d.day <= daysIn(d.year, d.month);

function today(): Day {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

/** How a locale writes a date in numbers: the order of its parts and what goes between them. */
function numeric(locale: string) {
  // Gregorian days in Latin digits, whatever the locale's own calendar and digits, so a date
  // written in the field reads back as the same day.
  const format = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
    calendar: "gregory",
    numberingSystem: "latn",
  });
  const parts = format.formatToParts(new Date(Date.UTC(2026, 10, 20)));
  const order = parts.flatMap((part) => (part.type === "year" || part.type === "month" || part.type === "day" ? [part.type] : []));
  const hint = parts.map((part) => ({ year: "YYYY", month: "MM", day: "DD" })[part.type as "year"] ?? part.value).join("");
  return { format: (d: Day) => format.format(toDate(d)), order, hint };
}

/**
 * Reads a typed date in the locale's order. Any run of non-digits separates the parts, so
 * 11/20/2026, 11-20-2026 and 11 20 2026 all read. Eight digits in a row read in order too, and
 * an ISO date always reads. A two-digit year is this century.
 */
function parseTyped(text: string, order: string[]): Day | undefined {
  const isoDay = parseIso(text.trim());
  if (isoDay) return isoDay;
  let groups: string[] = text.match(/\d+/g) ?? [];
  if (groups.length === 1 && groups[0]!.length === 8) {
    const digits = groups[0]!;
    let at = 0;
    groups = order.map((part) => digits.slice(at, (at += part === "year" ? 4 : 2)));
  }
  if (groups.length !== 3) return undefined;
  const value = Object.fromEntries(order.map((part, i) => [part, Number(groups[i])])) as Record<string, number>;
  const year = value.year! < 100 ? 2000 + value.year! : value.year!;
  const day = { year, month: value.month! - 1, day: value.day! };
  return real(day) ? day : undefined;
}

/** The first day of the week, 0 for Sunday, from the locale where the browser knows it. */
function weekStart(locale: string) {
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const first = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay;
    if (first) return first % 7;
    const region = new Intl.Locale(locale).maximize().region;
    return region && ["US", "CA", "MX", "BR", "JP", "IL", "PH", "KR", "TW", "ZA"].includes(region) ? 0 : 1;
  } catch {
    return 0;
  }
}

/** The calendar icon on the button. A function, so each picker makes its own. */
const calendar = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
    <path d="M3.5 8.5h13M7 3v3M13 3v3" />
  </svg>
);

export function DatePicker(props: DatePickerProps) {
  const locale = () => props.locale ?? navigator.language;
  const written = createMemo(() => numeric(locale()));
  // The weekday a week starts on, 0 for Sunday.
  const start = createMemo(() => weekStart(locale()));
  const field = useField(omit(props, "ref"));
  const panelId = createUniqueId();
  const headingId = createUniqueId();

  const [picked, setPicked] = createSignal<Day | undefined>(parseIso(props.value));
  const [text, setText] = createSignal(untrack(() => (picked() ? written().format(picked()!) : "")));
  // The day the grid's focus is on, and so the month it shows.
  const [focused, setFocused] = createSignal<Day>(picked() ?? today());
  const [open, setOpen] = createSignal(false);
  let input: HTMLInputElement | undefined;
  let grid: HTMLTableElement | undefined;

  const min = createMemo(() => parseIso(props.min));
  const max = createMemo(() => parseIso(props.max));
  const minIso = createMemo(() => (min() ? iso(min()!) : undefined));
  const maxIso = createMemo(() => (max() ? iso(max()!) : undefined));
  const outOfRange = (d: Day) => {
    const at = iso(d);
    return (!!minIso() && at < minIso()!) || (!!maxIso() && at > maxIso()!);
  };

  /**
   * The day the field holds, kept outside the signal too: a signal takes a write at the end of
   * the batch, and the listeners below compare against the day as it is now.
   */
  let current = untrack(picked);

  // A value from the parent replaces the field's.
  createEffect(
    () => props.value,
    (value) => {
      const day = parseIso(value);
      if ((day && iso(day)) === (current && iso(current))) return;
      show(day);
    },
  );

  /** What's wrong with the typed text, as the input's custom validity, which a Field shows. */
  function check(el: HTMLInputElement) {
    const typed = el.value.trim();
    const day = typed ? parseTyped(typed, written().order) : undefined;
    let problem = "";
    if (typed && !day) problem = `Enter a date such as ${written().format(today())}.`;
    else if (day && min() && iso(day) < iso(min()!)) problem = `Choose ${written().format(min()!)} or later.`;
    else if (day && max() && iso(day) > iso(max()!)) problem = `Choose ${written().format(max()!)} or earlier.`;
    el.setCustomValidity(problem);
    return problem ? undefined : day;
  }

  /** Shows a day in the field, and holds it, without telling the page. */
  function show(day: Day | undefined) {
    const next = day ? untrack(written).format(day) : "";
    current = day;
    setPicked(day);
    setText(next);
    if (input) {
      input.value = next;
      check(input);
    }
  }

  /** Holds a day the person picked or typed, and tells the page when it changed. */
  function hold(day: Day | undefined) {
    const before = current;
    current = day;
    setPicked(day);
    if ((before && iso(before)) !== (day && iso(day))) props.onChange?.(day ? iso(day) : "");
  }

  /** A day picked in the calendar: into the field, heard by the Field and the page as typing would be. */
  function choose(day: Day) {
    if (!input) return;
    input.value = written().format(day);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function wire(el: HTMLInputElement) {
    input = el;
    // These listeners go on before the Field's, so it reads the validity they leave.
    el.addEventListener("input", () => check(el));
    el.addEventListener("change", () => {
      const day = check(el);
      // A date that reads is written back in the locale's order. One that doesn't stays as
      // typed, and the form sends no date: never the one it replaced.
      if (day) el.value = written().format(day);
      setText(el.value);
      hold(day);
    });
    // Alt + Down opens the calendar, as on a native date field or a combobox.
    el.addEventListener("keydown", (event) => {
      if (event.altKey && event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
      }
    });
    check(el);
    field.ref?.(el);
    if (typeof props.ref === "function") props.ref(el);
  }
  // A form's reset puts back the value the page first gave, as a native field's default value,
  // and tells the page when that changes its day.
  const initial = untrack(() => props.value);
  onSettled(() =>
    input
      ? onFormReset(input, () => {
          const before = current;
          const day = parseIso(initial);
          show(day);
          if ((before && iso(before)) !== (day && iso(day))) props.onChange?.(day ? iso(day) : "");
        })
      : undefined,
  );

  function toggled(now: boolean) {
    setOpen(now);
    if (!now) return;
    // It opens on the picked day, or today when none is picked, and focus goes to it.
    setFocused(picked() ?? today());
    flush();
    focusDay();
  }

  function focusDay() {
    grid?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }

  /** Moves the focus to a day, after the grid has turned to its month. */
  function move(to: Day) {
    setFocused(to);
    flush();
    focusDay();
  }

  function onKey(event: KeyboardEvent) {
    const at = focused();
    const weekday = (toDate(at).getUTCDay() - start() + 7) % 7;
    const moves: Record<string, () => Day> = {
      ArrowLeft: () => addDays(at, -1),
      ArrowRight: () => addDays(at, 1),
      ArrowUp: () => addDays(at, -7),
      ArrowDown: () => addDays(at, 7),
      Home: () => addDays(at, -weekday),
      End: () => addDays(at, 6 - weekday),
      PageUp: () => addMonths(at, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(at, event.shiftKey ? 12 : 1),
    };
    if (moves[event.key]) {
      event.preventDefault();
      move(moves[event.key]!());
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(at);
    }
  }

  function pick(day: Day) {
    if (outOfRange(day)) return;
    choose(day);
    setOpen(false);
  }

  /** The month the grid shows, as weeks of seven days, with null for a day of another month. */
  const shown = createMemo(() => `${focused().year}-${focused().month}`);
  const weeks = createMemo(() => {
    const [year, month] = shown().split("-").map(Number) as [number, number];
    const lead = (utc(year, month, 1).getUTCDay() - start() + 7) % 7;
    const cells: (Day | null)[] = Array.from({ length: lead }, () => null);
    for (let day = 1; day <= daysIn(year, month); day++) cells.push({ year, month, day });
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  });

  // One formatter of each kind per locale, not one per day cell.
  const monthFormat = createMemo(() => new Intl.DateTimeFormat(locale(), { month: "long", year: "numeric", timeZone: "UTC" }));
  const narrowDay = createMemo(() => new Intl.DateTimeFormat(locale(), { weekday: "narrow", timeZone: "UTC" }));
  const longDay = createMemo(() => new Intl.DateTimeFormat(locale(), { weekday: "long", timeZone: "UTC" }));
  const fullFormat = createMemo(() => new Intl.DateTimeFormat(locale(), { dateStyle: "full", timeZone: "UTC" }));
  const monthName = () => monthFormat().format(toDate(focused()));
  // 2026-11-01 is a Sunday.
  const weekdays = () => Array.from({ length: 7 }, (_, i) => toDate({ year: 2026, month: 10, day: 1 + ((start() + i) % 7) }));
  const weekdayName = (date: Date, weekday: "narrow" | "long") => (weekday === "narrow" ? narrowDay() : longDay()).format(date);
  const fullDate = (d: Day) => fullFormat().format(toDate(d));
  const same = (a: Day | undefined, b: Day | undefined) => !!a && !!b && iso(a) === iso(b);

  return (
    <Popover id={panelId} open={open()} onToggle={toggled}>
      <beautiful-input-group>
        <input
          type="text"
          inputmode="numeric"
          autocomplete="off"
          data-1p-ignore=""
          data-lpignore="true"
          data-bwignore=""
          id={props.id}
          placeholder={written().hint}
          value={text()}
          required={props.required}
          disabled={props.disabled}
          aria-label={props["aria-label"]}
          aria-describedby={props["aria-describedby"]}
          aria-invalid={props["aria-invalid"]}
          {...field}
          ref={wire}
        />
        <PopoverButton variant="tertiary" aria-label="Choose a date" aria-haspopup="dialog" disabled={field.disabled ?? props.disabled}>
          {calendar()}
        </PopoverButton>
      </beautiful-input-group>
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={picked() ? iso(picked()!) : ""} />
      </Show>
      <PopoverPanel anchor="bottom end" role="dialog" aria-labelledby={headingId} data-date-picker="">
        <header>
          <MonthButton label="Previous month" onClick={() => setFocused(addMonths(focused(), -1))} back />
          <h2 id={headingId} aria-live="polite">
            {monthName()}
          </h2>
          <MonthButton label="Next month" onClick={() => setFocused(addMonths(focused(), 1))} />
        </header>
        <table role="grid" aria-labelledby={headingId} ref={(el: HTMLTableElement) => (grid = el)} onKeyDown={onKey}>
          <thead>
            <tr>
              <For each={weekdays()}>
                {(date) => (
                  <th scope="col" abbr={weekdayName(date, "long")}>
                    {weekdayName(date, "narrow")}
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={weeks()}>
              {(week) => (
                <tr>
                  <For each={week}>
                    {(cell) => (
                      <Show when={cell} fallback={<td />}>
                        {(day) => (
                          <td
                            tabindex={same(day(), focused()) ? 0 : -1}
                            aria-label={fullDate(day())}
                            aria-selected={same(day(), picked()) ? "true" : undefined}
                            aria-current={same(day(), today()) ? "date" : undefined}
                            aria-disabled={outOfRange(day()) ? "true" : undefined}
                            onClick={() => {
                              setFocused(day());
                              pick(day());
                            }}
                          >
                            {day().day}
                          </td>
                        )}
                      </Show>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </PopoverPanel>
    </Popover>
  );
}

/** A month button in the calendar's header: a tertiary IconButton with a chevron. */
function MonthButton(props: { label: string; onClick: () => void; back?: boolean }) {
  return (
    <IconButton variant="tertiary" label={props.label} onClick={() => props.onClick()}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d={props.back ? "m12 5-5 5 5 5" : "m8 5 5 5-5 5"} />
      </svg>
    </IconButton>
  );
}
