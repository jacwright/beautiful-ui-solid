# Beautiful UI

A Solid 2.0 component kit, with the CSS that gives a plain HTML page the same look. This file
is the guide for anyone, person or agent, changing the kit. `README.md` is the overview.

## Principles

- **Solid 2.0.** Pin exact versions, and move `solid-js`, `@solidjs/web`,
  `@solidjs/vite-plugin` and the compiler override in `pnpm-workspace.yaml` together.
- **Our own components.** No headless toolkit as a dependency: not Kobalte, Ark or
  Headless UI. A component is one file that a reader takes in at once.
- **Native first.** Use what the browser already has: `<dialog>`, `popover`,
  `commandfor`, `<details name>`, real `<input>`s, CSS anchor positioning. Write JS only
  for behavior the platform lacks.
- **Fewest DOM nodes.** A wrapper element must earn its place. Draw indicators with
  pseudo-elements and CSS masks, not extra nodes.
- **Light DOM.** `beautiful-*` elements are styling hooks where no semantic element fits.
  No shadow DOM. Solid 2 sets `{…}` values on a `beautiful-*` element as attributes, so
  write them plain (`data-active={…}`). Use `prop:` only to set a DOM property. Never
  write `attr:`: Solid 2 writes it out as a literal attribute named `attr:…`.
- **No `<div>` or `<span>`**, anywhere: not in a component, an example, a docs page or a
  test. Where no semantic element fits, use `beautiful-<component>` or
  `beautiful-<component>-<part>` (`<beautiful-tooltip popover="hint">`), declared for TSX beside
  its component, or in `apps/docs/src/elements.ts` for the docs site's own. A list that is a
  component's structure is a `beautiful-*` element too, not `<ol>`/`<li>`. Keep native elements
  that mean something: `<button>`, `<input>`, `<dialog>`, `<p>`, `<header>`, `<kbd>`. A custom
  element is inline until CSS sets its `display`. `apps/docs/src/markup.test.ts` checks the source,
  and `apps/docs/tests/pages.spec.ts` checks what each page renders.
- **Native CSS** with custom properties. Not Tailwind.
- **Fast, easy and still simple.** Every component should be quick, flexible and a pleasure
  to use.

## Architecture

- Themes are stylesheets. Modern is the default: classic flattened and tightened
  (`themes/modern.css`), applying unless the root says another theme, and setting only
  tokens, never a component rule. Glass applies on `data-theme="glass"` and falls back to
  classic. `data-theme="modern|glass|classic"` and `data-mode="light|dark"` on the root are
  independent.
- Components read the `--surface-*`, `--motion-*` and `--ease-*` tokens, never
  `backdrop-filter` directly. A theme sets the tokens. What each token does is in
  `src/styles/tokens.css` and `src/styles/themes/` (`classic.css`, `glass.css`, `modern.css`).
- Build each component in classic first. Glass is a layer on top, and it falls back to
  classic where `backdrop-filter` is missing or the user prefers reduced transparency.
- Enter is slower than exit. Under reduced motion a component drops movement, keeps a fade.
- The CSS styles native markup, so a static page gets the look with no JS. The Solid
  components render that markup and add the wiring (label, description, error) and the
  behavior the platform lacks. `src/dom.ts` (`beautiful-ui-solid/dom`) wires plain markup's
  menus, tabs and toasts with no Solid, for static websites. An app uses the Solid
  components instead.

## Docs site

`apps/docs`, built from the kit itself, is the workbench: components are specified,
built, reviewed and tested on it. No Storybook.

- Each component has one page. It opens with the spec: what it does, its props, its
  keyboard behavior, and its states.
- Every example is a Solid component, `apps/docs/examples/<component>/<name>.tsx`, whose
  default export uses the kit's components. The page renders it with
  `<Example title name="<component>/<name>" />`, which shows it live, its code, and the
  markup it renders (for static pages). The tests run against the same examples, on the
  page and on the component's harness (`tests/harness/examples.tsx`, `renderHarness`).
  Never write an example as `.html`: `src/examples.test.ts` fails on one. The one exception
  is the Websites guide (`examples/websites/`), whose examples are static pages.
- Guides are pages that aren't one component: Websites (marketing pages and blog posts, on
  `src/styles/web.css`) and Illustrations (a picture style and prompts for it).
  `apps/docs/src/pages.ts` lists them.
- A component page leads with the bare component, right after the lede:
  `examples/<component>/lead.tsx`, rendered `<Example title="<Component>" hero
  name="<component>/lead" />`. No stage, no headline. The staged examples follow under
  "Other examples". An example's name and title must not repeat another's on the page
  (axe's landmark-unique check, and strict locators). The lead uses the page's own component
  from the kit, never hand-written markup, and the kit's components for its parts (Text, not
  `<p>`). `src/leads.test.ts` fails on a component page without its lead. Foundations have none.
- A new page goes in `pageNames` (one name a line, so merges don't conflict) and in exactly
  one of `pageGroups` in `src/pages.ts`, the sidebar's sections. `src/nav.test.ts` fails
  otherwise.
- The home page (`src/pages/home.tsx`, at `/`) overviews the kit. When a foundation or a
  rule lands, such as a token family or a convention, add a line to it. It reads its facts
  from the pages that own them (`illustrations.tsx`'s brand colors, `shadows.tsx`'s
  `levels`), never a copy.

## Working on a component

- Add the `docs/components.md` row, write the spec page, then build it.
- Check every UI change in screenshots of each theme in light and dark mode, at desktop and
  phone widths, before you call it done.

## Tokens

Spacing, radius, size, color, shadow and motion come from tokens (`src/styles/tokens.css`,
`themes/`). Never hardcode a value: add a token. Reuse a family before adding one:

- **Depth.** Four shadows, `--shadow-1` to `--shadow-4` (raised, pane, floating, overlay).
  An element picks one with `data-elevation="1-4"`; `data-glint` adds glass's rim, separately.
  Themes set only `--shadow-cast` (glass's light comes from the top right, -0.5; classic's
  from straight above, 0) and `--shadow-halo`. Named shadows such as `--control-shadow` are
  aliases of a depth. `apps/docs/src/elevation.test.ts` fails on a theme's own outer shadow.
- **Edges.** A raised pane under a shadow ends crisply, with no gray edge:
  `--control-pane-edge`. `--control-edge` is for neighbours in a group and form controls.
  Hairlines are `--hairline-width` and `--color-hairline(-soft)`.
- **Buttons.** Round one with `--button-radius`, never `border-radius`: the rim divides it
  by `--control-rim-scale`.
- **Families.** The field well `--field-*` (Input, Select, Textarea); choices
  `--control-choice*` (Checkbox, Radio); tracks and thumbs `--track-*`, `--thumb-*` (Range,
  Progress, Meter, Switch); popups `--popup-*`; colored labels read `tints.css` (`data-color`,
  `--tint-*`); danger text and edges are crimson `--color-danger`.
- `light-dark()` can't take lengths in Chromium, so a size per mode needs `[data-mode]` and
  `prefers-color-scheme` selectors.

## Shared modules

Build on these rather than writing another: `actions.ts` (the action model behind menus,
context menus, Tree and the Editor; `runActionKey`), `shortcuts.ts` (keyboard shortcut scopes
on action lists: never add a window keydown for a shortcut, register the list with
`shortcuts()`; show and match an action's keys through `actionKeys()`, which applies the
person's own, never `action.keys`), `menu.ts` (`wireMenu`), `options.ts` (`wireOptions`, an
option list on `aria-activedescendant`), `typeahead.ts`, `autocomplete.ts` (`wireCombobox`),
`virtual.ts` (`createVirtualList`), `layout.ts` (shared by the layouts), `focus-ring.ts`,
`handler.ts` (`call()` for JSX handlers), and `styles/elements/item.css` (the row Dropdown,
Listbox and Combobox share).

## Gotchas

- **Solid 2.** A ref runs on a template copy, so wire document listeners in `onSettled`. A
  child that writes its parent's signal while it is created throws
  `REACTIVE_WRITE_IN_OWNED_SCOPE`: create the signal with `{ ownedWrite: true }`. Give an
  effect's callbacks block bodies, or one can return an "invalid cleanup value". A memo reads
  its signal before any early return, or it never reruns. In a keyed `For`, make a row's
  derived values `createMemo`s, or each slot change rebuilds them mid-click. A keyed `For` moves
  rows with `moveBefore` where the browser has it: focus stays, but Chromium scrolls a moved
  focused element into view, so `virtual.ts` puts the scroll position back.
- **CSS.** `button.css` sizes every button's `::before` as the rim: reset width, height,
  scale and mask when reusing it. `container-type` collapses a content-sized box to 0. A
  popover anchored to a `visibility: hidden` element is hidden too. A layered `background`
  shorthand on a `::after` makes axe give up on contrast: set `background-color` and
  `background-image` apart.

## References

Read these for ideas. Write our own code.

- **Tailwind Catalyst** and **Tailwind Plus Elements** (Tailwind Plus license): the
  component set, names, props, interaction details, and how Tailwind wires `<dialog>`,
  `popover` and `commandfor`. Never copy their source or class strings.
- **Headless UI** (MIT): more components and the interaction behavior behind Catalyst. Its
  logic may be adapted. Keep its notice with anything adapted.
- **Open Props UI** (MIT): more components, and CSS for native elements. Copying is
  allowed. Keep its MIT notice with anything copied, in `third-party/`.
- **APG** (WAI-ARIA Authoring Practices): keyboard and screen-reader behavior.

Take every component and its name from `docs/components.md`. Its header says how to name
a new row. Kobalte, Ark, Zag and React Aria are not references.

## Testing

Before each component, write its Playwright keyboard test and axe check from its APG
pattern, run against its docs examples.

- `pnpm test` at the root runs every package's tests. In `apps/docs` it runs
  `node --test src/*.test.ts`, then `playwright test`. Playwright starts its own Vite dev
  server on port 5174 (`playwright.config.ts`).
- With `CHANGED_BASE` set to a git ref, `apps/docs/scripts/test.sh` runs only the browser
  tests of the components changed since that ref, plus the deploy check. A component's files
  are its `src/<name>.tsx`, `styles/elements/<name>.css`, examples, docs page, spec and
  harness, and a module of `src/` counts for every component that imports it (`menu.ts` runs
  Dropdown and Listbox). A change to anything else (tokens, themes, shared CSS such as
  `item.css`, the docs app, `glass.spec.ts`) runs them all. CSS has no imports, so a
  component whose CSS changes another's look, such as Button's, is tested only as itself:
  run the specs it reaches by hand.
- `tests/<component>.spec.ts` holds a component's tests: keys from its APG pattern, axe on
  the docs examples in each theme and mode, and axe's contrast check on its harness.
- `tests/harness/<component>.html` renders the component's docs examples on the kit's plain
  canvas, each in a `<beautiful-example data-example="<name>">` (`renderHarness`), then the
  blocks that test what no example shows. `?example=<name>` renders that one alone. The site
  build leaves the harness out.
- axe can't judge contrast over the docs page's gradient or through glass.
  `tests/glass.spec.ts` measures glass from pixels on every docs page in `src/pages.ts`:
  it hides each piece of text on glass, screenshots what's behind, and fails under 4.5:1
  against the least-contrasting pixel. It runs in both modes, over the plain and bright
  stages, at 900px and 390px, with each control hovered too. A new page is checked with no
  edit, and an example with a `<dialog>` or a `popover` is checked open.
- A flaky test is a test bug. To catch a transition partway, pause the animation and set
  its `currentTime` in the same `evaluate` that starts it, never sample frames.
  `::details-content` animations aren't in `getAnimations()`: drive them through CDP's
  Animation domain. After `goto`, wait for the harness and `document.fonts.ready`, then
  `expect.poll` a measurement. Compare widths within 1px, never rounded. A settle wait counts
  only `DocumentTimeline` animations, since scroll-driven ones never finish
  (`tests/contrast.ts`). `getByRole` matches names by substring: pass `exact: true`. A
  tooltip opened by `el.showPopover()` with nobody hovering or focusing its control hides itself
  after the hide delay: open one by hovering its control, as the helper `showPopover` in
  `tests/contrast.ts` does. Click an item in a menu or another popover with `clickInPopover`
  (`tests/contrast.ts`), which waits for it to finish coming in: clicked while it grows,
  Playwright can scroll the page under it and hit what's beneath. Time a delay in the page
  (`performance.now()` at the pointer's arrival and at the `toggle`), or hold it with a long
  token, never with a `waitForTimeout` that has to end before it does. Every docs `<pre>` has
  `tabindex="0"`, since whether one scrolls depends on the font loaded (`src/markup.test.ts`).
  Reproduce under load with a few busy-loop shells and `--repeat-each=40 --workers=4`.
- The test script runs `playwright install chromium` first, which downloads Chromium once
  where it's missing and does nothing where it's there.

## Security

The kit is front-end code that runs inside an app's pages, with that app's session. It holds
no secrets and makes no requests of its own. The one thing it stores is a person's shortcut
settings (`src/shortcut-settings.ts`, in `localStorage` under `beautiful:shortcuts`): keys by
action id, read back as plain strings, never markup. A review checks:

- **Markup from props.** Components render through Solid's JSX, which escapes text, so a
  name, label or message from an app's data can't become markup. No component parses a
  string as HTML, but for the Editor's HTML format. `apps/docs/src/html-sinks.test.ts`
  fails on `innerHTML`, `insertAdjacentHTML`, `eval` and the other sinks anywhere in `src/`,
  `packages/editor/src/`, the examples, the docs app or the harness pages. It allows
  Example's line in `spec.tsx` and the Editor's parser in `packages/editor/src/format.ts`.
- **The Editor's values.** An app hands the Editor what people wrote, as JSON, HTML,
  Markdown or text, and stores what it hands back. HTML is read into an inert document,
  which runs no script and loads nothing, then through the schema, which keeps only its own
  nodes and marks and their attributes: no `script`, `style`, handler or unknown element
  survives. Markdown's HTML stays as text, but for a video or an embed's block, which goes
  through the same schema. `safeHref` keeps a link to http, https, mailto, tel or a path on
  the site; `safeSrc` keeps a picture or video to https, http, a path or a `blob:` not yet
  uploaded. The output is written by the Editor's own escaping serializer. An app that
  shows the HTML elsewhere should still sanitize it there. The browser spec feeds it
  hostile HTML (`tests/editor.spec.ts`, Editor formats).
- **The Editor's embeds and video players.** An embed's block is the app's own Solid
  component, given its stored props: the app checks them as any data. A YouTube or
  Vimeo player is an `iframe` on `youtube-nocookie.com` or `player.vimeo.com` only, sandboxed,
  built from the video's id, never from a pasted URL as given.
- **URLs from props.** A component passes `href` and `src` through as given (Link, Button as
  a link, Table rows, Navbar, Sidebar, Pagination, Avatar). It never builds one from
  content, and the app checks a URL that comes from people's data. A link that opens a
  new tab opens it without an opener (Table's `window.open(…, "noopener")`). Avatar loads
  the image an app names, and passes `referrerpolicy` and `crossorigin` on.
- **What a component does on its own.** No `fetch`, beacon, cookie, storage or global
  listener left behind, but for shortcut settings' one `localStorage` entry and its `storage`
  listener, which keeps other tabs in step. Input's `https://` prefix only fills in a scheme, and its
  libphonenumber import is a bundled chunk, not a URL. The docs site keeps only its theme
  and mode in `localStorage` (`apps/docs/src/settings.ts`).
- **The docs examples.** Example sets `innerHTML` from the files in `apps/docs/examples/`,
  imported with `?raw` at build time. It never takes HTML from the URL, storage or a fetch.
  The harness's `?example=` only picks which example renders.
- **Third-party code.** One runtime dependency in the kit, `libphonenumber-js`, pinned
  exactly; a new one is a dependency change. `beautiful-ui-solid-editor` has its own:
  ProseMirror's packages, `prosemirror-markdown` and `markdown-it`, pinned exactly. Code
  adapted from Headless UI or copied from Open Props keeps its MIT notice (`third-party/`).
  Nothing from Tailwind Catalyst or Tailwind Plus is copied.

## Deploy

The docs site is static files: `pnpm build` writes them to `apps/docs/dist`. `wrangler.jsonc`
serves them from a Cloudflare Worker (`pnpm run deploy` in `apps/docs`, from `main`), and
`pnpm run preview` uploads a preview named after the branch. Any static host works too, with
every unknown path answered by `index.html`.

The check that proves a deploy worked: in a browser, each component page renders its
`<h1>`. An HTTP 200 proves nothing: every path serves `index.html`. `tests/pages.spec.ts`
is that check: `DOCS_URL=<url> pnpm run check` in `apps/docs`. It also runs in `pnpm test`,
against the dev server.
