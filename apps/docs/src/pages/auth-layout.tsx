import { Example, PropsTable } from "../spec.tsx";

export default function AuthLayoutPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Auth layout</h1>
      <p class="lede">
        The page for signing in, joining a team, or following a link that has expired: one card in the middle of the
        screen, with nothing else to look at.
      </p>
      <Example title="Auth layout" hero name="auth-layout/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It fills the screen and centers one card, the page's <code>&lt;main&gt;</code>. The card holds the logo, an{" "}
          <code>&lt;h1&gt;</code>, a line or two of text, and the actions. Small print, such as the Terms and the
          Privacy Policy, can go in a <code>footer</code> under the card.
        </li>
        <li>
          The card is the kit's surface, the one Dialog's panel is drawn in: raised and edged in classic, and in glass
          a frosted pane in a band of clear glass, catching the light from the upper right. It is 28rem (448px) wide.
        </li>
        <li>
          Glass needs something behind it to bend. In glass the page glows with soft color from its corners, pale
          enough for text to sit straight on it. Classic shows the plain canvas. <code>--auth-backdrop</code> sets
          what's behind the card, so an app can use its own color or a photo.
        </li>
        <li>
          Where the screen is narrower than the card and its margins, as on a phone, the card drops its frame and the
          content sits on the page, full width. A card on a phone would spend 60px of a 390px screen on its bezel and
          margins. Catalyst does the same.
        </li>
        <li>
          Inside the card, the parts stack 24px apart, and the line under the title sits 8px under it. Buttons and
          links styled as buttons fill the card's width, 12px apart, so a choice of sign-ins reads as a list. A form's
          own submit button fills it too.
        </li>
        <li>
          It is CSS on native elements, so a page rendered on the server works with no JS. A sign-in or error page
          served as plain HTML gets the layout by writing the same markup. The Solid component writes it for an
          app.
        </li>
        <li>
          It adds no behavior. The page's controls are Buttons, Links and Fields, each with its own keys. It doesn't
          move focus on load: a page whose first job is to type, such as a code, sets <code>autofocus</code> on that
          field.
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
                <code>AuthLayout</code>
              </td>
              <td>
                <code>&lt;beautiful-auth-layout&gt;</code>
              </td>
              <td>
                The whole screen, with <code>--auth-backdrop</code> behind the card. No semantic element fits the
                screen itself, so it is the kit's styling hook.
              </td>
            </tr>
            <tr>
              <td>
                <code>children</code>
              </td>
              <td>
                <code>&lt;main&gt;</code>
              </td>
              <td>
                The card, and the page's main landmark. A first <code>&lt;svg&gt;</code> or <code>&lt;img&gt;</code> is
                the logo, drawn 32px tall.
              </td>
            </tr>
            <tr>
              <td>
                <code>footer</code>
              </td>
              <td>
                <code>&lt;footer&gt;</code>
              </td>
              <td>Small print under the card, in muted 14px text, centered. Left out when the prop is.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: "children", type: "JSX.Element", description: "What the card holds: the logo, the title, the text and the actions." },
          {
            name: "footer",
            type: "JSX.Element",
            default: "none",
            description: "Small print under the card, such as links to the Terms and the Privacy Policy.",
          },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { AuthLayout, Button, Heading, Link, Text } from "beautiful-ui-solid";

<AuthLayout
  footer={<p>By signing in you agree to the <Link href="/terms" color="neutral">Terms</Link>.</p>}
>
  <Logo />
  <Heading>Sign in to Acme</Heading>
  <Text tone="muted">One account for every Acme app.</Text>
  <Button href="/start/google"><GoogleIcon /> Sign in with Google</Button>
</AuthLayout>`}</code>
      </pre>
      <p>
        Other attributes pass through to <code>&lt;beautiful-auth-layout&gt;</code>: <code>class</code>,{" "}
        <code>style</code>, <code>data-*</code>. Set <code>--auth-backdrop</code> in <code>style</code> for an
        app's own backdrop, and <code>--auth-width</code> for a wider card.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        There is no APG pattern for a page layout. It follows APG's guidance on landmarks: everything on the page sits
        in a landmark, and there is one <code>main</code>.
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
                Moves through the card's controls in order, then the footer's links. The layout itself is never
                focused.
              </td>
            </tr>
            <tr>
              <td>Landmarks</td>
              <td>
                The card is the <code>main</code> landmark, so a screen reader's landmark key lands on it. The{" "}
                <code>footer</code>, outside <code>main</code>, is the page's <code>contentinfo</code>. With nothing
                else on the page, there is no skip link to add.
              </td>
            </tr>
            <tr>
              <td>Headings</td>
              <td>
                The card's title is the page's one <code>&lt;h1&gt;</code>, and it says what the page is for: "Sign in
                to Acme". The document's <code>&lt;title&gt;</code> says the same.
              </td>
            </tr>
            <tr>
              <td>Logo</td>
              <td>
                An image named for the product, <code>aria-label="Acme"</code>, or <code>alt=""</code> when the
                title already names it.
              </td>
            </tr>
            <tr>
              <td>Zoom and text size</td>
              <td>
                The sizes are in rem. At 400% zoom the layout is narrower than the card, so the card drops its frame and
                the page scrolls down, never sideways.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <p>The layout has no interactive states of its own. What changes it:</p>
      <ul>
        <li>
          <strong>Width:</strong> a card from 30rem (480px) of room inside the page's margins, and no frame under it.
          It is measured on the layout, with a container query, so a layout inside a narrower frame does the same.
        </li>
        <li>
          <strong>Height:</strong> the card sits in the middle of the screen, and the footer at the bottom. A card
          taller than the screen starts at the top, and the page scrolls.
        </li>
        <li>
          <strong>Mode:</strong> the card and the backdrop take the mode's surface and colors. In dark glass the glow
          is deep blue, plum and violet, at about the canvas's lightness.
        </li>
        <li>
          <strong>Reduced transparency:</strong> glass falls back to classic's card and plain canvas, as Dialog does.
        </li>
        <li>
          <strong>An error</strong> belongs to the field or the action it is about: a Field's error under the code,
          for a wrong code. A page that can't go on, such as an expired link, is its own page in the layout, with a
          way forward.
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
                <code>--auth-backdrop</code>
              </td>
              <td>Behind the card. Classic: the canvas. Glass: three soft glows over the canvas. New.</td>
            </tr>
            <tr>
              <td>
                <code>--auth-width</code>
              </td>
              <td>The card's width, 28rem. Set on the layout, like Dialog's <code>--dialog-width</code>.</td>
            </tr>
            <tr>
              <td>
                <code>--shadow-card</code>
              </td>
              <td>The card's lift, shared with Card: a surface that sits on the page rather than over it.</td>
            </tr>
            <tr>
              <td>
                <code>--surface-*</code>
              </td>
              <td>The card's fill, edge, bezel, rim and blur: the same as Dialog's panel.</td>
            </tr>
            <tr>
              <td>
                <code>--space-8</code>, <code>--space-6</code>, <code>--space-2</code>
              </td>
              <td>The card's padding, the space between its parts, and under its title.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        Container queries and <code>dvh</code> are in every current browser. Glass needs{" "}
        <code>backdrop-filter</code>, and falls back to classic's card without it.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Auth layout, for one centered column that fills the screen, a frame that only shows on a wide
        screen, and a 24rem column of content inside it. The look is the kit's own: Dialog's surface, and a backdrop
        for glass.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with its code and the markup it renders. Each is a whole page, shown in a frame.
        Switch the theme and mode at the top, and narrow the window to see the phone layout.
      </p>
      <Example title="Sign in" name="auth-layout/sign-in" />
      <Example title="Join a team" name="auth-layout/invite" />
      <Example title="A code, with an error" name="auth-layout/code" />
      <Example title="An expired link" name="auth-layout/expired" />
      <Example title="An app's own backdrop" name="auth-layout/backdrop" />
    </article>
  );
}
