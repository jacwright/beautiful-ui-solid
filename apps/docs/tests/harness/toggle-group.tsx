import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { ToggleGroup, ToggleGroupItem } from "beautiful-ui-solid";
import { createSignal } from "solid-js";
import { renderHarness } from "./examples.tsx";

// The docs examples, then the blocks that test what no example shows: each kind of group again,
// with what it reports written into the page.

const Bold = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M6 4h5a3 3 0 0 1 0 6H6zM6 10h6a3 3 0 0 1 0 6H6z" />
  </svg>
);
const Italic = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M9 4h6M5 16h6M12 4l-4 12" />
  </svg>
);
const Underline = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M6 3v6a4 4 0 0 0 8 0V3M4 17h12" />
  </svg>
);
/** Writes each onChange call into the page, so a test can read what the component reported. */
function log(name: string) {
  return (value: string | string[]) => {
    const out = document.querySelector<HTMLElement>(`[data-log="${name}"]`)!;
    out.textContent += `${[value].flat().join("+") || "none"} `;
  };
}

function TextStyle(props: { value: string[]; onChange?: (values: string[]) => void }) {
  return (
    <ToggleGroup aria-label="Text style" multiple defaultValue={props.value} onChange={props.onChange}>
      <ToggleGroupItem value="bold" icon aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" icon aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" icon aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function Controlled() {
  const [chart, setChart] = createSignal("visitors");
  return (
    <beautiful-example data-example="controlled">
      <ToggleGroup
        aria-label="Chart, held by the page"
        value={chart()}
        onChange={(value) => {
          setChart(value);
          log("controlled")(value);
        }}
      >
        <ToggleGroupItem value="visitors">Visitors</ToggleGroupItem>
        <ToggleGroupItem value="views">Page views</ToggleGroupItem>
      </ToggleGroup>
      {/* Owned by the page, which never changes it: a choice reports, and the group stays as it is. */}
      <ToggleGroup aria-label="Locked" multiple value={["on"]} onChange={log("held")}>
        <ToggleGroupItem value="on">Locked on</ToggleGroupItem>
        <ToggleGroupItem value="off">Locked off</ToggleGroupItem>
      </ToggleGroup>
      {/* A caller's onClick that prevents the default keeps the state. */}
      <ToggleGroup aria-label="Prevented" onChange={log("prevented")}>
        <ToggleGroupItem value="stays" onClick={(event) => event.preventDefault()}>
          Stays off
        </ToggleGroupItem>
      </ToggleGroup>
      <output data-log="controlled" />
      <output data-log="held" />
      <output data-log="prevented" />
    </beautiful-example>
  );
}

renderHarness("toggle-group", () => (
  <>
    <beautiful-example data-example="single-reported">
      <ToggleGroup aria-label="Period" defaultValue="week" onChange={log("single")}>
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
        <ToggleGroupItem value="year">Year</ToggleGroupItem>
      </ToggleGroup>
    </beautiful-example>
    <output data-log="single" />
    <beautiful-example data-example="multiple-reported">
      <TextStyle value={["underline", "bold"]} onChange={log("multiple")} />
    </beautiful-example>
    <output data-log="multiple" />
    <beautiful-example data-example="none">
      <ToggleGroup aria-label="Nothing chosen" onChange={log("none")}>
        <ToggleGroupItem value="a">First</ToggleGroupItem>
        <ToggleGroupItem value="b">Second</ToggleGroupItem>
      </ToggleGroup>
    </beautiful-example>
    <output data-log="none" />
    <Controlled />
  </>
));
