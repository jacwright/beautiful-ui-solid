/**
 * Toasts: what the platform lacks for a stack of short messages that go away by themselves.
 * toast.css draws them. The stack is an
 * <beautiful-toaster popover="manual" role="region" aria-label="Notifications" aria-live="polite">,
 * and each toast a <beautiful-toast tabindex="-1"> in it, oldest first. The spec is the docs site's Toast page.
 *
 * This adds:
 *   - The stack stays open from the start, so it is in the top layer and its live region exists
 *     before the first message. While a modal dialog is open, the stack moves into it: the page
 *     behind a modal is inert, and a toast there could be neither read nor clicked.
 *   - At most three toasts. A fourth sends the oldest away, a danger toast last.
 *   - Each toast leaves after its time: 5s, 8s with an action, never for danger. Time stops while
 *     the pointer is over the stack, while focus is in it, and while the tab is hidden.
 *   - The toasts beside one that comes or goes glide to their new places.
 *   - F8 moves focus to the newest toast. Escape on a toast dismisses it, and focus goes back to
 *     where it was. Clicking the action runs it and dismisses the toast.
 *   - A sideways swipe with a finger or a pen dismisses a toast.
 */

export type ToastTone = "success" | "danger";

export type ToastAction = {
  label: string;
  /** Runs when the action is clicked. The toast is dismissed after. */
  onClick?: () => void;
};

export type ToastOptions = {
  /** The message: a few words, such as "Link copied". */
  message: string;
  /** A second line, in the muted color. */
  description?: string;
  tone?: ToastTone;
  /** One button, such as Undo or View. */
  action?: ToastAction;
  /** How long it shows, in ms. Infinity keeps it until it's dismissed. */
  duration?: number;
};

export type Toast = {
  /** Sends it away now. */
  dismiss(): void;
  /** Changes what it says, and starts its time again. Screen readers read the new text. */
  update(options: Partial<ToastOptions>): void;
};

/** How long a toast shows: a plain one, one with an action, and one with the danger tone. */
export const toastDurations = { plain: 5000, action: 8000, danger: Number.POSITIVE_INFINITY } as const;

/** The most toasts on screen at once. */
export const maxToasts = 3;

/** The key that moves focus to the newest toast. */
export const toastHotkey = "F8";

export function durationOf(options: ToastOptions): number {
  if (options.duration !== undefined) return options.duration;
  if (options.tone === "danger") return toastDurations.danger;
  return options.action ? toastDurations.action : toastDurations.plain;
}

/**
 * Writes a toast's content into its <beautiful-toast>: the markup toast.css draws, and the docs examples show.
 * Replaces what was there, so update() can call it again.
 */
export function fillToast(li: HTMLElement, options: ToastOptions) {
  const doc = li.ownerDocument;
  li.tabIndex = -1;
  if (options.tone) li.dataset.tone = options.tone;
  else delete li.dataset.tone;
  const message = doc.createElement("p");
  message.textContent = options.message;
  const parts: Node[] = [message];
  if (options.description) {
    const line = doc.createElement("p");
    line.textContent = options.description;
    parts.push(line);
  }
  if (options.action) {
    const action = doc.createElement("button");
    action.type = "button";
    action.textContent = options.action.label;
    parts.push(action);
  }
  const close = doc.createElement("button");
  close.type = "button";
  close.dataset.variant = "tertiary";
  close.dataset.dismiss = "";
  close.setAttribute("aria-label", "Dismiss");
  parts.push(close);
  li.replaceChildren(...parts);
}

type Entry = {
  li: HTMLElement;
  options: ToastOptions;
  /** The ms left on its time while it's paused. */
  remaining: number;
  endsAt: number;
  timer?: ReturnType<typeof setTimeout>;
  leaving: boolean;
};

type Stack = { show(options: ToastOptions): Toast };

/** The wired stacks. toast() uses the last one. */
const stacks: Stack[] = [];

/** Shows a toast in the last stack wired on the page, or in a new one at the end of the body. */
export function toast(options: string | ToastOptions): Toast {
  const opts = typeof options === "string" ? { message: options } : options;
  let stack = stacks.at(-1);
  if (!stack) {
    const list = document.createElement("beautiful-toaster");
    list.setAttribute("popover", "manual");
    list.setAttribute("role", "region");
    list.setAttribute("aria-label", "Notifications");
    list.setAttribute("aria-live", "polite");
    document.body.append(list);
    wireToaster(list);
    stack = stacks.at(-1)!;
  }
  return stack.show(opts);
}

/** Wires one stack. Returns a function that removes everything it added. */
export function wireToaster(list: HTMLElement): () => void {
  const doc = list.ownerDocument;
  const win = doc.defaultView!;
  const entries: Entry[] = [];
  let hovered = false;
  let focused = false;
  /** Where focus was before F8, to go back to after Escape. */
  let returnTo: HTMLElement | null = null;
  /** Where the stack lives while no modal dialog holds it. */
  let home: { parent: Node; next: Node | null } | undefined;
  let host: HTMLDialogElement | undefined;
  /** Unwired: nothing more runs. */
  let disposed = false;
  /** The timeouts that take leaving toasts off the page. */
  const removals = new Set<ReturnType<typeof setTimeout>>();

  const live = () => entries.filter((entry) => !entry.leaving);
  const entryOf = (target: EventTarget | null) =>
    entries.find((entry) => target instanceof Node && entry.li.contains(target));
  const paused = () => hovered || focused || doc.hidden;
  const tokenMs = (name: string) => Number.parseFloat(getComputedStyle(list).getPropertyValue(name)) || 0;

  function open() {
    if (list.hasAttribute("popover") && list.isConnected && !list.matches(":popover-open")) list.showPopover();
  }

  // Timers.
  function run(entry: Entry) {
    if (disposed || entry.timer !== undefined || entry.leaving || paused() || !Number.isFinite(entry.remaining)) return;
    entry.endsAt = Date.now() + entry.remaining;
    entry.timer = setTimeout(() => leave(entry), entry.remaining);
  }
  function pause(entry: Entry) {
    if (entry.timer === undefined) return;
    clearTimeout(entry.timer);
    entry.timer = undefined;
    entry.remaining = Math.max(0, entry.endsAt - Date.now());
  }
  function sync() {
    for (const entry of entries) {
      if (paused()) pause(entry);
      else run(entry);
    }
  }

  /** Makes a change, then glides the toasts that stay from where they were to where they are. */
  function glide(change: () => void) {
    const before = new Map(live().map((entry) => [entry.li, entry.li.getBoundingClientRect().top]));
    change();
    if (win.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const duration = tokenMs("--motion-enter");
    const easing = getComputedStyle(list).getPropertyValue("--ease-spring");
    for (const [li, top] of before) {
      for (const animation of li.getAnimations()) if (animation.id === "toast-glide") animation.cancel();
      const dy = top - li.getBoundingClientRect().top;
      if (!li.isConnected || Math.abs(dy) < 0.5) continue;
      const keyframes = [{ translate: `0 ${dy}px` }, { translate: "0 0" }];
      try {
        li.animate(keyframes, { id: "toast-glide", duration, easing });
      } catch {
        // An easing the browser can't read, such as linear() in an older one.
        li.animate(keyframes, { id: "toast-glide", duration, easing: "ease-out" });
      }
    }
  }

  /** Moves the stack into the open modal dialog, or back home when none is open. True if it moved. */
  function follow(): boolean {
    const modal = [...doc.querySelectorAll<HTMLDialogElement>("dialog:modal")].at(-1);
    if (modal === host) return false;
    if (modal) {
      home ??= { parent: list.parentNode!, next: list.nextSibling };
      // First, so the dialog's last part stays its last child, as dialog.css expects.
      modal.prepend(list);
      modal.addEventListener("close", onHostClose, { once: true });
    } else goHome();
    host = modal;
    open();
    return true;
  }
  /** Puts the stack back where its owner, such as Solid, put it. */
  function goHome() {
    if (!home) return;
    home.parent.insertBefore(list, home.next?.parentNode === home.parent ? home.next : null);
    home = undefined;
  }
  function onHostClose() {
    follow();
  }
  /** A modal opening while toasts show takes them in, so they don't sit in the inert page. */
  function onDialogToggle(event: Event) {
    if (event.target instanceof HTMLDialogElement && live().length) follow();
  }

  function show(options: ToastOptions): Toast {
    const entry: Entry = {
      li: doc.createElement("beautiful-toast"),
      options: { ...options },
      remaining: durationOf(options),
      endsAt: 0,
      leaving: false,
    };
    fillToast(entry.li, entry.options);
    const moved = follow();
    // The oldest go first, but a danger toast, which waits to be read, only when nothing else is left.
    const extra = live().length - maxToasts + 1;
    if (extra > 0) {
      const order = [...live().filter((e) => e.options.tone !== "danger"), ...live().filter((e) => e.options.tone === "danger")];
      for (const old of order.slice(0, extra)) leave(old);
    }
    glide(() => {
      list.append(entry.li);
      entries.push(entry);
    });
    run(entry);
    // A live region that just moved needs a frame before a screen reader hears what's added to it,
    // so the toast's text is written again then, which it reads as new.
    if (moved) requestAnimationFrame(() => entry.leaving || disposed || refill(entry));
    return {
      dismiss: () => leave(entry),
      update(changes) {
        if (entry.leaving) return;
        entry.options = { ...entry.options, ...changes };
        refill(entry);
        pause(entry);
        entry.remaining = durationOf(entry.options);
        run(entry);
      },
    };
  }

  /** Rewrites a toast's content. Focus on one of its buttons stays in the toast, so its time stays stopped. */
  function refill(entry: Entry) {
    const hadFocus = entry.li.contains(doc.activeElement) && doc.activeElement !== entry.li;
    fillToast(entry.li, entry.options);
    if (hadFocus) entry.li.focus();
  }

  /** Sends a toast away. out is where it leaves to, when a swipe sets it. */
  function leave(entry: Entry, out?: string) {
    if (entry.leaving) return;
    const { li } = entry;
    const hadFocus = li.contains(doc.activeElement);
    // Focus on it from the keys, not from a click on one of its buttons, goes on to the next toast.
    const byKeys = hadFocus && doc.activeElement!.matches(":focus-visible");
    pause(entry);
    entry.leaving = true;
    glide(() => {
      // Out of the flow, held where it is against the stack's fixed edge, so the rest glide at once.
      const top = (list.dataset.placement ?? "").startsWith("top");
      if (top) li.style.top = `${li.offsetTop}px`;
      else li.style.bottom = `${list.clientHeight - li.offsetTop - li.offsetHeight}px`;
      if (out) li.style.setProperty("--toast-out", out);
      li.dataset.leaving = "";
    });
    if (hadFocus) {
      const next = live().at(-1);
      if (byKeys && next) next.li.focus();
      else if (byKeys && returnTo?.isConnected) returnTo.focus();
      else (doc.activeElement as HTMLElement).blur();
    }
    if (!live().length) returnTo = null;
    const removal = setTimeout(() => {
      removals.delete(removal);
      li.remove();
      entries.splice(entries.indexOf(entry), 1);
      // The pointer may have been over the toast that left: no pointerout comes when it goes.
      hovered = list.matches(":hover");
      sync();
    }, tokenMs("--motion-exit") + 50);
    removals.add(removal);
  }

  // Events.
  function onClick(event: MouseEvent) {
    const button = (event.target as Element).closest("button");
    const entry = entryOf(button);
    if (!button || !entry || entry.leaving) return;
    try {
      if (!button.hasAttribute("data-dismiss")) entry.options.action?.onClick?.();
    } finally {
      leave(entry);
    }
  }
  function onKey(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    const entry = entryOf(event.target);
    if (!entry) return;
    // Not the dialog's Escape too, when the stack is inside one.
    event.preventDefault();
    event.stopPropagation();
    leave(entry);
  }
  function onHotkey(event: KeyboardEvent) {
    // With more than one stack, the last wired takes the key.
    if (stacks.at(-1) !== stack) return;
    if (event.key !== toastHotkey || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const newest = live().at(-1);
    if (!newest) return;
    event.preventDefault();
    if (!list.contains(doc.activeElement)) returnTo = doc.activeElement as HTMLElement | null;
    newest.li.focus();
  }
  function onFocusIn() {
    focused = true;
    sync();
  }
  function onFocusOut(event: FocusEvent) {
    focused = list.contains(event.relatedTarget as Node | null);
    if (!focused && event.relatedTarget) returnTo = null;
    sync();
  }
  function onPointerOver() {
    hovered = true;
    sync();
  }
  function onPointerOut(event: PointerEvent) {
    hovered = list.contains(event.relatedTarget as Node | null);
    sync();
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse" || !event.isPrimary) return;
    const entry = entryOf(event.target);
    if (!entry || entry.leaving || (event.target as Element).closest("button")) return;
    const { li } = entry;
    const startX = event.clientX;
    const startAt = event.timeStamp;
    let dx = 0;
    li.setPointerCapture(event.pointerId);
    const move = (moved: PointerEvent) => {
      dx = moved.clientX - startX;
      if (!li.hasAttribute("data-swiping") && Math.abs(dx) < 4) return;
      li.dataset.swiping = "";
      li.style.setProperty("--toast-swipe", `${dx}px`);
    };
    const end = (ended: PointerEvent) => {
      li.removeEventListener("pointermove", move);
      li.removeEventListener("pointerup", end);
      li.removeEventListener("pointercancel", end);
      const speed = Math.abs(dx) / Math.max(1, ended.timeStamp - startAt);
      const far = Math.abs(dx) > li.offsetWidth * 0.35 || (Math.abs(dx) > 24 && speed > 0.5);
      delete li.dataset.swiping;
      li.style.removeProperty("--toast-swipe");
      if (ended.type === "pointerup" && far) leave(entry, `translateX(calc(${Math.sign(dx)} * (100% + var(--space-4))))`);
    };
    li.addEventListener("pointermove", move);
    li.addEventListener("pointerup", end);
    li.addEventListener("pointercancel", end);
  }

  list.addEventListener("click", onClick);
  list.addEventListener("keydown", onKey);
  list.addEventListener("focusin", onFocusIn);
  list.addEventListener("focusout", onFocusOut);
  list.addEventListener("pointerover", onPointerOver);
  list.addEventListener("pointerout", onPointerOut);
  list.addEventListener("pointerdown", onPointerDown);
  doc.addEventListener("keydown", onHotkey);
  doc.addEventListener("visibilitychange", sync);
  doc.addEventListener("toggle", onDialogToggle, true);
  open();
  const stack: Stack = { show };
  stacks.push(stack);

  return () => {
    stacks.splice(stacks.indexOf(stack), 1);
    for (const entry of entries) clearTimeout(entry.timer);
    host?.removeEventListener("close", onHostClose);
    list.removeEventListener("click", onClick);
    list.removeEventListener("keydown", onKey);
    list.removeEventListener("focusin", onFocusIn);
    list.removeEventListener("focusout", onFocusOut);
    list.removeEventListener("pointerover", onPointerOver);
    list.removeEventListener("pointerout", onPointerOut);
    list.removeEventListener("pointerdown", onPointerDown);
    doc.removeEventListener("keydown", onHotkey);
    doc.removeEventListener("visibilitychange", sync);
    doc.removeEventListener("toggle", onDialogToggle, true);
    disposed = true;
    for (const timer of removals) clearTimeout(timer);
    for (const entry of entries) entry.li.remove();
    // Back where its owner put it, such as Solid, which removes it from there.
    goHome();
  };
}
