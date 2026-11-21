import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { Tab, TabList, TabPanel, Tabs } from "beautiful-ui-solid";
import { createSignal, Show } from "solid-js";
import { renderHarness } from "./examples.tsx";

function Held() {
  const [at, setAt] = createSignal(1);
  const [log, setLog] = createSignal<number[]>([]);
  return (
    <beautiful-example data-example="held">
      <p id="held-log">{log().join(" ")}</p>
      <button type="button" id="held-first" data-variant="tertiary" onClick={() => setAt(0)}>
        First
      </button>
      <Tabs
        id="held"
        selectedIndex={at()}
        onChange={(index) => {
          setLog((all) => [...all, index]);
          // Holds the selection back from the last tab, as a parent that refuses one would.
          if (index !== 2) setAt(index);
        }}
      >
        <TabList aria-label="Held">
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanel>First panel</TabPanel>
        <TabPanel>Second panel</TabPanel>
        <TabPanel>Third panel</TabPanel>
      </Tabs>
    </beautiful-example>
  );
}

function Toggled() {
  const [shown, setShown] = createSignal(true);
  return (
    <beautiful-example data-example="toggled">
      <button type="button" id="toggle-middle" data-variant="tertiary" onClick={() => setShown((on) => !on)}>
        Toggle the middle tab
      </button>
      <Tabs id="toggled">
        <TabList aria-label="Toggled">
          <Tab>Left</Tab>
          <Show when={shown()}>
            <Tab>Middle</Tab>
          </Show>
          <Tab>Right</Tab>
        </TabList>
        <TabPanel>Left panel</TabPanel>
        <Show when={shown()}>
          <TabPanel>Middle panel</TabPanel>
        </Show>
        <TabPanel>Right panel</TabPanel>
      </Tabs>
    </beautiful-example>
  );
}

const [clicks, setClicks] = createSignal(0);

renderHarness("tabs", () => (
  <>
    <Held />
    <Toggled />
    <beautiful-example data-example="out-of-range">
      <Tabs id="out-of-range" defaultIndex={7}>
        <TabList aria-label="Out of range">
          <Tab>Start</Tab>
          <Tab>End</Tab>
        </TabList>
        <TabPanel>Start panel</TabPanel>
        <TabPanel>End panel</TabPanel>
      </Tabs>
    </beautiful-example>
    <beautiful-example data-example="first-disabled">
      <Tabs id="first-disabled">
        <TabList aria-label="First disabled">
          <Tab disabled>Locked</Tab>
          <Tab>Open</Tab>
        </TabList>
        <TabPanel>Locked panel</TabPanel>
        <TabPanel>Open panel</TabPanel>
      </Tabs>
    </beautiful-example>
    <beautiful-example data-example="passed">
      <Tabs id="passed" class="extra" data-note="tabs">
        <TabList aria-label="Passed" ref={(el: HTMLElement) => el.setAttribute("data-reffed", "")} data-note="list">
          <Tab data-note="tab" onClick={() => setClicks((n) => n + 1)}>
            Counted
          </Tab>
          <Tab>Other</Tab>
          <Tab onClick={(event: MouseEvent) => event.preventDefault()}>Blocked</Tab>
        </TabList>
        <TabPanel data-note="panel">Counted panel</TabPanel>
        <TabPanel>Other panel</TabPanel>
        <TabPanel>Blocked panel</TabPanel>
      </Tabs>
      <p id="passed-clicks">{clicks()}</p>
    </beautiful-example>
  </>
));
