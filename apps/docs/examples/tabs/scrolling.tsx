import { Tab, TabList, TabPanel, Tabs } from "beautiful-ui-solid";

export default function Scrolling() {
  return (
    <Tabs id="site" manual>
      <TabList aria-label="Spring launch">
        <Tab>Pages</Tab>
        <Tab>Posts</Tab>
        <Tab>Forms</Tab>
        <Tab>Files</Tab>
        <Tab>Database</Tab>
        <Tab>Routes</Tab>
        <Tab>Secrets</Tab>
        <Tab>Logs</Tab>
      </TabList>
      <TabPanel><p>12 pages, 3 of them drafts.</p></TabPanel>
      <TabPanel><p>4 posts. The newest went out on Monday.</p></TabPanel>
      <TabPanel><p>Contact and Waitlist take submissions.</p></TabPanel>
      <TabPanel><p>86 files, 41 MB in all.</p></TabPanel>
      <TabPanel><p>One database with 3 tables.</p></TabPanel>
      <TabPanel><p>Two routes run code: /api/subscribe and /api/feedback.</p></TabPanel>
      <TabPanel><p>One secret is set: the newsletter's API key.</p></TabPanel>
      <TabPanel><p>No errors in the last day.</p></TabPanel>
    </Tabs>
  );
}
