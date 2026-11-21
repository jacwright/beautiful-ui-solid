import { Tab, TabList, TabPanel, Tabs } from "beautiful-ui-solid";

export default function Settings() {
  return (
    <Tabs id="settings">
      <TabList aria-label="Site settings">
        <Tab>General</Tab>
        <Tab>Domains</Tab>
        <Tab>Forms</Tab>
        <Tab>Billing</Tab>
      </TabList>
      <TabPanel>
        <p>Spring launch is live at spring-launch.example.com. Its name and summary show on your dashboard and in search results.</p>
      </TabPanel>
      <TabPanel>
        <p>springlaunch.com points here, and its certificate renews on its own. Add another domain to send its visitors here too.</p>
      </TabPanel>
      <TabPanel>
        <p>Two forms take submissions: Contact and Waitlist. 38 came in this week.</p>
      </TabPanel>
      <TabPanel>
        <p>$29 a month, paid by card ending 4242. The next payment is on December 1.</p>
      </TabPanel>
    </Tabs>
  );
}
