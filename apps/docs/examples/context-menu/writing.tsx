import { type ActionList, contextMenu } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

type Size = "small" | "medium" | "large";

export default function Writing() {
  let box!: HTMLTextAreaElement;
  const [size, setSize] = createSignal<Size>("medium");
  const [wrap, setWrap] = createSignal(true);
  const selected = () => box.selectionStart !== box.selectionEnd;
  const edit = (command: string) => () => {
    box.focus();
    document.execCommand(command);
  };
  const actions: ActionList = [
    {
      actions: [
        { id: "undo", label: "Undo", keys: "Mod+Z", run: edit("undo") },
        { id: "redo", label: "Redo", keys: "Shift+Mod+Z", run: edit("redo") },
      ],
    },
    {
      actions: [
        { id: "cut", label: "Cut", keys: "Mod+X", enabled: selected, run: edit("cut") },
        { id: "copy", label: "Copy", keys: "Mod+C", enabled: selected, run: edit("copy") },
        {
          id: "paste",
          label: "Paste",
          keys: "Mod+V",
          run: async () => {
            const text = await navigator.clipboard.readText().catch(() => "");
            box.focus();
            if (text) document.execCommand("insertText", false, text);
          },
        },
        { id: "select-all", label: "Select all", keys: "Mod+A", run: () => box.select() },
      ],
    },
    {
      actions: [
        {
          id: "size",
          label: "Text size",
          actions: [
            {
              select: "one",
              actions: (["small", "medium", "large"] as const).map((each) => ({
                id: each,
                label: each[0]!.toUpperCase() + each.slice(1),
                active: () => size() === each,
                run: () => setSize(each),
              })),
            },
          ],
        },
        { id: "wrap", label: "Wrap lines", active: wrap, run: () => setWrap(!wrap()) },
      ],
    },
  ];
  return (
    <textarea
      ref={(el: HTMLTextAreaElement) => {
        box = el;
        // The browser runs these keys itself in a text box, so the region only shows them.
        contextMenu(actions, undefined, { keys: false, label: () => "Edit" })(el);
      }}
      data-demo-writing=""
      data-size={size()}
      wrap={wrap() ? "soft" : "off"}
      aria-label="Post"
      value="Spring is here, and so is our biggest launch yet. Select some of this text and right-click it."
    />
  );
}
