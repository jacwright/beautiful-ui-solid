import blogPost from "../../examples/websites/blog-post.html?raw";
import closing from "../../examples/websites/closing.html?raw";
import features from "../../examples/websites/features.html?raw";
import landingTop from "../../examples/websites/landing-top.html?raw";
import { Example } from "../spec.tsx";

export default function WebsitesPage() {
  return (
    <article>
      <p class="eyebrow">Guide</p>
      <h1>Websites</h1>
      <p class="lede">
        How a website built with the kit is put together: a product's marketing pages, its blog, and any page that isn't an
        app. It is the kit with more room to breathe.
      </p>

      <h2>What it covers</h2>
      <ul>
        <li>
          A product's marketing site: landing pages, segment hubs and their articles, comparison
          pages, recipes, and the blog. Apps are built from the components, and this guide adds nothing to them.
        </li>
        <li>
          It uses the kit as it is: its tokens, Heading, Text, Link and Button, and their styled native markup, which
          needs no JS. What a website needs beyond them is a few layout hooks in <code>beautiful-ui-solid/web.css</code>{" "}
          and the tokens under <a href="#tokens">Tokens</a>.
        </li>
        <li>
          Pictures are ink-and-watercolor illustrations, made the way the{" "}
          <a href="/illustrations">Illustrations</a> guide says.
        </li>
        <li>
          The words follow the product's own brand and voice. This guide is only how they
          look.
        </li>
      </ul>

      <h2>Principles</h2>
      <ul>
        <li>
          <strong>Calm, and plain to read.</strong> One idea to a section, short lines, and a lot of white space: the
          space around things is most of the design. A page reads top to bottom without hunting.
        </li>
        <li>
          <strong>Ink and white.</strong> Near-black on white, like the logo, and the reverse in dark mode. The page's
          own color is only a pair of highlights, <strong>indigo</strong> and <strong>marigold</strong>, and the
          same two color the illustrations. Neither is ever a button or a link: those stay ink and the kit's cobalt.
        </li>
        <li>
          <strong>The kit's own pieces.</strong> A button on a landing page is the app's Button, and a headline is
          Heading at <code>display</code>. A site never restyles a component to make it look more "marketing".
        </li>
        <li>
          <strong>Light and dark.</strong> A site follows the reader's system setting, which the kit's tokens do on
          their own when the root has no <code>data-mode</code>. Every page is checked in both.
        </li>
        <li>
          <strong>Fast.</strong> No webfont, no script a page doesn't need, and images sized for their place.
        </li>
      </ul>

      <h2 id="tokens">Tokens</h2>
      <p>
        These joined <code>tokens.css</code> for websites. Everything else on a site is a token the kit already has.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>For</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--width-prose</code>
              </td>
              <td>40rem</td>
              <td>A blog post's text, and a hero's line under its headline: about 70 characters of 18px text.</td>
            </tr>
            <tr>
              <td>
                <code>--width-wide</code>
              </td>
              <td>56rem</td>
              <td>A post's top illustration, a wide table, a comparison.</td>
            </tr>
            <tr>
              <td>
                <code>--width-page</code>
              </td>
              <td>72rem</td>
              <td>A marketing page's sections: a hero, a grid of features, the header and the footer.</td>
            </tr>
            <tr>
              <td>
                <code>--space-gutter</code>
              </td>
              <td>16px to 32px</td>
              <td>The space at the sides of every section. It grows with the screen.</td>
            </tr>
            <tr>
              <td>
                <code>--space-section</code>
              </td>
              <td>64px to 128px</td>
              <td>The space above and below each section. It grows with the screen, and a site is mostly this.</td>
            </tr>
            <tr>
              <td>
                <code>--space-12</code>, <code>-16</code>, <code>-24</code>, <code>-32</code>
              </td>
              <td>48px, 64px, 96px, 128px</td>
              <td>The larger steps the two above are built from, and the space before a post's headings.</td>
            </tr>
            <tr>
              <td>
                <code>--color-page</code>
              </td>
              <td>white · #111113</td>
              <td>A section's ground: white, and the dark canvas in dark mode.</td>
            </tr>
            <tr>
              <td>
                <code>--color-band</code>
              </td>
              <td>#f6f6f7 · #1c1c1f</td>
              <td>A band: the soft gray that sets one section apart.</td>
            </tr>
            <tr>
              <td>
                <code>--color-indigo</code>
              </td>
              <td>#4b439c · #b6b8ef</td>
              <td>Highlights: an eyebrow, a quote's rule. A deep indigo on white and a pale one on dark.</td>
            </tr>
            <tr>
              <td>
                <code>--stage-indigo</code>, <code>--stage-marigold</code>
              </td>
              <td>indigo at 22% · 34%, marigold at 40% · 26%</td>
              <td>The two washes of a stage, which glass catches. Quieter in light mode, deeper in dark.</td>
            </tr>
            <tr>
              <td>
                <code>--color-marigold</code>, <code>--color-on-marigold</code>
              </td>
              <td>#f2b33d, #18181b</td>
              <td>The highlighter: a <code>&lt;mark&gt;</code> over the words that matter. The same in both modes.</td>
            </tr>
            <tr>
              <td>
                <code>--color-paper</code>
              </td>
              <td>#fcf5ec</td>
              <td>The warm paper every illustration is painted on, in both modes.</td>
            </tr>
            <tr>
              <td>
                <code>--illustration-spot</code>
              </td>
              <td>6rem</td>
              <td>A spot illustration's width, beside a feature's words.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Type</h2>
      <p>
        The kit's system sans, in its sizes. A website uses the larger end of them, and no new ones. The logo is
        the only place Source Serif 4 and Montserrat appear, and it is drawn as outlines, so a page loads no
        font.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Text</th>
              <th>Markup</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A landing page's headline</td>
              <td>
                <code>&lt;h1 data-size="display"&gt;</code>
              </td>
              <td>36px to 48px, weight 700</td>
            </tr>
            <tr>
              <td>A section's title, a closing call to action</td>
              <td>
                <code>&lt;h2 data-size="xl"&gt;</code>
              </td>
              <td>30px</td>
            </tr>
            <tr>
              <td>A blog post's title</td>
              <td>
                <code>&lt;h1 data-size="xl"&gt;</code>
              </td>
              <td>30px. A post is read, not sold, so it doesn't shout.</td>
            </tr>
            <tr>
              <td>A post's sections</td>
              <td>
                <code>&lt;h2&gt;</code> and <code>&lt;h3&gt;</code> in <code>&lt;beautiful-prose&gt;</code>
              </td>
              <td>24px and 20px, a step above the text</td>
            </tr>
            <tr>
              <td>The line under a headline</td>
              <td>
                <code>&lt;p data-size="lg" data-tone="muted"&gt;</code>
              </td>
              <td>18px</td>
            </tr>
            <tr>
              <td>A post's text</td>
              <td>
                <code>&lt;p&gt;</code> in <code>&lt;beautiful-prose&gt;</code>
              </td>
              <td>18px on 28px lines</td>
            </tr>
            <tr>
              <td>A feature's words, on a landing page</td>
              <td>
                <code>&lt;p data-tone="muted"&gt;</code>
              </td>
              <td>16px</td>
            </tr>
            <tr>
              <td>An eyebrow</td>
              <td>
                <code>&lt;p data-eyebrow&gt;</code>
              </td>
              <td>14px, weight 600, indigo</td>
            </tr>
            <tr>
              <td>A date, a caption, the footer</td>
              <td>
                <code>&lt;p data-size="sm" data-tone="muted"&gt;</code>
              </td>
              <td>14px</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        Headings are in sentence case. An eyebrow is too: it is a quiet label, not a shout in capitals.
      </p>

      <h2>Color and surfaces</h2>
      <ul>
        <li>
          The page is white, and the dark page is the dark canvas. A section that needs setting apart is a band on a
          soft gray, and bands alternate with plain sections rather than stacking.
        </li>
        <li>
          <strong>Indigo and marigold are highlights.</strong> Indigo is a small label over a headline (an eyebrow) and
          the rule beside a pull quote. Marigold is a highlighter stroke, a <code>&lt;mark&gt;</code>, over the one
          phrase in a headline or a paragraph that matters most. Use each a few times to a page. A page of marked
          words has none that stand out.
        </li>
        <li>
          One primary Button in view, in its default neutral color: the main action, in ink. The others are the
          secondary or tertiary Button. A link in text is the kit's Link, in cobalt. A site's own navigation is the
          tertiary Button, and the footer's links are the neutral Link.
        </li>
        <li>
          <strong>Glass, on a stage.</strong> A site wears the kit's glass, with <code>data-theme="glass"</code> on its root (the kit's default is modern, for apps): Card, Button,
          Popover, Dialog and the rest, as they are. Glass shows what is behind it, and on plain white that is
          nothing, so it looks like classic. So the hero, and at most one section after it, sits on a{" "}
          <strong>stage</strong>: soft washes of indigo and marigold bleeding in from the corners, like the
          watercolors. A card or a button there catches the color. Every other section stays white, and so does the
          type: on a stage the page's own text is ink on a pale wash, and the glass panes hold their own.
        </li>
        <li>
          Where the stage ends the page is white again, with no gradient, glow or colored panel anywhere else. A
          reader who asks for reduced transparency gets classic's solid cards, and the page reads the same.
        </li>
        <li>
          The logo is the product's large horizontal lockup, in ink and its gray: the full-color
          version on white, the reversed one on dark. It stays ink
          and gray: indigo and marigold never color it. A page that follows the mode draws it in{" "}
          <code>currentColor</code>, as the examples
          here do: an <code>&lt;svg&gt;</code> that <code>&lt;use&gt;</code>s the lockup, with the product name at
          72% of the text color. The file has to ship with the site, such as in its <code>public/brand/</code>, since the
          <code>&lt;use&gt;</code> fetches it by path. It stays at 160px wide or more, and below that the small files take over.
        </li>
      </ul>

      <h2>Pictures</h2>
      <ul>
        <li>
          Illustrations, in the one house style. A post has one at the top, and one more where a reader would
          otherwise have to picture an idea themselves. A landing page uses them sparingly: one in the hero at most,
          and small spot illustrations beside features only when each says something the words don't.
        </li>
        <li>
          An illustration sits on its warm paper in both modes, with rounded corners and no other frame. On a
          white page it is a soft card with plenty of white around it, and on a dark page it is a lit one. Dimming or
          inverting it would muddy the watercolor.
        </li>
        <li>
          Screenshots of a product are real, current, and shown at their own size or smaller, with rounded corners
          and the kit's border. No device mockups.
        </li>
        <li>No stock photos, no icons standing in for ideas, and no AI images in another style.</li>
      </ul>

      <h2>Layout</h2>
      <p>
        A page is a column of sections. Each section spans the screen, keeps the gutter at its sides, and holds its
        blocks at the page's width, or narrower when a block asks. The hooks are data attributes on native elements,
        as in the rest of the kit, and every rule has specificity 0, so a site's own rule wins.
      </p>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Hook</th>
              <th>On</th>
              <th>Does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>data-section</code>
              </td>
              <td>
                <code>&lt;section&gt;</code>, <code>&lt;article&gt;</code>
              </td>
              <td>
                White, with the gutter at the sides, <code>--space-section</code> above and below, and its blocks
                one under another at the page's width. <code>"band"</code> sets it on the soft gray. A{" "}
                <code>data-stage</code> on it adds the indigo and marigold washes for glass to catch. <code>"bar"</code> is a
                site's header or footer, with less space above and below.
              </td>
            </tr>
            <tr>
              <td>
                <code>data-width</code>
              </td>
              <td>any block</td>
              <td>
                <code>prose</code>, <code>wide</code> or <code>page</code>: caps the block at that width and centers
                it.
              </td>
            </tr>
            <tr>
              <td>
                <code>data-eyebrow</code>
              </td>
              <td>
                <code>&lt;p&gt;</code>
              </td>
              <td>A small label over a headline, in indigo, 14px and semibold. Sentence case.</td>
            </tr>
            <tr>
              <td>
                <code>&lt;beautiful-hero&gt;</code>
              </td>
              <td>a block</td>
              <td>
                A headline, the line under it, and a row of actions a little further down.{" "}
                <code>data-align="center"</code> centers them, for a closing call to action.
              </td>
            </tr>
            <tr>
              <td>
                <code>&lt;beautiful-row&gt;</code>
              </td>
              <td>
                a block, or <code>data-row</code> on a <code>&lt;nav&gt;</code> or a list
              </td>
              <td>
                Side by side, and wrapping on a phone. <code>data-align="between"</code> pushes the first and last
                apart, as in a header.
              </td>
            </tr>
            <tr>
              <td>
                <code>&lt;beautiful-grid&gt;</code>
              </td>
              <td>a block</td>
              <td>
                As many columns as fit at 16rem each: three on a laptop, one on a phone. Its items are{" "}
                <code>&lt;article data-card&gt;</code>, the kit's Card.
              </td>
            </tr>
            <tr>
              <td>
                <code>&lt;beautiful-prose&gt;</code>
              </td>
              <td>a post's body</td>
              <td>
                18px text, and the space between paragraphs, headings, lists, quotes, code and figures. A heading
                takes more space above it than under it, so it reads with what it heads.
              </td>
            </tr>
            <tr>
              <td>
                <code>data-illustration</code>
              </td>
              <td>
                <code>&lt;figure&gt;</code>
              </td>
              <td>
                The image on its paper with rounded corners, and its caption under it. <code>"spot"</code> draws it
                at <code>--illustration-spot</code>.
              </td>
            </tr>
            <tr>
              <td>
                <code>data-logo</code>
              </td>
              <td>
                <code>&lt;svg&gt;</code>
              </td>
              <td>The logo's height in a header: 32px.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>A landing page</h2>
      <p>
        The header, the hero, the sections, a closing call to action, and the footer. The hero says who it's for,
        what they get, and the one thing to do. Each section after it answers one question a reader would ask
        next.
      </p>
      <Example title="Header and hero, on a stage" html={landingTop} />
      <Example title="Features on glass cards" html={features} />
      <Example title="Closing call to action on a band, and the footer" html={closing} />

      <h2>A blog post</h2>
      <p>
        The title, the line under it, the date and reading time, the top illustration at the wide width, then the
        text at the prose width. An illustration inside the text stays at the prose width and has a caption that
        says its point in words, as on the <a href="/illustrations">Illustrations</a> page.
      </p>
      <Example title="A post" html={blogPost} />
    </article>
  );
}
