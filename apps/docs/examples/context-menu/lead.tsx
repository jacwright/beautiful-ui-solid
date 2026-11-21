import { type ActionList, ActionMenu, contextMenu, Text } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

export default function Lead() {
  const [said, say] = createSignal("Right-click the page, or use its … button.");
  const actions: ActionList = [
    { id: "open", label: "Open", run: () => say("Opened Contact.") },
    { id: "rename", label: "Rename", keys: "F2", run: () => say("Renaming Contact.") },
    { id: "duplicate", label: "Duplicate", run: () => say("Duplicated Contact.") },
    { actions: [{ id: "delete", label: "Delete", keys: "Delete", color: "danger", run: () => say("Deleted Contact.") }] },
  ];
  return (
    <beautiful-demo-stack>
      <beautiful-demo-pages role="list" aria-label="Pages">
        <beautiful-demo-page role="listitem" tabindex="0" ref={contextMenu(actions, undefined, { label: () => "Actions for Contact" })}>
          <strong>Contact</strong>
          <code>/contact/</code>
          <ActionMenu actions={actions} context={undefined} label="Actions for Contact" />
        </beautiful-demo-page>
      </beautiful-demo-pages>
      <Text aria-live="polite">{said()}</Text>
    </beautiful-demo-stack>
  );
}
