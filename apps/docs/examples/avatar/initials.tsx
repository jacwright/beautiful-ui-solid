import { Avatar } from "beautiful-ui-solid";

const people = ["Priya Natarajan", "Jonas Weber", "Aiko Kim", "Omar Silva", "Hana Kim", "Elena Petrova", "Ruth Mbeki", "Grace Tanaka"];

export default function Initials() {
  return (
    <beautiful-demo-row>
      {people.map((name) => (
        <Avatar name={name} size="lg" />
      ))}
      <Avatar name="Guest" color="neutral" size="lg" />
    </beautiful-demo-row>
  );
}
