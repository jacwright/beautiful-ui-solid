import { Dialog, DialogActions, DialogBody, DialogDescription, type DialogProps, DialogTitle } from "./dialog.tsx";

/**
 * Alert: a Dialog that asks a short question, on the same <dialog>, parts and CSS
 * (styles/elements/dialog.css). The spec is the docs site's Alert page. It differs from Dialog
 * in that it is a role="alertdialog" and a backdrop click does nothing (closedby="closerequest").
 * Keyed on the role, Dialog focuses the first action as it opens, unless something in the alert has
 * autofocus, and the CSS gives it the sm width and, on a phone, the bottom card.
 */

export type AlertProps = Omit<DialogProps, "role" | "closedby">;

export function Alert(props: AlertProps) {
  return <Dialog {...props} role="alertdialog" closedby="closerequest" />;
}

/** The question. Names the alert. */
export const AlertTitle = DialogTitle;

/** What happens if the user says yes. Screen readers read it when the alert opens. */
export const AlertDescription = DialogDescription;

/** Optional: a field the answer needs, such as typing a name to confirm. */
export const AlertBody = DialogBody;

/** The answers, Cancel first. On a narrow screen they stack, primary on top. */
export const AlertActions = DialogActions;
