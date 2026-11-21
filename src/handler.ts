/** Runs a handler a caller passed as a JSX prop, in either of Solid's forms: a function, or [function, data]. */
export function call<E extends Event>(handler: unknown, event: E) {
  if (typeof handler === "function") handler(event);
  else if (Array.isArray(handler) && typeof handler[0] === "function") handler[0](handler[1], event);
}
