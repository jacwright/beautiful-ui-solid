import {
  type Action,
  type ActionList,
  addShortcuts,
  Button,
  Combobox,
  CommandPalette,
  commandPaletteAction,
  ComboboxDescription,
  ComboboxOption,
  keyLabel,
  actionKeys,
  ariaKeys,
  ShortcutSheet,
  shortcutSheetAction,
  Sidebar,
  SidebarBody,
  type SidebarCopy,
  SidebarHeader,
  SidebarLayout,
  SidebarItem,
  SidebarSection,
} from "beautiful-ui-solid";
import type { Component } from "solid-js";
import { createEffect, createSignal, For, onSettled, Show } from "solid-js";
import components from "../../../docs/components.md?raw";
import { parseComponents, slugOf } from "./nav.ts";
import AccordionPage from "./pages/accordion.tsx";
import AlertPage from "./pages/alert.tsx";
import AuthLayoutPage from "./pages/auth-layout.tsx";
import AvatarPage from "./pages/avatar.tsx";
import BadgePage from "./pages/badge.tsx";
import ButtonPage from "./pages/button.tsx";
import ButtonGroupPage from "./pages/button-group.tsx";
import CalloutPage from "./pages/callout.tsx";
import CardPage from "./pages/card.tsx";
import DescriptionListPage from "./pages/description-list.tsx";
import CheckboxPage from "./pages/checkbox.tsx";
import ChipPage from "./pages/chip.tsx";
import DialogPage from "./pages/dialog.tsx";
import DividerPage from "./pages/divider.tsx";
import DrawerPage from "./pages/drawer.tsx";
import DisclosurePage from "./pages/disclosure.tsx";
import DropdownPage from "./pages/dropdown.tsx";
import ContextMenuPage from "./pages/context-menu.tsx";
import CommandPalettePage from "./pages/command-palette.tsx";
import ShortcutSheetPage from "./pages/shortcut-sheet.tsx";
import ShortcutsPage from "./pages/shortcuts.tsx";
import ListboxPage from "./pages/listbox.tsx";
import ComboboxPage from "./pages/combobox.tsx";
import TagFieldPage from "./pages/tag-field.tsx";
import FocusRingPage from "./pages/focus-ring.tsx";
import HomePage from "./pages/home.tsx";
import FieldsetPage from "./pages/fieldset.tsx";
import HeadingPage from "./pages/heading.tsx";
import IconButtonPage from "./pages/icon-button.tsx";
import IllustrationsPage from "./pages/illustrations.tsx";
import InputPage from "./pages/input.tsx";
import LinkPage from "./pages/link.tsx";
import NavbarPage from "./pages/navbar.tsx";
import ListPage from "./pages/list.tsx";
import PaginationPage from "./pages/pagination.tsx";
import PopoverPage from "./pages/popover.tsx";
import RadioPage from "./pages/radio.tsx";
import MeterPage from "./pages/meter.tsx";
import EditorPage from "./pages/editor.tsx";
import ProgressPage from "./pages/progress.tsx";
import ShadowsPage from "./pages/shadows.tsx";
import SidebarPage from "./pages/sidebar.tsx";
import TreePage from "./pages/tree.tsx";
import RangePage from "./pages/range.tsx";
import SpinnerPage from "./pages/spinner.tsx";
import SelectPage from "./pages/select.tsx";
import SidebarLayoutPage from "./pages/sidebar-layout.tsx";
import StackedLayoutPage from "./pages/stacked-layout.tsx";
import SkeletonPage from "./pages/skeleton.tsx";
import TablePage from "./pages/table.tsx";
import SwitchPage from "./pages/switch.tsx";
import TabsPage from "./pages/tabs.tsx";
import TextPage from "./pages/text.tsx";
import TextareaPage from "./pages/textarea.tsx";
import TooltipPage from "./pages/tooltip.tsx";
import ToastPage from "./pages/toast.tsx";
import ToggleButtonPage from "./pages/toggle-button.tsx";
import ToggleGroupPage from "./pages/toggle-group.tsx";
import WebsitesPage from "./pages/websites.tsx";
import { type GuideName, guideNames, isPageName, pageGroups, type PageName } from "./pages.ts";
import { current, other, type Setting, settings, toggle } from "./settings.ts";

const pageComponents: Record<PageName, Component> = {
  Button: ButtonPage,
  "Button group": ButtonGroupPage,
  Text: TextPage,
  Heading: HeadingPage,
  Link: LinkPage,
  Divider: DividerPage,
  Callout: CalloutPage,
  Avatar: AvatarPage,
  Dialog: DialogPage,
  Alert: AlertPage,
  Fieldset: FieldsetPage,
  Popover: PopoverPage,
  Dropdown: DropdownPage,
  "Context menu": ContextMenuPage,
  Shortcuts: ShortcutsPage,
  "Shortcut sheet": ShortcutSheetPage,
  "Command palette": CommandPalettePage,
  Tooltip: TooltipPage,
  Listbox: ListboxPage,
  Combobox: ComboboxPage,
  "Tag field": TagFieldPage,
  "Focus ring": FocusRingPage,
  Input: InputPage,
  Radio: RadioPage,
  Progress: ProgressPage,
  Meter: MeterPage,
  Sidebar: SidebarPage,
  Tree: TreePage,
  Navbar: NavbarPage,
  Range: RangePage,
  Spinner: SpinnerPage,
  "Icon button": IconButtonPage,
  Select: SelectPage,
  "Auth layout": AuthLayoutPage,
  Drawer: DrawerPage,
  "Stacked layout": StackedLayoutPage,
  "Sidebar layout": SidebarLayoutPage,
  Skeleton: SkeletonPage,
  Textarea: TextareaPage,
  Toast: ToastPage,
  Card: CardPage,
  List: ListPage,
  Badge: BadgePage,
  Disclosure: DisclosurePage,
  Accordion: AccordionPage,
  "Description list": DescriptionListPage,
  Table: TablePage,
  Checkbox: CheckboxPage,
  Tabs: TabsPage,
  Pagination: PaginationPage,
  Chip: ChipPage,
  "Toggle button": ToggleButtonPage,
  "Toggle group": ToggleGroupPage,
  Switch: SwitchPage,
  Editor: EditorPage,
};

const guideComponents: Record<GuideName, Component> = {
  Websites: WebsitesPage,
  Illustrations: IllustrationsPage,
  Shadows: ShadowsPage,
};

const rows = parseComponents(components);
const withPage = rows.flatMap(({ name, slug }) => (isPageName(name) ? [{ name, slug, Page: pageComponents[name] }] : []));
const withoutPage = rows.filter((row) => !isPageName(row.name));
const guides = guideNames.map((name) => ({ name, slug: slugOf(name), Page: guideComponents[name] }));

const everyPage = [...withPage, ...guides];

/** The sidebar's sections, from pageGroups. nav.test.ts checks every page is in one. */
const byName = new Map(everyPage.map((row) => [row.name as string, row]));
const sections = pageGroups.map(({ heading, pages }) => ({ heading, rows: pages.flatMap((name) => byName.get(name) ?? []) }));

function pageAt(path: string) {
  const bare = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return everyPage.find((row) => `/${row.slug}` === bare);
}

export default function App() {
  const [path, setPath] = createSignal(location.pathname);
  const page = () => pageAt(path());

  function retitle(at: string) {
    const shown = pageAt(at);
    document.title = shown ? `${shown.name} · Beautiful UI` : "Beautiful UI";
  }
  function show(next: string) {
    setPath(next);
    retitle(next);
  }
  // Solid 2 forbids writing a signal while a component renders, so the first title is set without show().
  retitle(location.pathname);
  addEventListener("popstate", () => show(location.pathname));

  function follow(event: MouseEvent) {
    const link = (event.target as Element).closest("a");
    if (!link || link.origin !== location.origin || event.button || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }
    // A link to a new tab or a download is the browser's too.
    if (link.target === "_blank" || link.hasAttribute("download")) return;
    // A link to a spot on this page, such as an example's #pricing, is the browser's to follow.
    if (link.hash && link.pathname === location.pathname) return;
    event.preventDefault();
    go(link.href);
  }

  function go(href: string) {
    if (new URL(href, location.href).pathname !== location.pathname) history.pushState(null, "", href);
    show(location.pathname);
    scrollTo(0, 0);
  }

  // The search, at the top of the Sidebar, so there is one in each copy: beside the page, and in
  // the drawer on a narrow screen. Its key (/, as GitHub's and Gmail's) puts focus in the one that
  // shows, opening the drawer first on a narrow screen. Picking a page goes there. ⌘K is the
  // command palette's.
  const searches: Partial<Record<SidebarCopy, HTMLInputElement>> = {};
  let layout: HTMLElement | undefined;
  const searchAction = {
    id: "search",
    label: "Search pages",
    keywords: ["find", "go to"],
    keys: "/",
    run() {
      const menu = layout?.querySelector<HTMLElement>(":scope > header > button[data-icon-button]");
      if (!menu || getComputedStyle(menu).display === "none") return searches.page?.focus();
      if (!searches.drawer?.closest("dialog")?.open) menu.click();
      requestAnimationFrame(() => searches.drawer?.focus());
    },
  };
  // The theme and mode, flipped by their buttons at the bottom right and by their keys (T, M).
  const values = { theme: createSignal(current("theme")), mode: createSignal(current("mode")) };
  const flip = (setting: Setting) => values[setting][1](toggle(setting));
  const settingActions = (Object.keys(settings) as Setting[]).map((setting) => ({
    id: setting,
    label: `Switch ${settings[setting].label.toLowerCase()}`,
    keys: settings[setting].shortcut.toUpperCase(),
    run: () => flip(setting),
  }));
  // ? opens the sheet of the keys that work from where focus was, and ⌘K the palette of the actions.
  const [sheetFrom, setSheetFrom] = createSignal<Element>();
  const [paletteFrom, setPaletteFrom] = createSignal<Element>();
  // The site's own shortcuts: a scope on the page, and the same on the drawer, an open modal dialog
  // that keys outside it don't reach.
  const actions: ActionList = [searchAction, ...settingActions, shortcutSheetAction((from) => setSheetFrom(() => from)),
    commandPaletteAction((from) => setPaletteFrom(() => from)),
  ];
  onSettled(() => {
    const undo = [addShortcuts(document.body, actions, undefined, { label: "Docs" })];
    const drawer = searches.drawer?.closest("dialog");
    if (drawer) undo.push(addShortcuts(drawer, actions, undefined, { label: "Docs" }));
    return () => undo.forEach((each) => each());
  });

  function Search(props: { copy: SidebarCopy }) {
    let input: HTMLInputElement | undefined;
    function wire(el: HTMLInputElement) {
      input = el;
      searches[props.copy] = el;
    }
    // Combobox takes no aria-keyshortcuts of its own, so the box gets the search's keys here, as they change.
    createEffect(
      () => actionKeys(searchAction),
      (keys) => {
        if (keys) input?.setAttribute("aria-keyshortcuts", ariaKeys(keys));
        else input?.removeAttribute("aria-keyshortcuts");
      },
    );
    return (
      <search class="site-search">
        <Combobox
          search
          ref={wire}
          aria-label="Search pages"
          placeholder="Search"
          descriptions="inline"
          value=""
          onChange={(slug) => {
            if (!slug) return;
            go(`/${slug}`);
            // Picking from the drawer's copy closes the drawer, as following one of its links does.
            input?.closest("dialog")?.close();
            input?.blur();
          }}
        >
          <For each={sections}>
            {(section) => (
              <For each={section.rows}>
                {(row) => (
                  <ComboboxOption value={row.slug}>
                    {row.name}
                    <ComboboxDescription>{section.heading}</ComboboxDescription>
                  </ComboboxOption>
                )}
              </For>
            )}
          </For>
        </Combobox>
        <Show when={actionKeys(searchAction)}>{(keys) => <kbd aria-hidden="true">{keyLabel(keys())}</kbd>}</Show>
      </search>
    );
  }

  return (
    <beautiful-site onClick={follow}>
      <SidebarLayout
        id="docs"
        ref={(el: HTMLElement) => (layout = el)}
        navbar={
          <a href="/" class="site-name">
            Beautiful UI
          </a>
        }
        sidebar={(copy) => (
          <Sidebar aria-label="Pages">
            <SidebarHeader>
              <a href="/" class="site-name">
                Beautiful UI
              </a>
              <Search copy={copy} />
            </SidebarHeader>
            <SidebarBody>
              <For each={sections}>
                {(section) => (
                  <SidebarSection heading={section.heading}>
                    <For each={section.rows}>
                      {(row) => (
                        <SidebarItem href={`/${row.slug}`} current={page() === row}>
                          {row.name}
                        </SidebarItem>
                      )}
                    </For>
                  </SidebarSection>
                )}
              </For>
              <details>
                <summary>Not specified yet ({withoutPage.length})</summary>
                <ul>
                  <For each={withoutPage}>
                    {(row) => (
                      <li>
                        {row.name} <small>{row.status}</small>
                      </li>
                    )}
                  </For>
                </ul>
              </details>
            </SidebarBody>
          </Sidebar>
        )}
      >
        <Show when={page()} keyed fallback={<Home known={path() === "/"} />}>
          {(row) => <row.Page />}
        </Show>
      </SidebarLayout>
      <Toggles values={{ theme: values.theme[0](), mode: values.mode[0]() }} actions={settingActions} onFlip={flip} />
      <ShortcutSheet id="site-shortcuts" from={sheetFrom()} onClose={() => setSheetFrom(undefined)} />
      <CommandPalette id="site-palette" from={paletteFrom()} onClose={() => setPaletteFrom(undefined)} />
    </beautiful-site>
  );
}

/** The root path's overview, or a page that isn't one of the site's. */
function Home(props: { known: boolean }) {
  return (
    <Show when={props.known} fallback={<article><h1>Page not found</h1></article>}>
      <HomePage />
    </Show>
  );
}

/** The theme and mode, fixed at the bottom right so they show from anywhere on a page. Each button
 * shows its setting's value and flips it. Their keys (T, M) are the site's shortcuts, in App.
 */
function Toggles(props: { values: Record<Setting, string>; actions: Action[]; onFlip: (setting: Setting) => void }) {
  const actionOf = (setting: Setting) => props.actions.find((action) => action.id === setting)!;
  return (
    <aside class="site-toggles" aria-label="Theme and mode">
      <Toggle setting="theme" action={actionOf("theme")} value={props.values.theme} onFlip={() => props.onFlip("theme")} />
      <Toggle setting="mode" action={actionOf("mode")} value={props.values.mode} onFlip={() => props.onFlip("mode")} />
    </aside>
  );
}

function Toggle(props: { setting: Setting; action: Action; value: string; onFlip: () => void }) {
  const { label } = settings[props.setting];
  // The keys its action runs by: the person's, if they set some or turned single-key shortcuts off.
  const key = () => actionKeys(props.action);
  const to = () => `Switch to ${other(props.setting, props.value)}`;
  return (
    <Button aria-keyshortcuts={key() ? ariaKeys(key()!) : undefined} title={key() ? `${to()} (${keyLabel(key()!)})` : to()} onClick={props.onFlip}>
      <small>{label}</small>
      {capitalized(props.value)}
      <Show when={key()}>{(keys) => <kbd aria-hidden="true">{keyLabel(keys())}</kbd>}</Show>
    </Button>
  );
}

function capitalized(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
