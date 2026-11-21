/**
 * What Stacked layout and Sidebar layout share in script: when their drawer gets out of the way.
 * Their shared look is styles/elements/layout.css.
 */

/**
 * Whether a click in the drawer follows a link in this page, which goes somewhere else, so the
 * drawer closes, as a page load would. One opened in a new tab or window, or downloaded, leaves
 * the page as it is.
 */
export function followsLink(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  return !!link && !link.hasAttribute("download") && (link.getAttribute("target") || "_self") === "_self";
}

/**
 * Calls close when the layout resizes while the drawer is open and its menu button is hidden: the
 * layout grew wide enough to show everything the drawer holds, so it has no reason to be open.
 * Returns the cleanup.
 */
export function closeWhenWide(layout: HTMLElement, menu: () => HTMLElement | undefined, isOpen: () => boolean, close: () => void): () => void {
  const observer = new ResizeObserver(() => {
    if (!isOpen()) return;
    const button = menu();
    if (button && getComputedStyle(button).display === "none") close();
  });
  observer.observe(layout);
  return () => observer.disconnect();
}
