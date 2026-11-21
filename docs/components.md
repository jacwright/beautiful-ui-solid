# Components

The kit's component set. A component is specified and built only from a row here. Use the
name in the first column.

To add a row: when a reference has the component, use its name, Catalyst first, then
Headless UI, then Open Props UI. A more common name may win instead, as with Link
over Anchor; note it in the row. Put a component no reference has under "Our own", with a
name we choose. A name taken from Kobalte, Ark, Zag or React Aria is the tell of a wrong
source: a Kobalte "AlertDialog" was nearly specified where Catalyst has Alert.

The reference columns come from what each one ships:

- Tailwind Catalyst's docs.
- Headless UI 2.2.10's public exports (`@headlessui/react`, `dist/index.js`).
- Open Props UI 5.4.3's `components/` folder, plus `css/components/` for the CSS-only
  ones (`opui-css`). Its `Form` component is left out on purpose: it is a layout wrapper,
  and Fieldset covers it.

Re-derive them from the packages, not from a docs index page. An index page once hid Open
Props UI's Tabs and Toast.

Status is one of: listed, spec approved, built.

## From the references

| Component | Catalyst | Headless UI | Open Props UI | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Accordion | | | Accordion | built | A group of disclosures where one opens at a time: native `<details name>`. |
| Alert | Alert | | | built | Built on Dialog: title, description, body, actions. Catalyst props: `open`, `onClose`, `size`. |
| Auth layout | Auth layout | | | built | The page for signing in: one card, the page's `<main>`, centered on `<beautiful-auth-layout>`, on Dialog's surface. Glass gives the page a backdrop to bend. No frame on a phone. |
| Avatar | Avatar | | Avatar | built | A photo over the initials, on `<beautiful-avatar role="img">`, so the initials show while it loads and if it fails. The initials are `data-initials`, drawn by CSS, not a text node. The name picks one of eight tints. `square` for a team or site. Holds Catalyst's AvatarButton as a Button holding one, and a group that overlaps. |
| Badge | Badge | | Badge | built | A `<beautiful-badge>`: text, never a control. Soft or strong, with an optional status dot. Its colors are the kit's tints (`styles/tints.css`), which Chip shares. |
| Button | Button | Button | Button | built | Native `<button>`, or `<a data-button>` for a link. Variants primary, secondary (default), tertiary: named for the role, not the look. Colors neutral, accent, danger. `shape="pill"` for round ends (`data-shape`); `--button-radius` for any other corner. |
| Button group | | | ButtonGroup | built | Buttons joined into one control: a split button, a pager. `<beautiful-button-group role="group">` with a required label. Each Button keeps its own look; the group rounds the outer corners and draws one shadow and glass rim. |
| Callout | | | Callout | built | A notice in the page's flow, on `<beautiful-callout role="note">`: a `<strong>` title, text, actions. Tones info (default), success, warning, danger, neutral. `live` makes it a status or alert; `onDismiss` draws a ×. |
| Card | | | Card | built | `<beautiful-card>`, or `data-card` on a meaningful element: one frosted pane in glass that catches a Button's light, the raised panel in classic. Parts are native children: media (cropped to 16:9), `<hgroup>`, body, `<footer>`. `CardLink` in the heading makes the whole card a link. |
| Checkbox | Checkbox | Checkbox | Checkbox | built | A real `<input type="checkbox">`, drawn with `appearance: none`, rounded `--radius-sm`, so its focus ring is too. Off is the field well with a 3:1 edge (`--control-choice-edge`, shared with Radio); on or mixed is the primary accent fill. `indeterminate` and `defaultChecked` are props. |
| Chip | | | Chip | built | One thing someone picked or typed, with an optional × to remove it, on `<beautiful-chip>`. ChipGroup is the named list that moves focus after a removal. Badge's colors, from the shared `tints.css`. |
| Combobox | Combobox | Combobox | | built | A text box that filters Listbox's options as you type: `<input role="combobox" aria-autocomplete="list">` in Input's `<beautiful-input-group>` with a chevron button, opening a `<beautiful-popover popover="manual">` that holds `<beautiful-listbox role="listbox">`. Focus stays in the input with `aria-activedescendant` (`wireOptions`). `wireCombobox` (`autocomplete.ts`) filters by hiding options. |
| Description list | Description list | | DescriptionList | built | Native `<dl>`: muted terms beside their details, stacked under 24rem of the list's own width. Parts DescriptionTerm and DescriptionDetails, as Catalyst. |
| Dialog | Dialog | Dialog | Dialog | built | Native `<dialog>`. Sizes sm, md (default), lg, xl. No × button: Escape, the backdrop and Cancel close it. |
| Disclosure | | Disclosure | | built | One panel that shows and hides: native `<details>` and `<summary>`, kept native under the no-div rule. `summary` prop, `open` set on change, `onToggle`. The kit styles every `<details>`. |
| Divider | Divider | | Divider | built | Native `<hr>`, a hairline tinted from the text color. `soft` for lines inside a section, `orientation="vertical"` between things side by side. On glass a lit edge makes it a groove. |
| Drawer | | | Drawer | built | A Dialog that slides in from an edge: `<dialog data-drawer>`, side start, end (default), top or bottom. Floats 0.5rem in from its edges, rounded. A side drawer is full height and leaves 3rem of backdrop to tap. Dialog's parts, no × button. |
| Dropdown | Dropdown | Menu | | built | A menu of actions on Popover's panel, with `role="menu"`. Items are `<button>` or `<a>` with `role="menuitem"`. `wireMenu` adds the keys, and the Solid component calls it. |
| Fieldset | Fieldset | Field, Fieldset, Label, Legend, Description | FieldSet, FieldGroup, FieldLegend, FieldDescription | built | Also holds Catalyst's Field, Label, Description and ErrorMessage. Every form control reads its Field with `useField()`. |
| Heading | Heading | | | built | Native `<h1>` to `<h6>`. `level` is the outline, `size` the look (sm, md, lg, xl, display), defaulting by level. Holds Catalyst's Subheading. |
| Icon button | | | IconButton | built | A square Button with only an icon: `data-icon-button` on a `<button>` or `<a data-button>`. Takes Button's variants, colors and shape (a pill is a circle). `label` is required, and shows in a Tooltip that names the button. |
| Input | Input | Input | TextField | built | A native `<input>` of a text type, and Catalyst's InputGroup for an icon or a button inside it. Its `--field-*` tokens are Textarea's and Select's well too. Its Field checks it. A phone number formats as it's typed. |
| Link | | | Anchor | built | A styled `<a href>`, and Catalyst's TextLink. Accent (default) or neutral, always underlined; `target="_blank"` adds an arrow and says "opens in a new tab". Named Link: the more common term. |
| List | | | List, ListItem | built | Native `<ul>` and `<ol>`: bullets for prose on every bare list, and rows (`variant="rows"`) for a list of things. Not a widget: no arrow keys. |
| Listbox | Listbox | Listbox | | built | A custom select with rich options: a field-look `<button aria-haspopup="listbox">` opening a `<beautiful-popover popover>` that holds `<beautiful-listbox role="listbox">` of `<beautiful-listbox-option>`s, focus on the list with `aria-activedescendant`. `wireOptions` (`options.ts`) is the option list Combobox reuses. Items share `item.css` with Dropdown. |
| Navbar | Navbar | | | built | A native `<nav data-navbar>` of links and buttons, in `beautiful-navbar-section`s, with an `<hr>` divider and a `beautiful-navbar-spacer`. `aria-current="page"` draws a bar that glides between items (the nav's `::after`, on anchor positioning). A Dropdown's button in it takes the item look. A row that doesn't fit scrolls. |
| Pagination | Pagination | | | built | A `<nav data-pagination>` of Links: Previous, a `<beautiful-pagination-list>` of page links with `aria-current="page"`, Next. Folds to "6 of 12" where it's narrow. |
| Popover | | Popover | | built | Native `popover`, placed with anchor positioning. Its panel is the base of Dropdown, Tooltip, Listbox and Combobox. |
| Progress | | | Progress | built | Native `<progress>`: determinate with a value, a sweeping glow without one. In a Field, the value shows at the end of the label's line, and an error turns the fill danger. A level that stays, such as storage used, is a `<meter>`, not Progress. |
| Radio | Radio button | RadioGroup | Radio | built | A real `<input type="radio">`, drawn with `appearance: none` as a circle, so its focus ring is one too. RadioGroup is a Fieldset with `role="radiogroup"` that names its radios and holds the value. Reads the `--control-choice-*` tokens Checkbox shares. The group checks itself: a required group sent with nothing chosen says "Choose an option." once, under its last option. |
| Range | | | Range | built | Native `<input type="range">`, its track and thumb drawn with `appearance: none`. In a Field its value shows at the end of the label's line, in words from `format`. Marks are a `<datalist>`. |
| Select | Select | Select | Select, ClassicSelect | built | Native `<select>` in Input's well. In Chromium with a mouse the open list is the kit's own (customizable select); elsewhere the browser's. A placeholder is a first disabled, hidden option. |
| Sidebar | Sidebar | | | built | `<nav data-sidebar>` with a pinned `<header>` and `<footer>` and a `<beautiful-sidebar-body>` that scrolls; a section is `<beautiful-sidebar-section role="group">`. Items are `<a href>`, or `<button>` without one; the current one has `aria-current="page"`. Catalyst's SidebarHeading is Section's `heading` prop; its SidebarLabel and SidebarSpacer aren't needed. |
| Sidebar layout | Sidebar layout | | | built | An app page with the Sidebar down the left and the content in `<main>` beside it, a pane on a wide screen. Under 40rem the Sidebar hides, a `<header>` shows a menu button and an optional Navbar, and the button opens the Sidebar again in a small `<dialog data-drawer="start">`. On `<beautiful-sidebar-layout>`, with a skip link. Shares the pane, header and breakpoint with Stacked layout (`layout.css`). |
| Spinner | | | spinner (CSS only) | built | One `<beautiful-spinner role="status">`: the ring is its two pseudo-elements, in the text's color. Waits `--spinner-delay` (400ms) before it shows, and its words go in then, so a screen reader hears them. Breathes instead of turning under reduced motion. |
| Stacked layout | Stacked layout | | | built | An app page with a Navbar across the top, in the page's `<header>`, and the content in `<main>`, a pane on a wide screen. On a narrow one a menu button opens the Sidebar in a drawer, a modal `<dialog data-drawer="start">` from the left, and Navbar sections marked `data-collapse` hide. On `<beautiful-stacked-layout>`, with a skip link. |
| Switch | Switch | Switch | Switch | built | A real `<input type="checkbox" role="switch">`, drawn with `appearance: none`: the input is the track and its background draws the thumb. Colors accent (default) and neutral. In a Field it sits at the end of the label's line. |
| Table | Table | | Table | built | Native `<table>` on a pane, `<beautiful-table>`, that scrolls sideways. Catalyst props `dense`, `striped`, `grid`; its `bleed` is `plain`. Rows as links, sortable columns with `aria-sort`. |
| Tabs | | Tabs | Tabs | built | The APG tabs pattern: `<beautiful-tab-list role="tablist">` of `<button role="tab">`, and `<beautiful-tab-panel role="tabpanel">`, in `<beautiful-tabs>`. The selected line glides with anchor positioning. `wireTabs` adds the keys to static markup. Tabs pair with panels in order, with ids `<id>-tab-<n>` and `<id>-panel-<n>`. Not for pages: that is Navbar. |
| Text | Text | | typography (CSS only) | built | Native `<p>`. Also holds Catalyst's Strong and Code, as the styled native `<strong>` and `<code>`. Catalyst's TextLink is Link. |
| Textarea | Textarea | Textarea | Textarea | built | A native `<textarea>` on Input's well. It grows with its text from its rows to 12 lines, counts the characters left under a `maxlength`, and sends its form on ⌘/Ctrl + Enter. |
| Toast | | | Toast | built | A stack of `<beautiful-toast>`s in a `<beautiful-toaster>`, a region that is a polite live region and a `popover="manual"`, kept open in the top layer. While a modal dialog is open the stack moves into it. Tones success and danger. `toast()` shows one from anywhere. |
| Toggle button | | | ToggleButton | built | A native `<button aria-pressed>`, not Open Props UI's hidden checkbox. Raised like a Button, and pressed it sinks into a well tinted with its color (the `--field-*` tokens). Secondary or tertiary, neutral or accent. |
| Toggle group | | | ToggleGroup | built | Covers the segmented control. Segments on a frosted groove; what's on rises on a raised pane, chosen over sunk segments. One choice is an APG radio group of `<button role="radio">` with one thumb that glides by anchor positioning; `multiple` is a group of `<button aria-pressed>` with toolbar keys, a pane per pressed segment, neighbours sharing one. One Tab stop, arrows inside. `wireToggleGroup` for static markup. |
| Tooltip | | | Tooltip | built | A hint on hover or focus: `<beautiful-tooltip popover="hint" role="tooltip">` on Popover's surface, shown by `interestfor`. `wireTooltip` does it where the browser lacks interest invokers. |

Layouts from Catalyst: Auth layout, Stacked layout and Sidebar layout, all in the table.

## Our own

Components we need that no reference has. Name them ourselves. Each still gets a spec
that is approved before it is built.

| Component | Status | Notes |
| --- | --- | --- |
| Focus ring | built | The keyboard focus ring, which glides from one control to the next on Tab. Not a component you render: the app starts it once. |
| Skeleton | built | Loading placeholder. Shapes: text lines, rect, circle. SkeletonGroup is the busy region, with a label for screen readers. |
| Date picker | built | A date field with a calendar Popover, on APG's Date Picker Dialog. It replaces the browser's picker and came with Input, so its spec is on Input's page. |
| Tag field | built | A field that holds several values as Chips, with a text box after them that filters a list of options as Combobox's does. It can let what was typed become a tag of its own. Headless UI's Combobox has `multiple`, but no reference shows the picks as chips in the field, so the name is ours. |
| Meter | built | A level that stays, out of a limit, such as storage used: native `<meter>`, drawn as Progress's bar. `low`, `high` and `optimum` turn the fill amber, then red. No reference has one. |
| Context menu | built | An action list, defined once, shown as a right-click menu at the pointer and as a "…" ActionMenu button, and binding its keys. On Dropdown's menu, plus submenus and checkbox or radio items. The action list (`actions.ts`) is what Tree and the text editor build on. No reference has one. |
| Shortcuts | built | One keyboard shortcut system for a whole app, on Context menu's action list (`shortcuts.ts`). Any element registers a list as a scope; on a key press the innermost scope around focus runs it, and an open modal dialog or menu is a wall. Context menu and the Editor register theirs. No reference has one. |
| Command palette | built | ⌘K opens a Dialog with a search box over every action reachable from where focus was, from `reachableShortcuts()` (Shortcuts): in sections by scope, or best first as you type, with their keys. Enter closes it, then runs the action where focus was. / is search. Linear's and Raycast's are the bar; no reference has one. |
| Shortcut sheet | built | ? opens a Dialog of the keyboard shortcuts that work from where focus was, one section per scope, from `reachableShortcuts()` (Shortcuts). Keys a scope further in took are left out. A person turns single-key shortcuts off and sets their own keys from it, kept per person in the browser (`shortcut-settings.ts`, WCAG 2.1.4). No reference has one. |
| Editor | built | Rich text people write in, from one line of a page's text to a whole post with pictures, video and an app's own blocks. On ProseMirror, in its own package (`beautiful-ui-solid-editor`) so the kit's core doesn't carry it. Presets `inline`, `text` and `post`, built from extensions. Every menu (selection toolbar, slash, right-click, fixed toolbar) reads Context menu's action list. No reference has one. |
| Tree | built | Nested items a person opens, closes and selects one of, such as a site's pages in a site admin, on APG's Tree View. Items are flat in the DOM with `aria-level`. Each row: chevron, icon, label, an end (Badge, count), and a "..." button whose menu is the same as the row's right-click menu, from the shared action model (Context menu). No reference has a tree, so the name is ours. It renders only the rows in view, so it holds thousands of items. With `onMove`, rows drag to reorder and nest, and a keyboard Move picks a spot with the arrows. |
| Virtual list | built | `createVirtualList` (`virtual.ts`): which rows of a long list of one-height rows to render, the rest standing in as spacers, inside whatever scrolls. Not a component you render: a list component calls it. Tree is the first to use it; its spec is on Tree's page. |
