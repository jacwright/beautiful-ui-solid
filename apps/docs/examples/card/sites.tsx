import { Button, Card, CardLink, Heading, Text } from "beautiful-ui-solid";
import { For, Show } from "solid-js";

const sites = [
  { slug: "spring-launch", name: "Spring launch", domain: "springlaunch.com", note: "Published 2 hours ago." },
  { slug: "harbor-coffee", name: "Harbor Coffee", domain: "harborcoffee.co", note: "Published yesterday." },
  { slug: "fern-studio", name: "Fern Studio", domain: "fern.studio", note: "3 changes waiting to go live.", publish: true },
];

export default function Sites() {
  return (
    <beautiful-demo-stage>
      <ul class="demo-cards" aria-label="Sites">
        <For each={sites}>
          {(site) => (
            <Card as="li">
              <img src={`/media/${site.slug}.svg`} alt="" />
              <hgroup>
                <Heading level={3}>
                  <CardLink href={`#${site.slug}`}>{site.name}</CardLink>
                </Heading>
                <Text>{site.domain}</Text>
              </hgroup>
              <Text>{site.note}</Text>
              <Show when={site.publish}>
                <footer>
                  <Button variant="primary">Publish</Button>
                </footer>
              </Show>
            </Card>
          )}
        </For>
      </ul>
    </beautiful-demo-stage>
  );
}
