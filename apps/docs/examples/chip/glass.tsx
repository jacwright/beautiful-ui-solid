import { Button, Chip, ChipGroup, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

export default function Glass() {
  const [people, setPeople] = createSignal([
    { name: "ana@northwind.com", color: "neutral" },
    { name: "sam@northwind.com", color: "neutral" },
    { name: "Design team", color: "accent" },
  ] as const);
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <ChipGroup aria-label="Site tags">
          <Chip color="blue">Landing page</Chip>
          <Chip color="green">Spring sale</Chip>
          <Chip>Draft copy</Chip>
        </ChipGroup>
        <Button commandfor="share-spring" command="show-modal">
          Share
        </Button>
      </beautiful-demo-stage>
      <Dialog id="share-spring">
        <DialogTitle>Share Spring launch</DialogTitle>
        <DialogDescription>These people can edit the site and publish it.</DialogDescription>
        <DialogBody>
          <ChipGroup aria-label="People to invite">
            <For each={people()}>
              {(person) => (
                <Chip color={person.color} onRemove={() => setPeople(people().filter((p) => p !== person))}>
                  {person.name}
                </Chip>
              )}
            </For>
          </ChipGroup>
        </DialogBody>
        <DialogActions>
          <Button commandfor="share-spring" command="close">
            Cancel
          </Button>
          <Button commandfor="share-spring" command="close" variant="primary">
            Send invites
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
