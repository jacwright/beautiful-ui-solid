/**
 * The kit's behavior for plain HTML pages with no Solid: a static website's page wires its own menus,
 * tabs, toasts and focus ring with these. A Solid app uses the kit's components instead. Every module
 * here touches only the DOM.
 */
export { startFocusRing } from "./focus-ring.ts";
export { wireMenu } from "./menu.ts";
export { wireTabs } from "./tab-keys.ts";
export { toast, wireToaster, type ToastOptions } from "./toaster.ts";
export { wireTree } from "./tree.ts";
