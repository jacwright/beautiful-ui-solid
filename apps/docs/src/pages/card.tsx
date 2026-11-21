import { Example, PropsTable } from "../spec.tsx";

export default function CardPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Card</h1>
      <p class="lede">A pane in the page that holds one thing: a site, a setting, a number.</p>
      <Example title="Card" hero name="card/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It is a <code>&lt;beautiful-card&gt;</code>, or a meaningful element with <code>data-card</code>, so the
          card keeps the meaning of what it holds: a{" "}
          <code>&lt;li&gt;</code> in a list of sites, a <code>&lt;section&gt;</code> of a settings page, a{" "}
          <code>&lt;form&gt;</code> that saves one setting, an <code>&lt;article&gt;</code> in a feed. The Solid
          component renders a <code>&lt;beautiful-card&gt;</code> unless <code>as</code> names a meaningful element.
        </li>
        <li>
          In <strong>glass</strong> it is one pane of frosted glass, a shade lighter than Popover's, that catches the
          light as a Button does: a glow from the upper right across the pane, and a glint on the rim at the top
          right. Its text holds 4.5:1 over whatever is behind it. In{" "}
          <strong>classic</strong> it is the raised panel: white on the canvas in light mode, a step lighter than the
          canvas in dark, with a hairline edge and a faint shadow. It sits in the page, so its shadow is closer than a
          popup's.
        </li>
        <li>
          Its parts are its children, all optional, with no wrapper components: an image first runs to the card's
          edges, under the rim; an <code>&lt;hgroup&gt;</code> holds the heading and a muted line under it; a{" "}
          <code>&lt;footer&gt;</code> holds the actions, pushed to the bottom so the footers in a row of cards line
          up. Everything else is the body, one block under another, 16px apart.
        </li>
        <li>
          Text inside is 14px, as in a dialog's body. A heading keeps its own size: an <code>h3</code> is 16px. Muted
          text takes the surface's stronger shade, as in Dialog.
        </li>
        <li>
          <strong>A linked card</strong> opens one thing, such as a site. Its heading holds a{" "}
          <code>CardLink</code>, and the link's hit area stretches over the whole card with a pseudo-element, so a
          click anywhere on the card follows it. A screen reader still reads only the heading as the link, "Spring
          launch, link", not the whole card. The card takes the link's focus ring and lights up under the pointer.
        </li>
        <li>
          A button or link inside a linked card stays its own: it sits above the stretched link, so Publish publishes
          and doesn't open the site. The card doesn't light up while the pointer is on it. Tab reaches the card's link first, then the controls inside, in reading order.
        </li>
        <li>
          The CSS styles every <code>&lt;beautiful-card&gt;</code> and <code>[data-card]</code>, so a static page gets the whole look, the linked card included,
          with no JS. Every rule is in <code>:where()</code>, so its specificity is 0.
        </li>
      </ul>
      <p>
        Not in it: a card that is one big <code>&lt;a&gt;</code> or <code>&lt;button&gt;</code>. A screen reader
        would read everything inside as the link's name, and a button inside it would be invalid. Not in it either:
        variants. Open Props UI has four (text, tonal, elevated, outlined). Here a card has one look per theme, and a
        flat one can come later, when a screen needs it.
      </p>

      <h2>Anatomy</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Part</th>
              <th>Renders</th>
              <th>Job</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>Card</code>
              </td>
              <td>
                <code>&lt;beautiful-card&gt;</code>, or the element <code>as</code> names with <code>data-card</code>
              </td>
              <td>The pane, its padding, and the space between its parts.</td>
            </tr>
            <tr>
              <td>media</td>
              <td>
                <code>&lt;img&gt;</code>, <code>&lt;picture&gt;</code> or <code>&lt;video&gt;</code>, first
              </td>
              <td>
                Runs to the top and side edges with the card's top corners. It needs no width or height: it fills the
                width at 16:9 and is cropped from the middle, so a row of cards lines up whatever the images' sizes.{" "}
                <code>--card-media-ratio</code> on the card or its list sets another ratio, and <code>auto</code> keeps
                each image's own height.
              </td>
            </tr>
            <tr>
              <td>header</td>
              <td>
                <code>&lt;hgroup&gt;</code>: a heading, then a <code>&lt;p&gt;</code>
              </td>
              <td>The title and a muted line under it, 4px apart.</td>
            </tr>
            <tr>
              <td>
                <code>CardLink</code>
              </td>
              <td>
                <code>&lt;a href data-card-link&gt;</code>, inside the heading
              </td>
              <td>Makes the whole card a link to one place. One per card.</td>
            </tr>
            <tr>
              <td>actions</td>
              <td>
                <code>&lt;footer&gt;</code>
              </td>
              <td>Buttons in a row that wraps, at the bottom of the card.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Card</h3>
      <PropsTable
        rows={[
          {
            name: "as",
            type: '"article" | "section" | "li" | "form"',
            default: "beautiful-card",
            description: (
              <>
                The element. <code>li</code> in a list of cards, <code>section</code> or <code>form</code> on a
                settings page, with <code>aria-labelledby</code> naming its heading.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The card's parts." },
        ]}
      />
      <h3>CardLink</h3>
      <PropsTable
        rows={[
          { name: "href", type: "string", description: "Where the card goes." },
          { name: "children", type: "JSX.Element", description: "The link's words: the card's title." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Button, Card, CardLink, Heading, Text } from "beautiful-ui-solid";

<Card as="li">
  <img src={site.thumbnail} alt="" />
  <hgroup>
    <Heading level={3}>
      <CardLink href={\`/sites/\${site.id}\`}>{site.name}</CardLink>
    </Heading>
    <Text>{site.domain}</Text>
  </hgroup>
  <Text>Published 2 hours ago.</Text>
  <footer>
    <Button variant="primary">Publish</Button>
  </footer>
</Card>`}</code>
      </pre>
      <p>
        Other attributes pass through to the element: <code>id</code>, <code>class</code>, <code>aria-*</code>, and a
        form's <code>onSubmit</code>. <code>--card-padding</code> sets a card's padding, 20px by default.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        There is no APG pattern for a card. It is a container: the elements inside it, and the one it is, do the
        work.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Key or event</th>
              <th>Behavior</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <kbd>Tab</kbd>
              </td>
              <td>
                Passes over a plain card to the controls inside it. On a linked card it stops at the link first, and
                the ring goes around the whole card. Then the controls inside, in order.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd>
              </td>
              <td>On a linked card's link, follows it, as any link does.</td>
            </tr>
            <tr>
              <td>Click or tap</td>
              <td>
                Anywhere on a linked card follows its link, except on a control inside it, which does its own thing.
                A middle click or a modifier opens it in a new tab, as with any link, because it is one.
              </td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Read the card as what it is: a list item ("Sites, list, 3 items"), a region or a form named by its
                heading, or nothing at all for a <code>&lt;beautiful-card&gt;</code>. A linked card's link is named by the
                heading alone, and its heading is in the page's outline, so <kbd>H</kbd> jumps from card to card.
              </td>
            </tr>
            <tr>
              <td>Zoom and text size</td>
              <td>
                Sizes are in rem. A card grows with its text, and a long word or URL breaks rather than widening it.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Rest:</strong> the pane, its edge and its shadow.
        </li>
        <li>
          <strong>Hover</strong>, on a linked card, where the pointer can hover: the edge darkens, the shadow grows,
          and the title's underline shows. Nothing moves. A tap doesn't leave it lit.
        </li>
        <li>
          <strong>Focus</strong>, on a linked card's link: the 2px accent ring around the whole card, 2px out. The
          moving focus ring glides to the card's corners, as to any control's.
        </li>
        <li>
          <strong>Mode:</strong> light and dark in each theme. Classic's dark card is a step lighter than the canvas,
          so it shows without a shadow.
        </li>
        <li>
          <strong>Reduced transparency</strong>, or no <code>backdrop-filter</code>: glass falls back to classic's
          card.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Classic</th>
              <th>Glass</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--card-fill</code>, <code>--card-backdrop</code>
              </td>
              <td>the raised color, no filter</td>
              <td>78% white, or a smoky gray at 70% in dark, with Popover's 16px blur. New.</td>
            </tr>
            <tr>
              <td>
                <code>--card-edge</code>, <code>--card-edge-hover</code>
              </td>
              <td>the border color, darker under the pointer</td>
              <td>the surface's edge, brighter under the pointer. New.</td>
            </tr>
            <tr>
              <td>
                <code>--shadow-card</code>, <code>--shadow-card-hover</code>
              </td>
              <td>a 2px shade, and a soft 12px one under the pointer</td>
              <td>depth 2, and depth 3 under the pointer, in both themes (<a href="/shadows">Shadows</a>)</td>
            </tr>
            <tr>
              <td>
                <code>--card-sheen</code>, <code>--card-rim</code>, <code>--card-hotspot</code>
              </td>
              <td>none</td>
              <td>a Button's light: its sheen, rim and top-right glint. New.</td>
            </tr>
            <tr>
              <td>
                <code>--radius-lg</code>, <code>--space-5</code>, <code>--space-4</code>
              </td>
              <td colspan="2">12px corners, 20px padding, 16px between parts</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        The linked card's hover and focus ring use <code>:has()</code>, in every current browser. Without it, the link
        still covers the card and shows its own ring.
      </p>

      <h2>References</h2>
      <p>
        Open Props UI's Card for the parts: a header in an <code>&lt;hgroup&gt;</code>, the body, and a row of
        actions, in a flex column. Its four variants are left out (above). The stretched link is Heydon Pickering's
        card pattern from Inclusive Components: the heading is the link, and the card is its hit area.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="A card" name="card/domain" />
      <Example title="Linked cards, on glass" name="card/sites" />
      <Example title="Stats" name="card/stats" />
      <Example title="A settings form" name="card/settings" />

    </article>
  );
}
