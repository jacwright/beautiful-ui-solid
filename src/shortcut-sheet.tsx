import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js";
import { type Action, isApple, keyLabel, pressedKeys } from "./actions.ts";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "./description-list.tsx";
import { Button } from "./button.tsx";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "./dialog.tsx";
import { Description, Field, Label } from "./fieldset.tsx";
import { Heading } from "./heading.tsx";
import { hasOwnKeys, isSingleKey, setActionKeys, setShortcutSettings, setSingleKeys, shortcutSettings } from "./shortcut-settings.ts";
import { inTextBox, keysProblem, type ReachableShortcut, reachableShortcuts, shortcutSections } from "./shortcuts.ts";
import { Switch } from "./switch.tsx";
import { Text } from "./text.tsx";

/**
 * Shortcut sheet: a Dialog listing the keyboard shortcuts that work from where focus was, one
 * section per scope, innermost first, from reachableShortcuts (shortcuts.ts). Keys a scope further
 * in took or the text box keeps, and actions that can't run for their context now, are left out, so
 * every key listed works from there. Being a modal dialog, it's a wall itself.
 *
 * It's also where a person makes the keys their own (WCAG 2.1.4): a switch turns single-character
 * keys off, and Change keys lets them press new keys for an action, or remove its keys. Their choice
 * is kept by shortcut-settings.ts, which every surface reads keys through.
 *
 * The look is CSS (styles/elements/shortcut-sheet.css). The spec is the docs site's Shortcut sheet page.
 */

export type ShortcutSheetProps = {
  /** The dialog's id. Left out, Dialog makes one. */
  id?: string;
  /** Where focus was when the sheet was asked for: it lists what works from there. Set, it's open. */
  from?: Element;
  /** Called when it closes. Set from back to undefined. */
  onClose: () => void;
  /** The dialog's title. */
  title?: string;
};

/** Keys that work the controls themselves, never a shortcut on their own. */
const controlKeys = new Set(["Tab", "Shift+Tab", "Enter", " ", "Shift+ "]);

export function ShortcutSheet(props: ShortcutSheetProps) {
  const id = props.id ?? createUniqueId();
  const [editing, setEditing] = createSignal(false, { ownedWrite: true });
  /** The id of the action whose new keys are being pressed, or "" for none. */
  const [recording, setRecording] = createSignal("", { ownedWrite: true });
  const [status, setStatus] = createSignal("", { ownedWrite: true });
  let dialog: HTMLDialogElement | undefined;

  const reached = createMemo(() => {
    // Read first, so the list follows a change of keys and of where it opened from.
    shortcutSettings();
    const from = props.from;
    // The sheet is a modal dialog, a wall, so it sees past itself to what's behind.
    return from ? reachableShortcuts(from, dialog) : [];
  });
  const sections = createMemo(() => {
    const all = reached();
    if (!editing()) return shortcutSections(all.filter((each) => each.keys && !each.shadowed && each.enabled));
    // Changing keys lists every action that has keys, or had them: one the person turned off comes back here.
    const seen = new Set<string>();
    return shortcutSections(
      all.filter((each) => {
        if (!each.enabled || !(each.action.keys || hasOwnKeys(each.action)) || seen.has(each.action.id)) return false;
        seen.add(each.action.id);
        return true;
      }),
    );
  });
  const changed = () => {
    const now = shortcutSettings();
    return !now.singleKeys || Object.keys(now.keys).length > 0;
  };

  function startEditing() {
    setStatus("");
    setEditing(true);
    // Said once the status line is on the page, so a screen reader announces it.
    queueMicrotask(() => setStatus("Choose an action's keys to press new ones."));
  }
  function stopEditing() {
    setRecording("");
    setEditing(false);
  }
  function record(action: Action<any>) {
    setRecording(action.id);
    setStatus(`Press the new keys for ${action.label}. Esc cancels.`);
  }
  function cancel() {
    if (!recording()) return;
    setRecording("");
    setStatus("Nothing changed.");
  }
  function capture(entry: ReachableShortcut, event: KeyboardEvent) {
    if (recording() !== entry.action.id) return;
    const keys = pressedKeys(event);
    if (!keys) return;
    // Tab still moves on, and leaving the button ends the recording.
    if (keys === "Tab" || keys === "Shift+Tab") return;
    event.preventDefault();
    event.stopPropagation();
    if (keys === "Escape") return cancel();
    if (controlKeys.has(keys)) return void setStatus("Enter, Space and Tab work the controls. Press other keys.");
    // Keys are written joined by +, so + itself can't be one of them.
    if (event.key === "+") return void setStatus("+ can't be part of a shortcut. Press other keys.");
    // Opened from a text box, as an editor, a single key would stop typing that character there.
    if (isSingleKey(keys) && props.from && inTextBox(props.from)) {
      return void setStatus(`A single key would stop ${keyLabel(keys)} typing here. Add ${isApple() ? "⌘, ⌃ or ⌥" : "Ctrl or Alt"}.`);
    }
    const problem = keysProblem(entry.action, keys, reached());
    if (problem) return void setStatus(`${problem} Press other keys, or Esc.`);
    const own = entry.action.keys && keyLabel(entry.action.keys) === keyLabel(keys);
    setActionKeys(entry.action.id, own ? undefined : keys);
    setRecording("");
    setStatus(`${entry.action.label} is now ${keyLabel(keys)}.`);
  }
  function remove(action: Action<any>) {
    setRecording("");
    setActionKeys(action.id, null);
    setStatus(`${action.label} has no keys now.`);
  }
  function reset(action: Action<any>) {
    setRecording("");
    // Its own keys may be another action's by now: Reset is refused as pressing them would be.
    const problem = action.keys && keysProblem(action, action.keys, reached());
    if (problem) return void setStatus(`${problem} Change those first.`);
    setActionKeys(action.id, undefined);
    setStatus(action.keys ? `${action.label} is back to ${keyLabel(action.keys)}.` : `${action.label} has no keys now.`);
  }
  function resetAll() {
    setRecording("");
    setShortcutSettings({ singleKeys: true, keys: {} });
    setStatus("Every key is back to the app's own.");
  }

  return (
    <Dialog
      id={id}
      open={!!props.from}
      onClose={() => {
        stopEditing();
        props.onClose();
      }}
      ref={(el: HTMLDialogElement) => (dialog = el)}
      size="md"
      data-shortcut-sheet
      data-editing={editing() ? "" : undefined}
    >
      <DialogTitle>{props.title ?? "Keyboard shortcuts"}</DialogTitle>
      <DialogBody>
        <Field>
          <Label>Single-key shortcuts</Label>
          <Description>Keys with no {isApple() ? "⌘, ⌃ or ⌥" : "Ctrl or Alt"}, such as ?. Turn them off if they get in the way of typing or speech.</Description>
          <Switch checked={shortcutSettings().singleKeys} onChange={(on) => setSingleKeys(on)} />
        </Field>
        <Show when={editing()}>
          <Text role="status">{status()}</Text>
        </Show>
        <Show when={sections().length} fallback={<Text>No keyboard shortcuts work here.</Text>}>
          {/* Sections by place, since two can share a label, and rows by action, so a row keeps its button, and focus, when its keys change. */}
          <For each={sections()} keyed={false}>
            {(section) => (
              <>
                <Show when={section().scope}>{(scope) => <Heading level={3}>{scope()}</Heading>}</Show>
                <DescriptionList>
                  <For each={section().shortcuts} keyed={(each) => each.action.id}>
                    {(each) => (
                      <>
                        <DescriptionTerm>{each().action.label}</DescriptionTerm>
                        <DescriptionDetails>
                          <Show when={editing()} fallback={<kbd>{each().keys ? keyLabel(each().keys!) : ""}</kbd>}>
                            <Row
                              entry={each()}
                              recording={recording() === each().action.id}
                              onRecord={record}
                              onKey={capture}
                              onBlur={cancel}
                              onRemove={remove}
                              onReset={reset}
                            />
                          </Show>
                        </DescriptionDetails>
                      </>
                    )}
                  </For>
                </DescriptionList>
              </>
            )}
          </For>
        </Show>
      </DialogBody>
      <DialogActions>
        <Show when={editing() && changed()}>
          <Button variant="tertiary" onClick={resetAll}>
            Reset all
          </Button>
        </Show>
        <Button onClick={() => (editing() ? stopEditing() : startEditing())}>{editing() ? "Done" : "Change keys"}</Button>
        <Button commandfor={id} command="close">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** One action's keys while they're being changed: the keys, to press new ones, then Reset or Remove. */
function Row(props: {
  entry: ReachableShortcut;
  recording: boolean;
  onRecord: (action: Action<any>) => void;
  onKey: (entry: ReachableShortcut, event: KeyboardEvent) => void;
  onBlur: () => void;
  onRemove: (action: Action<any>) => void;
  onReset: (action: Action<any>) => void;
}) {
  const action = () => props.entry.action;
  const keys = () => props.entry.keys;
  return (
    <>
      <Button
        data-shortcut-keys=""
        data-recording={props.recording ? "" : undefined}
        aria-label={`${action().label}: ${props.recording ? "Press keys…" : keys() ? keyLabel(keys()!) : "None"}`}
        aria-description={props.recording ? undefined : "Press to change"}
        onClick={() => !props.recording && props.onRecord(action())}
        onKeyDown={(event: KeyboardEvent) => props.onKey(props.entry, event)}
        onBlur={() => props.recording && props.onBlur()}
      >
        <Show when={!props.recording} fallback="Press keys…">
          <Show when={keys()} fallback="None">
            {(shown) => <kbd>{keyLabel(shown())}</kbd>}
          </Show>
        </Show>
      </Button>
      {/* One more button a row: Reset once the person changed its keys, else Remove while it has some. */}
      <Show
        when={hasOwnKeys(action())}
        fallback={
          <Show when={keys()}>
            <Button variant="tertiary" aria-label={`Remove ${action().label}'s keys`} onClick={() => props.onRemove(action())}>
              Remove
            </Button>
          </Show>
        }
      >
        <Button variant="tertiary" aria-label={`Reset ${action().label}'s keys`} onClick={() => props.onReset(action())}>
          Reset
        </Button>
      </Show>
    </>
  );
}

/**
 * The action that opens a sheet with ?, for an app's root scope: it remembers where focus was, as
 * the sheet lists what works from there, and hands it to open. ? is kept by a text box, and by a list or
 * tree that picks items by typing, so it opens the sheet from anywhere else. With single-key
 * shortcuts off, ? doesn't run: the command palette still lists it, as does a button that opens it.
 */
export function shortcutSheetAction(open: (from: Element) => void): Action {
  return {
    id: "shortcut-sheet",
    label: "Keyboard shortcuts",
    keys: "?",
    run: () => open(document.activeElement ?? document.body),
  };
}
