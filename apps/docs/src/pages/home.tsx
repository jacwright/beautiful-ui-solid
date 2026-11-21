import { Callout, CalloutTitle, Card, CardLink } from "beautiful-ui-solid";
import { For } from "solid-js";
import { Example } from "../spec.tsx";
import { indigo, ink, marigold } from "./illustrations.tsx";
import { levels } from "./shadows.tsx";

/** The places to go next, each a card that links to its page. */
const starts = [
  { href: "/button", title: "Button", text: "The first component, and the light every raised part shares." },
  { href: "/shadows", title: "Shadows", text: "Four depths, one light from the top right, and the glint." },
  { href: "/focus-ring", title: "Focus ring", text: "The ring that glides from control to control as you Tab." },
  { href: "/sidebar-layout", title: "Sidebar layout", text: "A whole app's page, as this site is built on it." },
  { href: "/websites", title: "Websites", text: "How a static website with no JS lays out its pages." },
  { href: "/illustrations", title: "Illustrations", text: "The house picture style, and the prompts that make it." },
] as const;

/** The tokens a part reads in place of a number of its own. Every one is in src/styles/tokens.css. */
const tokens = [
  { family: "Space", names: "--space-1 to --space-32", use: "Gaps and padding, in quarter-rem steps up to 2rem, then a website's section spacing." },
  { family: "Radius", names: "--radius-xs to --radius-xl, --radius-full", use: "Corners. Nothing focusable is square, so its ring never is." },
  { family: "Shadow", names: "--shadow-1 to --shadow-4", use: "The four depths. No part makes a shadow of its own." },
  { family: "Type", names: "--text-xs to --text-display", use: "Sizes, each with its own line height. Display scales with the screen." },
  { family: "Motion", names: "--motion-enter, --motion-exit, --ease-out…", use: "Durations and curves. Enter is slower than exit." },
  { family: "Surface", names: "--surface-*", use: "What a pane is made of. A theme sets them, and a part only reads them." },
] as const;

/** The brand's colors (as on the Illustrations guide): ink and white, with two highlights. */
const brand = [
  { ...ink, note: "text, lines and the logo" },
  { ...indigo, note: "a highlight, and the main wash in a picture" },
  { ...marigold, note: "one small thing to catch the eye" },
] as const;

export default function HomePage() {
  return (
    <article class="home">
      <h1>Beautiful UI</h1>
      <p class="lede">
        A UI kit for Solid. Its components come in three themes, modern, glass and classic, and each
        theme has a light and a dark mode, so every app looks like part of the same family. Each component is built on
        the browser's own elements, so it is fast, works with the keyboard and screen readers, and stays simple.
      </p>
      <Example hero title="A settings card" name="home/lead" />

      <h2>Three themes, each in light and dark</h2>
      <p>
        <strong>Modern</strong> is the default: a quiet, dense SaaS look, after Linear, Notion and Mercury. Opaque and
        flat: a card is a pane with a hairline edge and no shadow, and only what floats over the page casts one. Grays
        lean a touch cool, corners are tighter, controls are 32px where the pointer is a mouse, the type is the
        system's own, and motion is quick, with no overshoot.
      </p>
      <p>
        <strong>Glass</strong> is on <code>data-theme="glass"</code>. Panes are a bezel of clear glass around a frosted panel, lit from the top
        right: a hairline rim brightest along the top, a hotspot toward the right of it, and shadows that fall down and
        to the left, away from the light. Nothing moves; it catches light the way a real pane does.
      </p>
      <p>
        <strong>Classic</strong> is the same kit with solid surfaces: no blur, shadows straight down, no glint. It is
        every component's first draft, since each is built in classic and glass is a layer on top, and it is what glass
        falls back to where the browser has no <code>backdrop-filter</code> or someone asks for reduced transparency.
      </p>
      <p>
        The theme and the mode are two attributes on the root, <code>data-theme="modern|glass|classic"</code> (none is modern) and{" "}
        <code>data-mode="light|dark"</code>, and any of the six pairs works.
      </p>
      <Callout>
        <CalloutTitle>Try them here</CalloutTitle>
        <p>
          Every page on this site switches with the buttons at the bottom right, or with <kbd>T</kbd> for the theme
          and <kbd>M</kbd> for the mode, from anywhere on a page.
        </p>
      </Callout>

      <h2>How a component is built</h2>
      <ul>
        <li>
          <strong>Solid 2.</strong> Every app is a Solid client-side app made from these components. Each component is
          one <code>.tsx</code> file a reader takes in at once, with no headless toolkit underneath.
        </li>
        <li>
          <strong>Native first.</strong> A Dialog is a <code>&lt;dialog&gt;</code>, a Popover is a{" "}
          <code>popover</code>, a Disclosure is a <code>&lt;details&gt;</code>, and buttons open them with{" "}
          <code>commandfor</code>. JavaScript is written only for what the platform lacks.
        </li>
        <li>
          <strong>Fewest nodes.</strong> A wrapper has to earn its place. Checkmarks, chevrons and indicators are drawn
          with pseudo-elements and CSS masks, not extra elements.
        </li>
        <li>
          <strong>Native CSS.</strong> Custom properties and cascade layers, no Tailwind. The CSS styles the plain
          markup, so a static website gets the same look with no JavaScript at all.
        </li>
        <li>
          <strong>Light DOM.</strong> No shadow DOM, so an app's own CSS and the browser's tools reach every part.
        </li>
      </ul>

      <h2>No div, no span</h2>
      <p>
        Where no semantic element fits, the kit names one: a <code>beautiful-*</code> custom element, so the markup says
        what each part is. A component is <code>beautiful-&lt;component&gt;</code> and a part of it{" "}
        <code>beautiful-&lt;component&gt;-&lt;part&gt;</code>. Elements that mean something stay native:{" "}
        <code>&lt;button&gt;</code>, <code>&lt;input&gt;</code>, <code>&lt;dialog&gt;</code>, <code>&lt;p&gt;</code>,{" "}
        <code>&lt;header&gt;</code>, <code>&lt;kbd&gt;</code>.
      </p>
      <pre tabindex="0">
        <code>{`<beautiful-card>…</beautiful-card>
<beautiful-menu popover role="menu">
  <beautiful-menu-section role="group">…</beautiful-menu-section>
</beautiful-menu>
<beautiful-tooltip popover="hint" role="tooltip">Copy link</beautiful-tooltip>`}</code>
      </pre>
      <p>
        A custom element is inline until its CSS sets a <code>display</code>. The rule holds everywhere, in the
        components, the examples, these pages and the tests: a test reads the source for any <code>div</code> or{" "}
        <code>span</code>, and another checks the page each route renders.
      </p>

      <h2>Every example is a component</h2>
      <p>
        Each example on this site is a Solid component, <code>examples/&lt;component&gt;/&lt;name&gt;.tsx</code>, shown
        live with its code and the markup it renders, which is what a plain HTML page writes for the same look. Open{" "}
        <em>Code</em> and <em>Markup</em> under the card above to see both. The tests run against the same examples, so
        what you read here is what is checked.
      </p>
      <pre tabindex="0">
        <code>{`import { Button } from "beautiful-ui-solid";

<Button variant="primary">Publish</Button>`}</code>
      </pre>

      <h2>Design tokens</h2>
      <p>
        A part never hardcodes a space, a corner, a shadow or a duration: it reads a token, and a missing value becomes a
        new token rather than a number in a stylesheet. Themes set the surface tokens, so a part looks right in glass
        and classic without knowing which it is in.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Family</th>
              <th>Tokens</th>
              <th>What for</th>
            </tr>
          </thead>
          <tbody>
            <For each={tokens}>
              {(row) => (
                <tr>
                  <td>{row.family}</td>
                  <td>
                    <code>{row.names}</code>
                  </td>
                  <td>{row.use}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h3>Depth and the glint</h3>
      <p>
        Everything that sits above the page takes one of four depths: a raised control, a pane, something floating, an
        overlay. In glass, <code>data-glint</code> adds the lit rim along a pane's top right edge.{" "}
        <a href="/shadows">Shadows</a> has the details.
      </p>
      <beautiful-elevations>
        <For each={levels}>
          {(row) => (
            <beautiful-elevation data-elevation={row.level} data-glint>
              <strong>{row.level}</strong>
              <small>{row.name}</small>
            </beautiful-elevation>
          )}
        </For>
      </beautiful-elevations>

      <h2>Made for the keyboard, and checked</h2>
      <ul>
        <li>
          The <a href="/focus-ring">focus ring</a> glides from one control to the next as Tab moves focus, quickly,
          so the eye can follow it. Under reduced motion it jumps instead. It shows for the keyboard only, and never has
          square corners.
        </li>
        <li>
          Each component's keys and roles come from its WAI-ARIA Authoring Practices pattern, and a Playwright test
          presses them on its docs examples before it ships.
        </li>
        <li>
          axe checks every example in each theme and mode. It can't judge text on glass, so a second test measures it
          from pixels: it hides the text, looks at what is behind it, and fails below 4.5:1 against the least
          contrasting pixel, on a plain and a bright backdrop, on a laptop and a phone, hovered too.
        </li>
        <li>
          Motion respects the person: under reduced motion a component drops its movement and keeps a fade.
        </li>
      </ul>

      <h2>The brand</h2>
      <p>
        Ink and white, and a lot of white space. Indigo and marigold are for highlights and for coloring pictures,
        never for buttons or links, which stay ink and the accent. A website's hero sits on an indigo and marigold stage
        so its glass has something to catch. The <a href="/websites">Websites</a> and{" "}
        <a href="/illustrations">Illustrations</a> guides show how.
      </p>
      <ul class="swatches">
        <For each={brand}>
          {(swatch) => (
            <li>
              <beautiful-swatch style={{ background: swatch.hex }} />
              <p>
                <strong>{swatch.name}</strong> <code>{swatch.hex}</code>
                <br />
                <small>{swatch.note}</small>
              </p>
            </li>
          )}
        </For>
      </ul>

      <h2>Safe by default</h2>
      <p>
        Components render text through Solid's JSX, which escapes it, so a name or a message from an app's data
        never becomes markup. They make no requests, set no cookies and store nothing; the one thing this site keeps is
        your theme and mode.
      </p>

      <h2>How a page gets here</h2>
      <p>
        Every component comes from a row of <code>docs/components.md</code>, and its page opens with its spec: what
        it does, its props, its keys and its states. The spec is approved on a preview of that page before the
        component is built, so each page here is both the plan and the proof.
      </p>

      <h2>Where to start</h2>
      <beautiful-home-starts>
        <For each={starts}>
          {(start) => (
            <Card>
              <hgroup>
                <h3>
                  <CardLink href={start.href}>{start.title}</CardLink>
                </h3>
              </hgroup>
              <p>{start.text}</p>
            </Card>
          )}
        </For>
      </beautiful-home-starts>
    </article>
  );
}
