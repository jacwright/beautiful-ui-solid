# Beautiful UI

A component kit and design system for [Solid 2.0](https://www.solidjs.com): 53 components,
a set of design tokens, and three themes (Modern, Classic and Glass), each in light and dark
mode. It comes with a docs site that shows every component and tests it.

It is built native first. Dialogs are `<dialog>`, menus and tooltips are `popover`s, and
disclosures are `<details>`. Positioning is CSS anchor positioning, and styling is plain
CSS with custom properties. JavaScript only adds what the platform lacks, so a component
renders little markup and stays fast. The CSS styles that markup on its own, so a static
HTML page gets the same look with no JavaScript at all.

## Components

Accordion, Alert, Auth layout, Avatar, Badge, Button, Button group, Callout, Card, Checkbox,
Chip, Combobox, Command palette, Context menu, Date picker, Description list, Dialog,
Disclosure, Divider, Drawer, Dropdown, Editor (rich text), Fieldset, Heading, Icon button,
Input, Link, List, Listbox, Meter, Navbar, Pagination, Popover, Progress, Radio, Range,
Select, Shortcut sheet, Sidebar, Sidebar layout, Skeleton, Spinner, Stacked layout, Switch,
Table, Tabs, Tag field, Text, Textarea, Toast, Toggle button, Toggle group, Tooltip and Tree.

There are also keyboard shortcuts and a ⌘K command palette built on one action model, a
virtual list for long lists and trees, and a focus ring that glides between controls.

## Themes

Themes are stylesheets that set tokens. Set them on the root element:

```html
<html data-theme="modern" data-mode="dark">
```

- `data-theme`: `modern` (the default, quiet and dense), `classic` (soft depth and shadows)
  or `glass` (frosted, see-through panes). Glass falls back to classic where
  `backdrop-filter` is missing or the user prefers reduced transparency.
- `data-mode`: `light` or `dark`. Without it, the kit follows the system's setting.

## Use it

```tsx
import "beautiful-ui-solid/styles.css";
import { Button } from "beautiful-ui-solid";

export function Delete() {
  return <Button variant="primary" color="danger">Delete</Button>;
}
```

The docs site has every component's props, keyboard behavior and examples, with the code
and the markup each one renders.

- `beautiful-ui-solid`: the components, from `src/`.
- `beautiful-ui-solid/styles.css`: the tokens, the themes and every component's CSS.
- `beautiful-ui-solid/web.css`: the extra styles for marketing pages and blog posts.
- `beautiful-ui-solid/dom`: the behavior for plain HTML pages (menus, tabs, toasts and the
  focus ring) with no Solid.
- `beautiful-ui-solid-editor` (`packages/editor`): a rich text editor on ProseMirror that
  reads and writes JSON, HTML and Markdown.

## Develop

You need Node 22 and pnpm 10 (`corepack enable` picks up the pinned version).

```sh
pnpm install
pnpm dev         # the docs site
pnpm build       # the docs site's static files, in apps/docs/dist
pnpm typecheck
pnpm test        # node tests, then the Playwright browser tests with axe checks
```

Every component has keyboard tests from its [APG](https://www.w3.org/WAI/ARIA/apg/) pattern
and axe checks in each theme and mode. Glass text contrast is measured from screenshots.
`CLAUDE.md` is the guide to the kit's conventions, for people and agents alike.

## Layout

- `src/`: the components (one `.tsx` file each) and their shared modules.
- `src/styles/`: `tokens.css`, the themes in `themes/` and each component's CSS in `elements/`.
- `apps/docs/`: the docs site, a Vite and Solid app. Examples are in `examples/`, browser
  tests in `tests/`.
- `packages/editor/`: the rich text editor.
- `docs/components.md`: the component list the docs site's navigation is built from.
- `third-party/`: the licenses of code adapted from other projects.

## Credits

The component set and names draw on Tailwind Catalyst, Headless UI and Open Props UI. Some
CSS is adapted from Open Props UI under its MIT license (`third-party/`).

## License

MIT. See `LICENSE`.
