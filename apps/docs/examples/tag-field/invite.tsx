import { Button, Field, Label, TagField, TagFieldDescription, TagFieldOption } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

const team: [value: string, name: string, email: string][] = [
  ["ada", "Ada Lovelace", "ada@example.com"],
  ["grace", "Grace Hopper", "grace@example.com"],
  ["katherine", "Katherine Johnson", "katherine@example.com"],
  ["margaret", "Margaret Hamilton", "margaret@example.com"],
  ["dorothy", "Dorothy Vaughan", "dorothy@example.com"],
  ["mary", "Mary Jackson", "mary@example.com"],
  ["hedy", "Hedy Lamarr", "hedy@example.com"],
  ["radia", "Radia Perlman", "radia@example.com"],
];

/** People to invite, from the team only, sent with a form: people=ada&people=grace. */
export default function Invite() {
  const [sent, setSent] = createSignal("");
  return (
    <form
      class="demo-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(new URLSearchParams(new FormData(event.currentTarget) as never).toString());
      }}
    >
      <Field id="invite-people">
        <Label>Invite</Label>
        <TagField name="people" required placeholder="Search your team">
          <For each={team}>
            {([value, name, email]) => (
              <TagFieldOption value={value} disabled={value === "hedy"}>
                {name}
                <TagFieldDescription>{email}</TagFieldDescription>
              </TagFieldOption>
            )}
          </For>
        </TagField>
      </Field>
      <footer>
        <Button type="reset">Clear</Button>
        <Button type="submit" variant="primary">
          Send invites
        </Button>
      </footer>
      <p class="demo-sent" id="invite-sent">
        {sent() ? `Sent ${sent()}` : "Nothing sent yet"}
      </p>
    </form>
  );
}
