import { For } from "solid-js";

/** The depths, shallowest first. The tokens are in src/styles/tokens.css. */
export const levels = [
  { level: 1, name: "Raised", uses: "Button, Icon button, Range thumb, Callout (glass)" },
  { level: 2, name: "Pane", uses: "Card, Auth layout's card, Stacked layout's content" },
  { level: 3, name: "Floating", uses: "Popover and the panels of Dropdown, Listbox, Select and Tooltip; Toast; a hovered Card" },
  { level: 4, name: "Overlay", uses: "Dialog, Alert" },
] as const;

export default function ShadowsPage() {
  return (
    <article>
      <p class="eyebrow">Spec</p>
      <h1>Shadows</h1>
      <p class="lede">
        Four depths. Every element with a shadow picks one, and none makes its own. The light comes from the top
        right, so every depth falls down and to the left, and a theme changes how, never which.
      </p>

      <h2>The depths</h2>
      <p>
        Each depth is three stacked layers, from a tight contact shadow to a wide, soft one, which is how a real
        object casts: sharp where it touches, spreading as it rises. Switch the theme and mode with the buttons at
        the bottom right to compare.
      </p>
      <beautiful-elevations>
        <For each={levels}>
          {(row) => (
            <beautiful-elevation data-elevation={row.level}>
              <strong>{row.level}</strong>
              <small>{row.name}</small>
            </beautiful-elevation>
          )}
        </For>
      </beautiful-elevations>

      <h3>With the glint</h3>
      <p>
        The same four with <code>data-glint</code>: the lit rim along the top right edge. Glass draws it; classic
        draws none.
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

      <h2>Which part uses which</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Depth</th>
              <th>Token</th>
              <th>Used by</th>
            </tr>
          </thead>
          <tbody>
            <For each={levels}>
              {(row) => (
                <tr>
                  <td>
                    {row.level}, {row.name}
                  </td>
                  <td>
                    <code>--shadow-{row.level}</code>
                  </td>
                  <td>{row.uses}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>How a part uses one</h2>
      <ul>
        <li>
          In CSS, a part sets <code>box-shadow: var(--shadow-3)</code>. The named tokens a part already reads
          (<code>--shadow-popup</code>, <code>--shadow-card</code>, <code>--control-shadow</code>) are only aliases for
          a depth, so no part picks a shadow of its own, and no theme redefines one.
        </li>
        <li>
          In markup, <code>data-elevation="1"</code> to <code>"4"</code> gives an element a depth. It sets the
          element's whole <code>box-shadow</code>, so use it on an element with no shadow of its own.
        </li>
        <li>
          Pressing in: a well that sinks (Input, Textarea, a pressed Toggle button) has an inner shadow, not a depth.
          Depths are for things that sit above the page.
        </li>
      </ul>

      <h2>The glint is separate</h2>
      <p>
        A shadow works on anything, but the glint needs a rounded box on glass. So the depth is the one choice every
        raised part makes, and <code>data-glint</code> is an addition: the lit edge of a pane or a button, drawn by
        the glass theme only. The rim follows <code>--rim-radius</code>, <code>--radius-lg</code> unless the element
        sets its own to match its corners. Dialog, Popover, Card and Toast have it by default. A part that isn't a pane, such as
        a thumb, has a shadow and no glint.
      </p>

      <h2>Look tokens</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--shadow-cast</code>
              </td>
              <td>
                How far left each layer falls, as a ratio of its drop. Glass is -0.5 (light from the top right);
                classic is 0 (straight down).
              </td>
            </tr>
            <tr>
              <td>
                <code>--shadow-halo</code>
              </td>
              <td>
                A faint outline with no offset around the whole shape, the last layer of each depth. Glass in light
                mode only, where it keeps the glint from washing out. Transparent elsewhere.
              </td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
    </article>
  );
}
