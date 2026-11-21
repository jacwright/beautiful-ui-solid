import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { ToggleButton } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then the blocks that test what no example shows.

/** Writes each onChange call into the page, so a test can read what the component reported. */
function log(name: string) {
  return (pressed: boolean) => {
    const out = document.querySelector<HTMLElement>(`[data-log="${name}"]`)!;
    out.textContent += `${pressed} `;
  };
}

function Controlled() {
  const [preview, setPreview] = createSignal(false);
  return (
    <beautiful-example data-example="controlled">
      <ToggleButton
        pressed={preview()}
        onChange={(on) => {
          setPreview(on);
          log("controlled")(on);
        }}
        color="accent"
      >
        Live preview
      </ToggleButton>
      {/* Owned by the page, which never changes it: a click reports, and the button stays as it is. */}
      <ToggleButton pressed onChange={log("held")}>
        Locked on
      </ToggleButton>
      {/* A caller's onClick that prevents the default keeps the state. */}
      <ToggleButton onClick={(event) => event.preventDefault()} onChange={log("prevented")}>
        Stays off
      </ToggleButton>
      <output data-log="controlled" />
      <output data-log="held" />
      <output data-log="prevented" />
    </beautiful-example>
  );
}

renderHarness("toggle-button", () => (
  <>
    {/* Owns its state from defaultPressed, and reports each flip. */}
    <beautiful-example data-example="reported">
      <ToggleButton defaultPressed onChange={log("reported")}>
        Show drafts
      </ToggleButton>
      <output data-log="reported" />
    </beautiful-example>
    <Controlled />
  </>
));
