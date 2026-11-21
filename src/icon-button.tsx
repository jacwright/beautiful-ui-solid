import { omit } from "solid-js";
import { Button, type ButtonProps } from "./button.tsx";
import { Tooltip, type TooltipProps } from "./tooltip.tsx";

/**
 * Icon button: a Button with only an icon, made square by data-icon-button (styles/elements/button.css),
 * and its name shown in a Tooltip on hover and keyboard focus. The icon names nothing, so the types
 * require label. The tip is the button's name (aria-labelledby), so a screen reader says it once,
 * and no aria-label is set beside it. Everything else is Button's. The spec is the docs site's Icon
 * button page.
 */

/**
 * Button's props, less the names an icon button takes from its tip, and title, whose browser tooltip
 * would show beside the tip and be read again. Kept apart per arm of the union.
 */
type Named<T> = T extends unknown ? Omit<T, "aria-label" | "aria-labelledby" | "title"> : never;

export type IconButtonProps = Named<ButtonProps> & {
  /** The button's name, shown in its Tooltip: the action, such as "Delete", not the picture. */
  label: string;
  /** A key shortcut shown after the name in the tip, such as "⌘Z". Give aria-keyshortcuts too. */
  shortcut?: string;
  /** The side of the button the tip shows on, as on Tooltip. Above it by default. */
  anchor?: TooltipProps["anchor"];
  /** The tip's id. Made up when left out. */
  tooltipId?: string;
};

export function IconButton(props: IconButtonProps) {
  const rest = omit(props, "label", "shortcut", "anchor", "tooltipId");
  return (
    <Tooltip content={props.label} shortcut={props.shortcut} anchor={props.anchor} id={props.tooltipId} names>
      <Button {...(rest as ButtonProps)} data-icon-button="" />
    </Tooltip>
  );
}
