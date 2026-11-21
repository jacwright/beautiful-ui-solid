import { Tab, TabList, TabPanel, Tabs } from "beautiful-ui-solid";

export default function Icons() {
  return (
    <Tabs id="visits">
      <TabList aria-label="Visits">
        <Tab>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 16h14M5 13V9M9 13V5M13 13v-3M17 13V7" /></svg>{" "}
          Overview
        </Tab>
        <Tab>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 3h6L15 6.5V16a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 3v4h4M7.5 10.5h5M7.5 13.5h5" /></svg>{" "}
          Pages
        </Tab>
        <Tab>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l1-1" /></svg>{" "}
          Sources
        </Tab>
        <Tab disabled>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM10 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM10 10h.01" /></svg>{" "}
          Goals
        </Tab>
      </TabList>
      <TabPanel>
        <p>1,284 visits in the last 7 days, up 18% on the week before.</p>
      </TabPanel>
      <TabPanel>
        <p>The home page had 812 visits, and Pricing 301.</p>
      </TabPanel>
      <TabPanel>
        <p>Most visitors came from search, then from the newsletter.</p>
      </TabPanel>
      <TabPanel>
        <p>No goals yet.</p>
      </TabPanel>
    </Tabs>
  );
}
