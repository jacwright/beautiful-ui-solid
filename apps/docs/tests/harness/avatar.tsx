import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Avatar, Button } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then a block for the behavior no example shows.

const [src, setSrc] = createSignal("/avatars/missing.png");

renderHarness("avatar", () => (
  <beautiful-example data-example="behavior">
    <Avatar id="broken" name="Lucía Reyes" src={src()} />
    <button type="button" id="fix-photo" onClick={() => setSrc("/avatars/lucia.svg")}>
      Fix the photo
    </button>
    <Avatar id="attributes" name="Theo Larsen" src="/avatars/theo.svg" class="extra" title="Theo" loading="lazy" referrerpolicy="no-referrer" />
    <Avatar id="emoji" name="  émile   de la cruz " />
    <Avatar id="labelled" name="Maya Chen" aria-label="Maya Chen, online" size="md" />
    <Button id="with-words">
      <Avatar name="Theo Larsen" decorative /> Theo Larsen
    </Button>
  </beautiful-example>
));
