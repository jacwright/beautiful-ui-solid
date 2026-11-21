import { Example, PropsTable } from "../spec.tsx";

export default function AvatarPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Avatar</h1>
      <p class="lede">A person, a team or a site at a glance: their photo, or their initials when there isn't one.</p>
      <Example title="Avatar" hero name="avatar/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It shows a photo when it has one, and the initials of the name when it doesn't. The initials sit under the
          photo, so they show while it loads. If it never loads, the Solid component drops the photo and the initials
          stay: an expired link or a blocked image never leaves an empty circle or the browser's broken-image icon.
        </li>
        <li>
          The initials come from the name: the first letter of the first word and of the last, so "Lucía Reyes" is LR
          and "Northwind" is N. Words that don't start with a letter or a digit, and email addresses, don't count. <code>initials</code> sets them by hand.
        </li>
        <li>
          Each name gets one of eight soft tints, picked from the name itself, so the same person has the same color
          on every page and in every app, and people in a list are easy to tell apart. <code>color</code> sets one
          by hand; <code>neutral</code> is gray, for a guest or a count like "+3". Each tint keeps its initials at
          4.5:1 or more in both modes.
        </li>
        <li>
          Five sizes, from 20px for a menu item or a line of text to 64px for a profile. The initials scale with it.{" "}
          <code>--avatar-size</code> sets any other size.
        </li>
        <li>
          A circle is a person. <code>square</code> gives rounded corners, for a team, a site or a company, as
          Catalyst does.
        </li>
        <li>
          A hairline edge at 10% of the text color sits over the photo, so a white photo doesn't melt into a white
          page. On glass the edge catches the light from the upper right, as a Button's does.
        </li>
        <li>
          Avatars in a group overlap by a quarter, with a clear gap cut around each one. They share one size, set on the
          group. The gap is cut out, not
          painted, so the page or the glass shows through it on any background.
        </li>
        <li>
          A button that holds only an avatar and names itself with <code>aria-label</code>, such as the account
          menu's, takes the avatar's shape: its focus ring
          circles the avatar, it dims a little under the pointer, and on a phone it reaches out to a 44px target
          however small the avatar is.
        </li>
        <li>The styled markup works with no JS, for a static page.</li>
      </ul>
      <p>
        Not part of Avatar: a presence dot or a count badge (Badge, later), and uploading a new photo (that's a form
        with a file Input).
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
              <td><code>Avatar</code></td>
              <td>
                <code>&lt;beautiful-avatar role="img"&gt;</code>
              </td>
              <td>
                The circle or square, its tint, and its name for screen readers (<code>aria-label</code>).{" "}
                <code>data-initials</code>, <code>data-size</code>, <code>data-color</code> and{" "}
                <code>data-square</code> carry the props. It has no children but the photo.
              </td>
            </tr>
            <tr>
              <td>Photo</td>
              <td>
                <code>&lt;img alt=""&gt;</code>
              </td>
              <td>
                Only with <code>src</code>. Laid over the initials and cropped to fill. Its alt is empty: the avatar's
                label names it once.
              </td>
            </tr>
            <tr>
              <td>Edge</td>
              <td>
                <code>::after</code>
              </td>
              <td>The hairline over the photo, and glass's light on it.</td>
            </tr>
            <tr>
              <td>Initials</td>
              <td>
                <code>::before</code>
              </td>
              <td>
                The letters, drawn from <code>data-initials</code>. No text node, so they are never read twice,
                copied with the text around them, or translated. With no letters, such as for an email address, an
                outline of a person.
              </td>
            </tr>
            <tr>
              <td>
                <code>AvatarGroup</code>
              </td>
              <td>
                <code>&lt;beautiful-avatar-group role="group"&gt;</code>
              </td>
              <td>
                Overlaps the avatars in it and cuts the gap around each. <code>label</code> names the group, such as
                "Editing now".
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        One element for initials, two with a photo. The wrapper earns its place: an <code>&lt;img&gt;</code> can't
        draw the initials, the edge, or a fallback, since it has no pseudo-elements.
      </p>

      <h2>Props</h2>
      <h3>Avatar</h3>
      <PropsTable
        rows={[
          {
            name: "name",
            type: "string",
            description: "Whose avatar: a person's, a team's or a site's name. It gives the label, the initials and the tint.",
          },
          {
            name: "src",
            type: "string",
            default: "none",
            description: "The photo or logo. Without one, or until it loads, the initials show.",
          },
          {
            name: "initials",
            type: "string",
            default: "from name",
            description: 'One or two letters to show in place of the ones from the name, or a count such as "+3".',
          },
          {
            name: "size",
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            default: '"md"',
            description: "20, 24, 32, 40 or 64px. Inside an AvatarGroup it takes the group's size.",
          },
          {
            name: "color",
            type: '"blue" | "indigo" | "violet" | "pink" | "orange" | "amber" | "emerald" | "teal" | "neutral"',
            default: "from name",
            description: "The tint behind the initials. Left out, the name picks one, the same way every time.",
          },
          {
            name: "square",
            type: "boolean",
            default: "false",
            description: "Rounded corners, for a team, a site or a company. A circle is a person.",
          },
          {
            name: "decorative",
            type: "boolean",
            default: "false",
            description: (
              <>
                Hides it from screen readers, for an avatar beside its name, so the name isn't read twice. It drops
                the role and label and sets <code>aria-hidden</code>.
              </>
            ),
          },
        ]}
      />
      <h3>AvatarGroup</h3>
      <PropsTable
        rows={[
          { name: "label", type: "string", default: "none", description: 'What the group is, such as "Editing now".' },
          {
            name: "size",
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            default: '"md"',
            description: "The size of every avatar in it.",
          },
          { name: "children", type: "JSX.Element", description: "The avatars." },
        ]}
      />
      <pre tabindex="0">
        <code>{`import { Avatar, AvatarGroup, Button } from "beautiful-ui-solid";

<Avatar name="Maya Chen" src={user.photoUrl} />
<Avatar name="Northwind Studio" square size="lg" />

<AvatarGroup label="Editing now">
  <For each={editors.slice(0, 4)}>{(person) => <Avatar name={person.name} src={person.photo} />}</For>
  <Show when={editors.length > 4}>
    <Avatar name={\`\${editors.length - 4} more people\`} initials={\`+\${editors.length - 4}\`} color="neutral" />
  </Show>
</AvatarGroup>

<Button variant="tertiary" aria-label="Your account">
  <Avatar name={user.name} src={user.photoUrl} decorative />
</Button>`}</code>
      </pre>
      <p>
        Other attributes pass through to <code>&lt;beautiful-avatar&gt;</code>: <code>id</code>, <code>class</code>,{" "}
        <code>style</code>, <code>title</code> and event handlers. <code>loading</code>, <code>referrerpolicy</code> and{" "}
        <code>crossorigin</code> go to the <code>&lt;img&gt;</code>. The kit also exports <code>initialsOf(name)</code>{" "}
        and <code>colorOf(name)</code>, so a server that writes the static markup picks the same letters and tint.
      </p>

      <h2>Keyboard and screen readers</h2>
      <p>
        There is no APG pattern for an avatar: it is an image. It takes no focus and has no keys of its own. A
        clickable avatar is a Button or a link holding one, with that control's keys.
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
              <td>Screen readers</td>
              <td>
                Read the name and "image", once: "Maya Chen, image". The initials are drawn by CSS and the photo's
                alt is empty, so "M C" is never read.
              </td>
            </tr>
            <tr>
              <td>Beside its name</td>
              <td>
                With <code>decorative</code>, it is hidden, and the name in the text is read on its own.
              </td>
            </tr>
            <tr>
              <td>In a group</td>
              <td>
                The group is read with its label, then each name: "Editing now, group. Maya Chen, image. Sam Okafor,
                image…". Give the "+3" a name that says what it is: "3 more people".
              </td>
            </tr>
            <tr>
              <td>In a button</td>
              <td>
                The button needs its own <code>aria-label</code> that says what it does, such as "Your account". Mark
                the avatar <code>decorative</code>.
              </td>
            </tr>
            <tr>
              <td>
                <kbd>Tab</kbd>
              </td>
              <td>Passes over an avatar. Lands on a button or a link that holds one.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>States</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>State</th>
              <th>Look</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Initials</td>
              <td>The tint, with the initials in a deeper (light mode) or paler (dark mode) shade of it, at 600 weight.</td>
            </tr>
            <tr>
              <td>Photo loading</td>
              <td>The initials, until the photo arrives and covers them.</td>
            </tr>
            <tr>
              <td>Photo loaded</td>
              <td>The photo, cropped to fill, with the hairline edge over it.</td>
            </tr>
            <tr>
              <td>Photo failed</td>
              <td>
                The initials stay: the Solid component drops the broken <code>&lt;img&gt;</code>. Static markup can't
                tell, so a browser may draw its small broken-image mark over the initials, as Chrome does. A static page's own photos rarely fail; people's photos are the app's, and the app uses
                the component.
              </td>
            </tr>
            <tr>
              <td>No letters in the name</td>
              <td>An outline of a person, in the tint's ink.</td>
            </tr>
            <tr>
              <td>In a button: hover, press, focus</td>
              <td>
                Dims a little on hover and more on press, and shrinks to 98% on press, as a Button does. The 2px
                accent focus ring circles it, or follows the square's corners.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        <strong>Mode and theme.</strong> The tints are pale with deep initials on light, deep with pale initials on
        dark. They stay opaque on glass, so the initials never depend on what's behind. Glass adds only its light to
        the edge.
      </p>

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
                <code>--avatar-xs</code> to <code>--avatar-xl</code>
              </td>
              <td>1.25rem, 1.5rem, 2rem, 2.5rem, 4rem. New.</td>
            </tr>
            <tr>
              <td>
                <code>--avatar-size</code>
              </td>
              <td>The size in use. Set it on an avatar, or on anything that holds avatars, for another size.</td>
            </tr>
            <tr>
              <td>
                <code>--avatar-radius-square</code>
              </td>
              <td>22% of the size, so every size of square has the same shape. New.</td>
            </tr>
            <tr>
              <td>
                <code>--avatar-group-gap</code>
              </td>
              <td>0.125rem (2px), the clear gap around each avatar in a group. New.</td>
            </tr>
            <tr>
              <td>
                <code>--control-rim</code>, <code>--control-hotspot-small</code>
              </td>
              <td>glass's light on the edge, as on Button but sized to the avatar. Classic sets none.</td>
            </tr>
            <tr>
              <td>
                <code>--control-height</code>
              </td>
              <td>the smallest target a button around an avatar reaches out to.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Platform support</h2>
      <p>
        Custom elements in the light DOM need no script. <code>light-dark()</code>, <code>oklch()</code>,{" "}
        <code>mask</code> and <code>:has()</code> are in every current browser. Without <code>:has()</code>, a button
        around an avatar keeps the Button look and still works.
      </p>

      <h2>References</h2>
      <p>
        Catalyst's Avatar for the photo with initials, <code>square</code>, the hairline edge over the photo, and
        AvatarButton, which is our Button holding an Avatar. Open Props UI's Avatar for the photo laid over the
        initials, and for a group that overlaps. Our gap is cut out where its ring is painted.
      </p>

      <h2>Other examples</h2>
      <p>
        Each example is the Solid component, with its code and the markup it renders. Switch the theme and mode with T and M, or the toggles at the bottom right. The
        photos are illustrations made for these docs.
      </p>
      <Example title="Sizes" name="avatar/sizes" />
      <Example title="Initials and tints" name="avatar/initials" />
      <Example title="With and without a photo" name="avatar/fallback" />
      <Example title="Teams and sites" name="avatar/square" />
      <Example title="Beside a name" name="avatar/list" />
      <Example title="A group" name="avatar/group" />
      <Example title="In a button" name="avatar/button" />
      <Example title="In a dialog" name="avatar/dialog" />
    </article>
  );
}
