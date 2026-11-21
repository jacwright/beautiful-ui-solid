import { Avatar, Button, Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle, Text } from "beautiful-ui-solid";

const people = [
  { name: "Theo Larsen", role: "Owner", photo: "/avatars/theo.svg" },
  { name: "Lucía Reyes", role: "Can edit", photo: "/avatars/lucia.svg" },
  { name: "Aiko Kim", role: "Invited" },
];

export default function InADialog() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="share-spring" command="show-modal">Share</Button>
      </beautiful-demo-stage>
      <Dialog id="share-spring">
        <DialogTitle>Share Spring launch</DialogTitle>
        <DialogDescription>These people can edit the site and publish it.</DialogDescription>
        <DialogBody>
          <ul class="demo-people">
            {people.map((person) => (
              <li>
                <Avatar name={person.name} src={person.photo} decorative />
                <beautiful-demo-name>
                  <Text>
                    <strong>{person.name}</strong>
                  </Text>
                  <Text size="sm" tone="muted">
                    {person.role}
                  </Text>
                </beautiful-demo-name>
              </li>
            ))}
          </ul>
        </DialogBody>
        <DialogActions>
          <Button commandfor="share-spring" command="close">Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
