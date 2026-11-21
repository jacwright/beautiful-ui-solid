import { type ActionList, ActionMenu, contextMenu } from "beautiful-ui-solid";
import { createSignal, For } from "solid-js";

const icon = (d: string) => () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

type Page = { name: string; path: string; draft?: boolean };

const folders = ["Marketing", "Blog", "Legal"];

/** One list for every page: the "…" button and a right-click both show it. */
function pageActions(say: (text: string) => void, rename: (page: Page) => void): ActionList<Page> {
  return [
    { id: "open", label: "Open", icon: icon("M11 3h6v6M17 3l-8 8M8 4H4v12h12v-4"), run: (page) => say(`Opened ${page.name}.`) },
    { id: "rename", label: "Rename", keys: "F2", icon: icon("M13.5 3.5l3 3L7 16H4v-3z"), run: rename },
    {
      id: "duplicate",
      label: "Duplicate",
      keys: "Mod+D",
      icon: icon("M7 7V4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5v7a1.5 1.5 0 0 1-1.5 1.5H13M3 8.5A1.5 1.5 0 0 1 4.5 7h7A1.5 1.5 0 0 1 13 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 15.5z"),
      run: (page) => say(`Duplicated ${page.name}.`),
    },
    {
      id: "move",
      label: "Move to",
      icon: icon("M3 6v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-6L8.5 5H4a1 1 0 0 0-1 1z"),
      actions: folders.map((folder) => ({ id: `move-${folder}`, label: folder, run: (page: Page) => say(`Moved ${page.name} to ${folder}.`) })),
    },
    {
      actions: [
        { id: "publish", label: "Publish", hidden: (page) => !page.draft, run: (page) => say(`Published ${page.name}.`) },
        { id: "unpublish", label: "Unpublish", hidden: (page) => !!page.draft, enabled: (page) => page.path !== "/", run: (page) => say(`Unpublished ${page.name}.`) },
        { id: "copy-link", label: "Copy link", shortcut: "L", run: (page) => say(`Copied the link to ${page.name}.`) },
      ],
    },
    {
      actions: [
        {
          id: "delete",
          label: "Delete",
          keys: "Delete",
          color: "danger",
          icon: icon("M4 6h12M8 6V4.5h4V6M5.5 6l.7 9.6a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4L14.5 6"),
          enabled: (page) => page.path !== "/",
          run: (page) => say(`Deleted ${page.name}.`),
        },
      ],
    },
  ];
}

const pages: Page[] = [
  { name: "Home", path: "/" },
  { name: "Pricing", path: "/pricing/" },
  { name: "About", path: "/about/" },
  { name: "Spring launch", path: "/spring-launch/", draft: true },
];

export default function SitePages() {
  const [said, say] = createSignal("Right-click a page, press Shift+F10 on one, or use its … button.");
  const actions = pageActions(say, (page) => say(`Renaming ${page.name}.`));
  const pageOf = (el: Element) => {
    const row = el.closest<HTMLElement>("[data-page]");
    return row ? pages.find((page) => page.path === row.dataset.page) : undefined;
  };
  return (
    <beautiful-demo-stack>
      <beautiful-demo-pages role="list" ref={contextMenu(actions, pageOf, { label: (page) => `Actions for ${page.name}` })}>
        <For each={pages}>
          {(page) => (
            <beautiful-demo-page role="listitem" data-page={page.path} tabindex="0">
              <strong>{page.name}</strong>
              <code>{page.path}</code>
              <ActionMenu actions={actions} context={page} label={`Actions for ${page.name}`} />
            </beautiful-demo-page>
          )}
        </For>
      </beautiful-demo-pages>
      <p role="status">{said()}</p>
    </beautiful-demo-stack>
  );
}
