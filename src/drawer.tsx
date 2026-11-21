import { omit } from "solid-js";
import { Dialog, DialogActions, DialogBody, DialogDescription, type DialogProps, DialogTitle } from "./dialog.tsx";

/**
 * Drawer: a Dialog that slides in from an edge of the screen. It is Dialog's <dialog>, with its
 * parts, its focus and close wiring and its surface, and data-drawer naming the edge. The look and
 * the slide are CSS (styles/elements/drawer.css). The spec is the docs site's Drawer page.
 */

export type DrawerSide = "start" | "end" | "top" | "bottom";

export type DrawerProps = Omit<DialogProps, "size"> & {
  /** The edge it slides in from. start and end follow the writing direction. Defaults to end. */
  side?: DrawerSide;
  /** A side drawer's width: 20, 28 (the default) or 40rem. A top or bottom drawer is the screen's width. */
  size?: "sm" | "md" | "lg";
};

export function Drawer(props: DrawerProps) {
  const rest = omit(props, "side");
  return <Dialog {...rest} data-drawer={props.side ?? "end"} />;
}

/** Names the drawer. */
export const DrawerTitle = DialogTitle;

/** Describes the drawer. */
export const DrawerDescription = DialogDescription;

/** The content. It fills the drawer's height and is the only part that scrolls. */
export const DrawerBody = DialogBody;

/** The buttons, at the bottom of the drawer. On narrow screens they stack, primary on top. */
export const DrawerActions = DialogActions;
