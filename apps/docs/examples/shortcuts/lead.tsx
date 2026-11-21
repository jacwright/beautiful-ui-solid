import { type ActionList, ariaKeys, Field, Label, shortcuts, Text, Textarea } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

type Message = { id: string; from: string; subject: string };

const messages: Message[] = [
  { id: "m1", from: "Ana", subject: "Pricing page copy" },
  { id: "m2", from: "Sam", subject: "Spring launch date" },
  { id: "m3", from: "Lee", subject: "New logo files" },
];

/** Three scopes, one inside the next: the inbox, a message, and the reply box. */
export default function Lead() {
  const [said, say] = createSignal("Focus a message and press E, S or Delete. R goes to the reply, and ⌘↵ sends it.");
  let reply: HTMLTextAreaElement | undefined;

  const inbox: ActionList = [{ id: "reply", label: "Reply", keys: "R", run: () => reply?.focus() }];
  const message: ActionList<Message> = [
    { id: "archive", label: "Archive", keys: "E", run: (m) => say(`Archived “${m.subject}”.`) },
    { id: "star", label: "Star", keys: "S", run: (m) => say(`Starred “${m.subject}”.`) },
    { id: "delete", label: "Delete", keys: "Delete", color: "danger", run: (m) => say(`Deleted “${m.subject}”.`) },
  ];
  const replying: ActionList = [
    {
      id: "send",
      label: "Send",
      keys: "Mod+Enter",
      run: () => {
        if (!reply) return;
        say(reply.value.trim() ? `Sent “${reply.value.trim()}”.` : "Write a reply first.");
        reply.value = "";
      },
    },
  ];
  const messageOf = (el: Element) => {
    const row = el.closest<HTMLElement>("[data-message]");
    return row ? messages.find((m) => m.id === row.dataset.message) : undefined;
  };

  return (
    <beautiful-demo-stack ref={shortcuts(inbox, undefined, { label: "Inbox" })}>
      <beautiful-demo-pages role="list" aria-label="Messages" ref={shortcuts(message, messageOf, { label: "Message" })}>
        <For each={messages}>
          {(m) => (
            <beautiful-demo-page role="listitem" tabindex="0" data-message={m.id} aria-keyshortcuts="E S Delete">
              <strong>{m.from}</strong>
              <code>{m.subject}</code>
            </beautiful-demo-page>
          )}
        </For>
      </beautiful-demo-pages>
      <Field id="shortcuts-reply">
        <Label>Reply</Label>
        <Textarea
          data-demo-writing
          aria-keyshortcuts={ariaKeys("Mod+Enter")}
          ref={(el: HTMLTextAreaElement) => {
            reply = el;
            shortcuts(replying, undefined, { label: "Reply" })(el);
          }}
        />
      </Field>
      <Text role="status">{said()}</Text>
    </beautiful-demo-stack>
  );
}
