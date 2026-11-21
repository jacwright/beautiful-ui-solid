import { type ActionList, Button, CommandPalette, commandPaletteAction, shortcuts, Text } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

type Message = { id: string; from: string; subject: string };

const messages: Message[] = [
  { id: "m1", from: "Ana", subject: "Pricing page copy" },
  { id: "m2", from: "Sam", subject: "Spring launch date" },
];

/** An inbox whose ⌘K lists what's reachable from focus: on a message, Archive and Star act on it. */
export default function Lead() {
  const [archived, setArchived] = createSignal<string[]>([]);
  const [from, setFrom] = createSignal<Element>();
  const [said, say] = createSignal("Focus a message and press ⌘K, or use the button.");
  const open = (el: Element) => setFrom(() => el);

  const inbox: ActionList = [
    { id: "compose", label: "New message", keywords: ["write", "compose"], keys: "C", run: () => say("Started a new message.") },
    { id: "mark-read", label: "Mark all as read", run: () => say("Marked every message as read.") },
    commandPaletteAction(open),
  ];
  const message: ActionList<Message> = [
    {
      id: "archive",
      label: "Archive",
      keys: "E",
      enabled: (m) => !archived().includes(m.id),
      run: (m) => {
        setArchived((all) => [...all, m.id]);
        say(`Archived “${m.subject}”.`);
      },
    },
    { id: "star", label: "Star", keywords: ["favorite"], keys: "S", run: (m) => say(`Starred “${m.subject}”.`) },
  ];
  const messageOf = (el: Element) => {
    const row = el.closest<HTMLElement>("[data-message]");
    return row ? messages.find((m) => m.id === row.dataset.message) : undefined;
  };

  return (
    <beautiful-demo-stack ref={shortcuts(inbox, undefined, { label: "Inbox" })}>
      <beautiful-demo-pages role="list" aria-label="Messages to act on" ref={shortcuts(message, messageOf, { label: "Message" })}>
        <For each={messages}>
          {(m) => (
            <beautiful-demo-page
              role="listitem"
              tabindex="0"
              data-message={m.id}
              aria-keyshortcuts="E S"
              aria-description={archived().includes(m.id) ? "Archived" : undefined}
            >
              <strong>{m.from}</strong>
              <code>{m.subject}</code>
            </beautiful-demo-page>
          )}
        </For>
      </beautiful-demo-pages>
      <Button aria-keyshortcuts="Meta+K Control+K" onClick={(event) => open(event.currentTarget)}>
        Command palette
      </Button>
      <Text role="status">{said()}</Text>
      <CommandPalette id="inbox-palette" from={from()} onClose={() => setFrom(undefined)} />
    </beautiful-demo-stack>
  );
}
