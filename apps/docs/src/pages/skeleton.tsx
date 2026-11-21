import { Example, PropsTable } from "../spec.tsx";

export default function SkeletonPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Skeleton</h1>
      <p class="lede">
        A placeholder in the shape of what is loading, so a page keeps its layout and shows where things will land.
      </p>
      <Example title="Skeleton" hero name="skeleton/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          A skeleton stands in for content that hasn't arrived: a line of text, a number, a chart, a picture. When the
          content comes, it takes the skeleton's place, and nothing around it moves.
        </li>
        <li>
          It comes in three shapes. <strong>Text</strong>, the default, is one or more lines, each as tall as a line
          of the text around it. Put it where the text will go, inside the same <code>&lt;p&gt;</code> or heading,
          and the text takes exactly the room it held. With several lines, the last is shorter, as the end of a
          paragraph is. <strong>Rect</strong> is a block for a chart, an image or a map. <strong>Circle</strong> is
          for an avatar.
        </li>
        <li>
          Keep what you already know. A card's title, a table's headers and a page's heading stay real while their
          data loads. Only the data is a skeleton.
        </li>
        <li>
          A band of light sweeps across each shape every two seconds, to say "still working". Every skeleton on the
          screen sweeps in step, so a dashboard of them reads as one light passing, not a scatter of flickers.
        </li>
        <li>
          A skeleton waits 300ms before it fades in. Most loads finish sooner, and a placeholder that flashes for a
          moment is more distracting than a short blank. Its room is held from the start, so nothing moves either
          way.
        </li>
        <li>
          Under reduced motion the band stays still, and the shape fades gently in and out instead, so it still reads
          as loading.
        </li>
        <li>
          The fill is a faint tint of the text color, so it works on the canvas, on a card, in a dialog, and in light
          and dark. Glass's light is a brighter glint, slanted toward the light in the upper right, like a reflection
          crossing a pane. Classic's is a soft upright band.
        </li>
        <li>
          The shapes are hidden from screen readers: they say nothing true. The region they fill is marked busy, and
          holds a short "Loading …" that a screen reader reads in their place. <code>SkeletonGroup</code> is that
          region.
        </li>
        <li>
          The CSS styles <code>&lt;beautiful-skeleton&gt;</code>, so a static page gets the look with no JS. The Solid
          component adds the in-step sweep.
        </li>
      </ul>

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
                <code>Skeleton</code>
              </td>
              <td>
                <code>&lt;beautiful-skeleton aria-hidden="true"&gt;</code>
              </td>
              <td>
                One shape. No element fits a placeholder, so it is a styling hook. Its lines are drawn by a CSS mask
                and its light by a pseudo-element, so a paragraph of any length is one element.
              </td>
            </tr>
            <tr>
              <td>
                <code>SkeletonGroup</code>
              </td>
              <td>
                <code>&lt;beautiful-skeleton-group aria-busy="true"&gt;</code>
              </td>
              <td>
                The region that is loading. It holds the shapes and, first, a{" "}
                <code>&lt;beautiful-visually-hidden&gt;</code> with its label, for screen readers only. When the
                content arrives, it replaces the group, and the busy state goes with it.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <h3>Skeleton</h3>
      <PropsTable
        rows={[
          {
            name: "shape",
            type: '"text" | "rect" | "circle"',
            default: '"text"',
            description: (
              <>
                text is lines of the surrounding text's height. rect is a block, 16:9 unless it has a height, with
                medium corners. circle is 40px across unless it has a width. <code>data-shape</code> carries it, and
                is left out for text.
              </>
            ),
          },
          {
            name: "lines",
            type: "number",
            default: "1",
            description: "For text: how many lines. The last of several is 60% wide.",
          },
          {
            name: "width",
            type: "string",
            default: '"100%"',
            description: (
              <>
                Any CSS length. In <code>ch</code> it matches a number's digits: <code>"5ch"</code> for 12,480. For a
                circle, its size.
              </>
            ),
          },
          {
            name: "height",
            type: "string",
            default: "the shape's",
            description: "For rect: any CSS length, in place of 16:9.",
          },
        ]}
      />
      <h3>SkeletonGroup</h3>
      <PropsTable
        rows={[
          {
            name: "label",
            type: "string",
            default: '"Loading"',
            description: (
              <>
                What a screen reader reads in place of the shapes. Name what is loading: "Loading visitors", not just
                "Loading", so a page of several makes sense.
              </>
            ),
          },
          { name: "children", type: "JSX.Element", description: "The skeletons, laid out as the content will be." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Skeleton, SkeletonGroup } from "beautiful-ui-solid";

<Loading
  fallback={
    <SkeletonGroup label="Loading visitors">
      <p class="stat"><Skeleton width="5ch" /></p>
      <Skeleton shape="rect" height="12rem" />
    </SkeletonGroup>
  }
>
  <Visitors />
</Loading>`}</code>
      </pre>
      <p>
        Solid 2's <code>&lt;Loading&gt;</code> shows its fallback while what's inside it waits for data, so a
        SkeletonGroup is usually that fallback. Other attributes pass through to the element: <code>id</code>,{" "}
        <code>class</code>. Use <code>width</code> and <code>height</code> for size, not <code>style</code>.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        There is no APG pattern for a placeholder. It follows ARIA's <code>aria-busy</code>, and the advice to hide
        what carries no meaning.
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
              <td>Passes over a skeleton: it is never focused. Real controls around it, such as a card's link, are.</td>
            </tr>
            <tr>
              <td>Screen readers</td>
              <td>
                Skip every shape. Read the group's label where the content will be: "Visitors, heading level 3.
                Loading visitors." The group is <code>aria-busy</code>, which tells a screen reader the region is
                changing and not to read it piece by piece.
              </td>
            </tr>
            <tr>
              <td>When content arrives</td>
              <td>
                The group is replaced, and a screen reader reads the content where it reaches it. Nothing is announced
                on its own: a dashboard of twelve cards would announce twelve times. A page that needs to say "loaded"
                says it once, with a status message or a Toast.
              </td>
            </tr>
            <tr>
              <td>High contrast</td>
              <td>
                In Windows' forced colors, the shapes are drawn in the system's gray text color, with no light, so they
                still show.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <ul>
        <li>
          <strong>Waiting:</strong> for its first 300ms, a skeleton holds its room and draws nothing.
        </li>
        <li>
          <strong>Loading:</strong> it fades in over 320ms, then the light sweeps across it every two seconds: about
          1.4 seconds crossing, then a pause.
        </li>
        <li>
          <strong>Reduced motion:</strong> no sweep. The shape fades to 55% and back every two seconds.
        </li>
        <li>
          <strong>Mode:</strong> the tint is 8% of the text color: a light gray on the light canvas, a dark gray on the
          dark one. The light is white, stronger in light mode.
        </li>
        <li>
          <strong>Theme:</strong> classic's light is a soft upright band. Glass's is brighter and slanted. Reduced
          transparency gives glass classic's light.
        </li>
        <li>
          <strong>Right to left:</strong> the light sweeps from right to left.
        </li>
      </ul>

      <h2>Look tokens</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--skeleton-fill</code>
              </td>
              <td>8% of the text color. New.</td>
            </tr>
            <tr>
              <td>
                <code>--skeleton-shine</code>, <code>--skeleton-shine-angle</code>
              </td>
              <td>The light and its slant: classic 60% white (6% in dark) upright, glass 85% (12% in dark) at 115°. New.</td>
            </tr>
            <tr>
              <td>
                <code>--skeleton-delay</code>, <code>--motion-shimmer</code>
              </td>
              <td>300ms before it shows, and 2s for each sweep. New.</td>
            </tr>
            <tr>
              <td>
                <code>--skeleton-circle</code>, <code>--skeleton-last-line</code>
              </td>
              <td>2.5rem across, and 60% for the last line of several. New.</td>
            </tr>
            <tr>
              <td>
                <code>--radius-md</code>, <code>--motion-enter</code>
              </td>
              <td>A rect's corners, and the fade in.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        The lines use the <code>lh</code> unit and <code>mask-composite</code>, and the sweep reverses with{" "}
        <code>:dir(rtl)</code>: all in every current browser. Lining the sweeps up uses{" "}
        <code>Element.getAnimations()</code>, which every current browser has too.
      </p>

      <h2>References</h2>
      <p>
        None: Skeleton is one of our own. The rules it follows are ARIA's <code>aria-busy</code>, and the common
        advice on loading states: hold the layout, keep the known parts real, and don't flash a placeholder for a
        fast load.
      </p>

      <h2>Other examples</h2>
      <p>Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right.</p>
      <Example title="Stat cards" name="skeleton/stats" />
      <Example title="Loading, then loaded" name="skeleton/reload" />
      <Example title="Paragraph" name="skeleton/paragraph" />
      <Example title="Chart" name="skeleton/chart" />
      <Example title="People" name="skeleton/list" />
      <Example title="In a dialog" name="skeleton/dialog" />
    </article>
  );
}
