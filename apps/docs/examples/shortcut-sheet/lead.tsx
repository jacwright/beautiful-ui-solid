import { type ActionList, Button, ShortcutSheet, shortcutSheetAction, shortcuts, Text } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

type Message = { id: string; from: string; subject: string };

const messages: Message[] = [
  { id: "m1", from: "Ana", subject: "Pricing page copy" },
  { id: "m2", from: "Sam", subject: "Spring launch date" },
];

/** An inbox whose ? opens the sheet: from a message it lists the message's keys too. */
export default function Lead() {
  const [from, setFrom] = createSignal<Element>();
  const [said, say] = createSignal("Press ? here, or focus a message first and press it there.");
  const open = (el: Element) => setFrom(() => el);

  const inbox: ActionList = [
    { id: "compose", label: "New message", keys: "C", run: () => say("Started a new message.") },
    shortcutSheetAction(open),
  ];
  const message: ActionList<Message> = [
    { id: "archive", label: "Archive", keys: "E", run: (m) => say(`Archived “${m.subject}”.`) },
    { id: "star", label: "Star", keys: "S", run: (m) => say(`Starred “${m.subject}”.`) },
  ];
  const messageOf = (el: Element) => {
    const row = el.closest<HTMLElement>("[data-message]");
    return row ? messages.find((m) => m.id === row.dataset.message) : undefined;
  };

  return (
    <beautiful-demo-stack ref={shortcuts(inbox, undefined, { label: "Inbox" })}>
      <beautiful-demo-pages role="list" aria-label="Inbox messages" ref={shortcuts(message, messageOf, { label: "Message" })}>
        <For each={messages}>
          {(m) => (
            <beautiful-demo-page role="listitem" tabindex="0" data-message={m.id} aria-keyshortcuts="E S">
              <strong>{m.from}</strong>
              <code>{m.subject}</code>
            </beautiful-demo-page>
          )}
        </For>
      </beautiful-demo-pages>
      <Button aria-keyshortcuts="?" onClick={(event) => open(event.currentTarget)}>
        Keyboard shortcuts
      </Button>
      <Text role="status">{said()}</Text>
      <ShortcutSheet id="inbox-shortcuts" from={from()} onClose={() => setFrom(undefined)} />
    </beautiful-demo-stack>
  );
}
