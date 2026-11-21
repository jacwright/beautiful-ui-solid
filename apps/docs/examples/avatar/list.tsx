import { Avatar, Text } from "beautiful-ui-solid";

const people = [
  { name: "Maya Chen", email: "maya@northwind.studio", photo: "/avatars/maya.svg" },
  { name: "Sam Okafor", email: "sam@northwind.studio", photo: "/avatars/sam.svg" },
  { name: "Jonas Weber", email: "jonas@northwind.studio" },
];

export default function List() {
  return (
    <ul class="demo-people">
      {people.map((person) => (
        <li>
          <Avatar name={person.name} src={person.photo} decorative />
          <beautiful-demo-name>
            <Text>
              <strong>{person.name}</strong>
            </Text>
            <Text size="sm" tone="muted">
              {person.email}
            </Text>
          </beautiful-demo-name>
        </li>
      ))}
    </ul>
  );
}
