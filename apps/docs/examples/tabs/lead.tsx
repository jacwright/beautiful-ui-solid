import { Tab, TabList, TabPanel, Tabs, Text } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <Tabs id="lead">
      <TabList aria-label="Site">
        <Tab>Overview</Tab>
        <Tab>Pages</Tab>
        <Tab>Visits</Tab>
      </TabList>
      <TabPanel>
        <Text>Live at spring-launch.example.com since Monday.</Text>
      </TabPanel>
      <TabPanel>
        <Text>Home, Pricing and Contact.</Text>
      </TabPanel>
      <TabPanel>
        <Text>1,284 visits this week, up 12%.</Text>
      </TabPanel>
    </Tabs>
  );
}
