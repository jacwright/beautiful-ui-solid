/**
 * The moving focus ring. When the keyboard moves focus from one control to the next, a ring
 * glides from the old control's ring to the new one's, changing its position, size and corner
 * radius on the way, so the eye can follow it. Then it hands back to the control's own outline.
 *
 * Controls need nothing of their own. The ring copies what the browser would draw: the
 * control's box, its corner radii, and its :focus-visible outline (width, offset, color). A
 * control whose outline is none, such as a dialog panel, takes no ring and starts no glide.
 *
 * The glide is the only thing this adds. At rest, and whenever the glide doesn't run, the
 * control's native outline is the ring, so it scrolls and resizes with its control.
 * The glide doesn't run without JS, for a pointer, under reduced motion (--motion-focus is 0)
 * or in forced colors. It runs only within one place, the page or one dialog: into or out of a
 * dialog, or across a route change, the ring appears where focus lands. The spec is the docs site's Focus ring page.
 */

/** Set on the control the ring is gliding to. base.css hides its outline until the ring lands. */
const gliding = "data-focus-ring-gliding";

type Rect = { left: number; top: number; right: number; bottom: number };

/** The ring's outer edge, its corner radii (horizontal then vertical, clockwise from top left), and the box that clips it. */
type Box = Rect & { radii: number[]; clip: Rect };

/** The control's outline, read while it is focused: what the native ring looks like. */
type Outline = { width: number; offset: number; color: string };

/**
 * Where a glide starts: the ring as it was when focus left, pinned to the control it left. If that
 * control moves, such as when the browser scrolls the next one into view, the start moves with it.
 */
type Origin = { box: Box; anchor: Element; at: DOMRect };

type Glide = {
  target: Element;
  outline: Outline;
  from: Origin;
  clock: Animation;
  /** The scroll containers that clip the target, outermost last. */
  clippers: Element[];
  /** Where the ring is now, so a glide cut short starts the next one from here. */
  box: Box;
  frame: number;
};

/**
 * Starts the moving ring for a document. Call it once, when the app starts. Returns a function
 * that stops it and puts everything back.
 */
export function startFocusRing(doc: Document = document): () => void {
  const view = doc.defaultView;
  if (!view || !("showPopover" in view.HTMLElement.prototype)) return () => {};

  let keyboard = false;
  /** The control showing a ring now, and its outline as it was when it took focus. */
  let shown: { target: Element; outline: Outline } | undefined;
  /** Where the ring was when focus left, kept until the task ends: a glide starts from it. */
  let leaving: Origin | undefined;
  let glide: Glide | undefined;
  let ring: HTMLElement | undefined;

  const onKey = () => (keyboard = true);
  const onPointer = () => (keyboard = false);

  function onFocusOut(event: FocusEvent) {
    const target = holderOf(event.target as Element);
    let box: Box;
    if (glide?.target === target) box = glide.box;
    else if (shown?.target === target) box = measure(target, shown.outline, clippersOf(target));
    else return;
    leaving = { box, anchor: target, at: target.getBoundingClientRect() };
    // The ring never lingers on a control that lost focus, even when nothing else takes it.
    land();
    // Tab moves focus within one task. A focusin later than this, such as coming back to the window, starts no glide.
    view!.setTimeout(() => (leaving = undefined));
  }

  function onFocusIn(event: FocusEvent) {
    const control = event.target as Element;
    const target = holderOf(control);
    land();
    const outline = outlineOf(control, target);
    shown = outline ? { target, outline } : undefined;
    const from = leaving;
    leaving = undefined;
    if (!outline || !from || !keyboard || view!.matchMedia("(forced-colors: active)").matches) return;
    // The ring glides only within one place: the page, or one dialog. Into or out of a dialog, or from a
    // control that has gone, such as the last page's after a route change, the context changed, and it appears.
    if (!from.anchor.isConnected || contextOf(from.anchor) !== contextOf(target)) return;
    const duration = parseTime(view!.getComputedStyle(doc.documentElement).getPropertyValue("--motion-focus"));
    if (duration <= 0) return;
    fly(target, outline, from, duration);
  }

  function fly(target: Element, outline: Outline, from: Origin, duration: number) {
    ring ??= createRing();
    const easing = view!.getComputedStyle(doc.documentElement).getPropertyValue("--ease-in-out").trim() || "ease-in-out";
    // An animation with no target is the clock: its progress comes back eased by the theme's curve.
    const clock = new view!.Animation(new view!.KeyframeEffect(null, null, { duration, easing, fill: "forwards" }));
    clock.play();
    target.setAttribute(gliding, "");
    ring.style.borderWidth = `${outline.width}px`;
    ring.style.borderColor = outline.color;
    // land() hid it, so showing it now puts it on top of the top layer, above any modal dialog that opened since.
    ring.showPopover();
    glide = { target, outline, from, clock, clippers: clippersOf(target), box: from.box, frame: 0 };
    step();
  }

  function step() {
    if (!glide || !ring) return;
    const { target, outline, from, clock, clippers } = glide;
    if (!target.isConnected) return land();
    const progress = clock.effect?.getComputedTiming().progress ?? 1;
    // The target is measured every frame, so the ring follows it while a dialog springs open or the page scrolls.
    const box = mix(start(from), measure(target, outline, clippers), progress);
    glide.box = box;
    draw(ring, box);
    if (clock.playState === "finished") return land();
    glide.frame = view!.requestAnimationFrame(step);
  }

  /** Ends a glide: the ring hides and the control's own outline, at the same spot, takes over. */
  function land() {
    if (!glide) return;
    view!.cancelAnimationFrame(glide.frame);
    glide.clock.cancel();
    glide.target.removeAttribute(gliding);
    if (ring?.matches(":popover-open")) ring.hidePopover();
    glide = undefined;
  }

  function createRing() {
    const element = doc.createElement("beautiful-focus-ring");
    element.popover = "manual";
    element.setAttribute("aria-hidden", "true");
    doc.body.append(element);
    return element;
  }

  doc.addEventListener("keydown", onKey, true);
  doc.addEventListener("pointerdown", onPointer, true);
  doc.addEventListener("focusout", onFocusOut, true);
  doc.addEventListener("focusin", onFocusIn, true);

  return () => {
    land();
    doc.removeEventListener("keydown", onKey, true);
    doc.removeEventListener("pointerdown", onPointer, true);
    doc.removeEventListener("focusout", onFocusOut, true);
    doc.removeEventListener("focusin", onFocusIn, true);
    ring?.remove();
    ring = undefined;
  };
}

/** The place focus moves within: the dialog a control is in, or the page. A modal built without <dialog> counts. */
function contextOf(control: Element): Element {
  return control.closest('dialog, [aria-modal="true"]') ?? control.ownerDocument.documentElement;
}

/** Where a glide starts now: the origin's box, moved as far as its control has moved since. */
function start(origin: Origin): Box {
  const now = origin.anchor.getBoundingClientRect();
  // A control that has gone, or stopped rendering, such as one in a dialog that closed, leaves the start where it was.
  if (!origin.anchor.isConnected || (now.width === 0 && now.height === 0)) return origin.box;
  const x = now.left - origin.at.left;
  const y = now.top - origin.at.top;
  const { box } = origin;
  return { ...box, left: box.left + x, right: box.right + x, top: box.top + y, bottom: box.bottom + y };
}

/**
 * What shows a control's ring: the control, the card a card's link stretches over, or the Tag field
 * whose text box it is. The link hands its ring to the card (card.css), so the ring goes around
 * the whole card, and the text box hands its ring to the field (tag-field.css), round its chips.
 */
function holderOf(control: Element): Element {
  if (control.matches("beautiful-tag-field > input")) return control.parentElement!;
  return (control.matches("[data-card-link]") && control.closest("beautiful-card, [data-card]")) || control;
}

/** The control's ring as the browser draws it on its holder, or nothing when it shows none. */
function outlineOf(control: Element, holder: Element): Outline | undefined {
  if (!control.matches(":focus-visible")) return undefined;
  const style = getComputedStyle(holder);
  const width = parseFloat(style.outlineWidth);
  if (style.outlineStyle === "none" || !(width > 0)) return undefined;
  return { width, offset: parseFloat(style.outlineOffset) || 0, color: style.outlineColor };
}

/**
 * The ancestors whose clip the ring takes on: the scroll boxes a person scrolls (overflow auto or
 * scroll), short of the page itself. A control half scrolled out of a dialog's body keeps its ring
 * inside the body. overflow hidden or clip is left out: it trims a look, such as rounded corners,
 * and the ring flies over it.
 */
function clippersOf(target: Element): Element[] {
  const clippers: Element[] = [];
  const root = target.ownerDocument.documentElement;
  for (let at = target.parentElement; at && at !== root && at !== target.ownerDocument.body; at = at.parentElement) {
    const style = getComputedStyle(at);
    if (/auto|scroll/.test(`${style.overflowX} ${style.overflowY}`)) clippers.push(at);
    // Nothing outside a fixed box or the top layer scrolls or clips it.
    if (style.position === "fixed" || at.matches(":modal, :popover-open")) break;
  }
  return clippers;
}

/** Where the target's ring is: its box grown by the outline's offset and width, and what clips it. */
function measure(target: Element, outline: Outline, clippers: Element[]): Box {
  const rect = target.getBoundingClientRect();
  const style = getComputedStyle(target);
  const grow = outline.offset + outline.width;
  const corners = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius];
  const own = corners.flatMap((corner) => {
    const [h = "0", v = h] = corner.split(" ");
    return [length(h, rect.width), length(v, rect.height)];
  });
  // As the browser does, shrink every radius by one factor where two corners would overlap, so a pill's 9999px is half its height.
  const [tlx, tly, trx, tr_y, brx, bry, blx, bly] = own as [number, number, number, number, number, number, number, number];
  const fit = Math.min(1, rect.width / (tlx + trx || 1), rect.width / (blx + brx || 1), rect.height / (tly + bly || 1), rect.height / (tr_y + bry || 1));
  const radii: number[] = [];
  for (let i = 0; i < own.length; i += 2) {
    const x = own[i]! * fit;
    const y = own[i + 1]! * fit;
    // The browser rounds an outline only where the box is round, and grows the curve with the outline.
    const round = x > 0 && y > 0;
    radii.push(round ? Math.max(0, x + grow) : 0, round ? Math.max(0, y + grow) : 0);
  }
  const view = target.ownerDocument.defaultView!;
  let clip: Rect = { left: 0, top: 0, right: view.innerWidth, bottom: view.innerHeight };
  for (const clipper of clippers) {
    const edge = clipper.getBoundingClientRect();
    // The padding box: inside the borders.
    const left = edge.left + clipper.clientLeft;
    const top = edge.top + clipper.clientTop;
    clip = {
      left: Math.max(clip.left, left),
      top: Math.max(clip.top, top),
      right: Math.min(clip.right, left + clipper.clientWidth),
      bottom: Math.min(clip.bottom, top + clipper.clientHeight),
    };
  }
  return {
    left: rect.left - grow,
    top: rect.top - grow,
    right: rect.right + grow,
    bottom: rect.bottom + grow,
    radii,
    clip,
  };
}

function length(value: string, of: number): number {
  return value.endsWith("%") ? (parseFloat(value) / 100) * of : parseFloat(value) || 0;
}

function mix(from: Box, to: Box, t: number): Box {
  const at = (a: number, b: number) => a + (b - a) * t;
  const rect = (a: Rect, b: Rect): Rect => ({
    left: at(a.left, b.left),
    top: at(a.top, b.top),
    right: at(a.right, b.right),
    bottom: at(a.bottom, b.bottom),
  });
  return { ...rect(from, to), radii: from.radii.map((r, i) => at(r, to.radii[i]!)), clip: rect(from.clip, to.clip) };
}

function draw(ring: HTMLElement, box: Box) {
  // The browser snaps an outline's edges to whole CSS pixels. Snapping the ring's too keeps it sharp, and identical at the hand-over.
  const snap = Math.round;
  const left = snap(box.left);
  const top = snap(box.top);
  const width = snap(box.right) - left;
  const height = snap(box.bottom) - top;
  const [a, b, c, d, e, f, g, h] = box.radii.map((r) => `${r}px`);
  ring.style.translate = `${left}px ${top}px`;
  ring.style.width = `${width}px`;
  ring.style.height = `${height}px`;
  ring.style.borderRadius = `${a} ${c} ${e} ${g} / ${b} ${d} ${f} ${h}`;
  const inset = [box.clip.top - top, left + width - box.clip.right, top + height - box.clip.bottom, box.clip.left - left];
  ring.style.clipPath = `inset(${inset.map((n) => `${Math.max(0, n)}px`).join(" ")})`;
}

/** A CSS time, such as 160ms or 0.2s, in milliseconds. */
function parseTime(value: string): number {
  const time = parseFloat(value);
  if (Number.isNaN(time)) return 0;
  return value.trim().endsWith("ms") ? time : time * 1000;
}
