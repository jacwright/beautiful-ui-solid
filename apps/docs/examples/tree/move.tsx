import { Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Tree } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

/** Line icons, hidden from screen readers. */
const icon = (...paths: string[]) => () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {paths.map((d) => (
      <path d={d} />
    ))}
  </svg>
);

const FolderIcon = icon("M3 6v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-6L8.5 5H4a1 1 0 0 0-1 1z");
const HomeIcon = icon("M3.5 9 10 3.5 16.5 9v7a1 1 0 0 1-1 1h-3.5v-4.5h-4V17H4.5a1 1 0 0 1-1-1z");

type Place = { id: string; label: string; children?: Place[] };

const places: Place[] = [
  {
    id: "/",
    label: "Home",
    children: [
      { id: "/about/", label: "About", children: [{ id: "/about/team/", label: "Team" }] },
      { id: "/blog/", label: "Blog" },
      { id: "/legal/", label: "Legal" },
    ],
  },
];

/** A tree in a glass Dialog: pick the page a page moves under. */
export default function MovePage() {
  const [to, setTo] = createSignal("/blog/");
  const [said, say] = createSignal("Spring launch is under /blog/.");
  return (
    <beautiful-demo-stage>
      <p class="demo-stage-words">Spring launch</p>
      <Button commandfor="move-page" command="show-modal">
        Move page
      </Button>
      <Dialog id="move-page" size="sm" onClose={(value) => value === "move" && say(`Spring launch moved under ${to()}.`)}>
        <DialogTitle>Move Spring launch</DialogTitle>
        <DialogDescription>Pick the page it goes under. Its address changes to match.</DialogDescription>
        <DialogBody>
          <Tree
            label="Where it goes"
            items={places}
            icon={(place) => (place.id === "/" ? <HomeIcon /> : <FolderIcon />)}
            selected={to()}
            onSelect={(place) => setTo(place.id)}
            defaultExpanded={["/"]}
          />
        </DialogBody>
        <DialogActions>
          <Button commandfor="move-page" command="close">
            Cancel
          </Button>
          <Button commandfor="move-page" command="close" value="move" variant="primary">
            Move here
          </Button>
        </DialogActions>
      </Dialog>
      <p role="status">{said()}</p>
    </beautiful-demo-stage>
  );
}
