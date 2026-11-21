import { Tab, TabList, TabPanel, Tabs } from "beautiful-ui-solid";

export default function Vertical() {
  return (
    <Tabs id="account" vertical>
      <TabList aria-label="Account">
        <Tab>Profile</Tab>
        <Tab>Team</Tab>
        <Tab>Notifications</Tab>
        <Tab>Security</Tab>
      </TabList>
      <TabPanel>
        <p>Your name and photo show to your team, on comments and in the activity log.</p>
      </TabPanel>
      <TabPanel>
        <p>Four people are on Harbour Studio. Owners manage billing and the team, and editors change the sites.</p>
      </TabPanel>
      <TabPanel>
        <p>Email goes to the address you sign in with, when a form is sent or a payment fails.</p>
      </TabPanel>
      <TabPanel>
        <p>You sign in with a passkey on two devices. Remove one you no longer have.</p>
      </TabPanel>
    </Tabs>
  );
}
