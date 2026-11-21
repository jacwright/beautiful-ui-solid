import { Card, Heading, Text } from "beautiful-ui-solid";
import { For } from "solid-js";

const stats = [
  { name: "Visitors", value: "12,480", change: "Up 8% on the week before." },
  { name: "Form replies", value: "312", change: "Up 21% on the week before." },
  { name: "Revenue", value: "$4,210", change: "Down 3% on the week before." },
];

export default function Stats() {
  return (
    <ul class="demo-cards" aria-label="The last 7 days">
      <For each={stats}>
        {(stat) => (
          <Card as="li">
            <Heading level={3}>{stat.name}</Heading>
            <Text class="demo-stat">{stat.value}</Text>
            <Text>{stat.change}</Text>
          </Card>
        )}
      </For>
    </ul>
  );
}
