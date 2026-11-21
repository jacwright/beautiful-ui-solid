import { createMemo, createSignal, createUniqueId, flush, For, Show } from "solid-js";
import { type Action, findActions, keyLabel } from "./actions.ts";
import { Dialog } from "./dialog.tsx";
import { type OptionList, wireOptions } from "./options.ts";
import { type ReachableShortcut, reachableShortcuts, shortcutSections } from "./shortcuts.ts";

/**
 * Command palette: a Dialog with a search box over every action reachable from where focus was,
 * from reachableShortcuts (shortcuts.ts). Empty, it lists them in sections by scope, nearest first;
 * typed into, it lists the ones that fit best first, by label and keywords (findActions), each with
 * its scope after it. Each shows its keys, unless a scope further in took them. An action that
 * can't run for its context now is faded and skipped. Enter or a click closes the palette, then
 * runs the action for its context, or follows its link, once focus is back where it was.
 *
 * The box is a combobox whose list is always open (APG Combobox with list autocomplete): focus
 * stays in it, ↑ ↓ move the lit option (aria-activedescendant, options.ts) and typing goes on.
 * Being a modal dialog, it's a wall itself. The look is CSS (styles/elements/command-palette.css).
 * The spec is the docs site's Command palette page.
 */

export type CommandPaletteProps = {
  /** The dialog's id. Left out, it makes one. */
  id?: string;
  /** Where focus was when the palette was asked for: it lists what's reachable from there. Set, it's open. */
  from?: Element;
  /** Called when it closes, however it closed. Set from back to undefined. */
  onClose: () => void;
  /** The search box's name and placeholder. */
  placeholder?: string;
};

type Entry = ReachableShortcut & { id: string };

export function CommandPalette(props: CommandPaletteProps) {
  const id = props.id ?? createUniqueId();
  const [query, setQuery] = createSignal("");
  let input: HTMLInputElement | undefined;
  let listbox: HTMLElement | undefined;
  let list: OptionList | undefined;
  /** The entry picked, run once the dialog has closed and focus is back. */
  let picked: Entry | undefined;

  const entries = createMemo(() => {
    const from = props.from;
    if (!from) return [];
    // Not the palette's own action: it's open already.
    return reachableShortcuts(from)
      .filter((each) => each.action.id !== "command-palette")
      .map((each, i): Entry => ({ ...each, id: `${id}-${i}` }));
  });
  const sections = createMemo(() => {
    const q = query();
    const all = entries();
    if (!q.trim()) return shortcutSections(all) as { scope?: string; shortcuts: Entry[] }[];
    return [{ scope: undefined, shortcuts: findActions(all, q, (each) => each.action) }];
  });
  const searching = () => !!query().trim();
  const count = () => sections().reduce((n, s) => n + s.shortcuts.length, 0);

  /** Marks the lit option selected, as APG's list autocomplete does, and the rest not. */
  function mark() {
    const active = list?.active();
    for (const option of listbox?.querySelectorAll('[role="option"]') ?? []) option.setAttribute("aria-selected", String(option === active));
  }

  /** Lights the first option the keys can reach, once the list has rendered what's typed. */
  function lightFirst() {
    flush();
    list?.setActive(list.options()[0], "nearest");
    mark();
  }

  function pick(option: HTMLElement) {
    picked = entries().find((each) => each.id === option.id);
    if (!picked?.enabled) return void (picked = undefined);
    input?.closest("dialog")?.close();
  }

  function wire(el: HTMLElement) {
    listbox = el;
  }

  /** Opening: the box takes focus (autofocus), and gets a fresh search with its list wired. */
  function onFocus() {
    if (list || !input || !listbox) return;
    setQuery("");
    input.value = "";
    list = wireOptions(listbox, input, pick);
    lightFirst();
  }

  function onInput(event: InputEvent & { currentTarget: HTMLInputElement }) {
    setQuery(event.currentTarget.value);
    lightFirst();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!list) return;
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(event.key)) {
      list.move(event);
      mark();
      event.preventDefault();
    } else if (event.key === "Enter" && !event.isComposing) {
      const active = list.active();
      if (active) pick(active);
      event.preventDefault();
    }
  }

  function run(entry: Entry) {
    const { action, context } = entry;
    if (action.run) return action.run(context);
    const href = action.href?.(context);
    if (!href) return;
    // Clicked as a link, so the app's router follows it as it would a link on the page.
    const link = Object.assign(document.createElement("a"), { href });
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
  }

  return (
    <Dialog
      id={id}
      open={!!props.from}
      size="lg"
      aria-label="Command palette"
      data-command-palette
      onClose={() => {
        list?.unwire();
        list = undefined;
        setQuery("");
        if (input) input.value = "";
        const entry = picked;
        picked = undefined;
        props.onClose();
        // After the dialog has handed focus back, so the action acts where the person was.
        if (entry) requestAnimationFrame(() => run(entry));
      }}
    >
      <input
        ref={(el: HTMLInputElement) => (input = el)}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-autocomplete="list"
        aria-controls={`${id}-list`}
        aria-label={props.placeholder ?? "Search actions"}
        placeholder={props.placeholder ?? "Search actions"}
        autocomplete="off"
        spellcheck={false}
        autofocus
        onFocus={onFocus}
        onInput={onInput}
        onKeyDown={onKeyDown}
      />
      <beautiful-command-palette-list ref={wire} id={`${id}-list`} role="listbox" aria-label="Actions">
        <For each={sections()}>
          {(section, s) => (
            <beautiful-command-palette-group role="group" aria-labelledby={section.scope ? `${id}-group-${s()}` : undefined}>
              <Show when={section.scope}>{(scope) => <header id={`${id}-group-${s()}`}>{scope()}</header>}</Show>
              <For each={section.shortcuts}>{(each) => <Option entry={each} scope={searching() ? each.scope : undefined} />}</For>
            </beautiful-command-palette-group>
          )}
        </For>
      </beautiful-command-palette-list>
      {/* Always on the page, so a screen reader hears its text change. */}
      <p role="status">{count() ? "" : searching() ? "No actions fit that." : "No actions here."}</p>
    </Dialog>
  );
}

function Option(props: { entry: Entry; scope?: string }) {
  const action = () => props.entry.action as Action<unknown>;
  return (
    <beautiful-command-palette-option
      id={props.entry.id}
      role="option"
      aria-selected="false"
      aria-disabled={props.entry.enabled ? undefined : "true"}
    >
      {action().label}
      <Show when={props.scope}>{(scope) => <small>{scope()}</small>}</Show>
      <Show when={!props.entry.shadowed && props.entry.keys}>{(keys) => <kbd>{keyLabel(keys())}</kbd>}</Show>
    </beautiful-command-palette-option>
  );
}

/**
 * The action that opens a palette with ⌘K (Ctrl+K elsewhere), for an app's root scope: it
 * remembers where focus was, as the palette lists what's reachable from there, and hands it to open.
 */
export function commandPaletteAction(open: (from: Element) => void): Action {
  return {
    id: "command-palette",
    label: "Command palette",
    keywords: ["actions", "commands"],
    keys: "Mod+K",
    run: () => open(document.activeElement ?? document.body),
  };
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-command-palette-list": HTMLAttributes<HTMLElement>;
      "beautiful-command-palette-group": HTMLAttributes<HTMLElement>;
      "beautiful-command-palette-option": HTMLAttributes<HTMLElement>;
    }
  }
}
