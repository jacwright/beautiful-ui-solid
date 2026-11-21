import { Disclosure, Text } from "beautiful-ui-solid";

const log = `Building 12 pages
src/pages/pricing.astro:14:3
  "plans" is not defined
Build failed in 1.8s`;

export default function Log() {
  return (
    <beautiful-demo-stack>
      <Text>The deploy failed: one page didn't build. The live site hasn't changed.</Text>
      <Disclosure summary="Show the build log">
        <pre tabindex="0">
          <code>{log}</code>
        </pre>
      </Disclosure>
    </beautiful-demo-stack>
  );
}
