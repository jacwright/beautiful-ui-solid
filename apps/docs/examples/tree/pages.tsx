import { type ActionList, Badge, moveTreeItem, Tree } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

/** Line icons, hidden from screen readers. */
const icon = (...paths: string[]) => () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {paths.map((d) => (
      <path d={d} />
    ))}
  </svg>
);

const BlogIcon = icon("M4 4h9v12H5a1 1 0 0 1-1-1zM13 7h3v8a1 1 0 0 1-2 0M6.5 7h4M6.5 10h4M6.5 13h2.5");
const CopyIcon = icon(
  "M7 7V4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5v7a1.5 1.5 0 0 1-1.5 1.5H13M3 8.5A1.5 1.5 0 0 1 4.5 7h7A1.5 1.5 0 0 1 13 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 15.5z",
);
const EyeIcon = icon("M2.5 10s2.7-5 7.5-5 7.5 5 7.5 5-2.7 5-7.5 5-7.5-5-7.5-5zM10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z");
const HomeIcon = icon("M3.5 9 10 3.5 16.5 9v7a1 1 0 0 1-1 1h-3.5v-4.5h-4V17H4.5a1 1 0 0 1-1-1z");
const MissingIcon = icon("M5 3h7l3 3v11H5z", "M12 3v3h3M8 10.5l4 4M12 10.5l-4 4");
const PageIcon = icon("M5 3h7l3 3v11H5z", "M12 3v3h3");
const PencilIcon = icon("M13.5 3.5l3 3L7 16H4v-3z");
const PlusIcon = icon("M10 4v12M4 10h12");
const TrashIcon = icon("M4 6h12M8 6V4.5h4V6M5.5 6l.7 9.6a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4L14.5 6");

type Page = { id: string; label: string; path: string; draft?: boolean; children?: Page[] };

const site: Page[] = [
  { id: "home", label: "Home", path: "/" },
  {
    id: "about",
    label: "About",
    path: "/about/",
    children: [
      { id: "team", label: "Team", path: "/about/team/" },
      { id: "careers", label: "Careers", path: "/about/careers/", draft: true },
    ],
  },
  { id: "pricing", label: "Pricing", path: "/pricing/" },
  {
    id: "blog",
    label: "Blog",
    path: "/blog/",
    children: [
      { id: "spring", label: "Spring launch notes", path: "/blog/spring-launch/" },
      { id: "why", label: "Why we built our site for readers", path: "/blog/why/" },
      { id: "moving", label: "Moving a site from another host", path: "/blog/moving/", draft: true },
    ],
  },
  { id: "contact", label: "Contact", path: "/contact/" },
  { id: "not-found", label: "Not found", path: "/404/" },
];

/** The pages with this one changed, or removed when change gives back nothing. */
function update(pages: Page[], id: string, change: (page: Page) => Page | undefined): Page[] {
  return pages.flatMap((page) => {
    if (page.id === id) return change(page) ?? [];
    return page.children ? [{ ...page, children: update(page.children, id, change) }] : [page];
  });
}

let added = 0;

/** A site's pages, as a site's admin shows them: pick one to see it, act on any from its menu, and drag one to move it. */
export default function SitePages() {
  const [pages, setPages] = createSignal(site);
  const [current, setCurrent] = createSignal("pricing");
  const [expanded, setExpanded] = createSignal<string[]>(["about"]);
  const [said, say] = createSignal("Showing /pricing/");

  const actions: ActionList<Page> = [
    { id: "preview", label: "Preview", icon: EyeIcon, run: (page) => say(`Previewing ${page.path}`) },
    { id: "rename", label: "Rename", keys: "F2", icon: PencilIcon, run: (page) => say(`Renaming ${page.label}`) },
    {
      id: "add",
      label: "Add a page inside",
      icon: PlusIcon,
      run: (page) => {
        const child = { id: `new-${++added}`, label: "Untitled page", path: `${page.path}untitled-${added}/`, draft: true };
        setPages((all) => update(all, page.id, (parent) => ({ ...parent, children: [...(parent.children ?? []), child] })));
        setExpanded((ids) => [...new Set([...ids, page.id])]);
        say(`Added a page inside ${page.label}`);
      },
    },
    { id: "duplicate", label: "Duplicate", keys: "Mod+D", icon: CopyIcon, run: (page) => say(`Duplicated ${page.label}`) },
    {
      actions: [
        {
          id: "delete",
          label: "Delete",
          keys: "Delete",
          color: "danger",
          icon: TrashIcon,
          hidden: (page) => page.path === "/",
          run: (page) => {
            setPages((all) => update(all, page.id, () => undefined));
            say(`Deleted ${page.label}`);
          },
        },
      ],
    },
  ];

  const iconOf = (page: Page) => {
    if (page.path === "/") return <HomeIcon />;
    if (page.path === "/404/") return <MissingIcon />;
    return page.path === "/blog/" ? <BlogIcon /> : <PageIcon />;
  };

  return (
    <beautiful-demo-stack>
      <beautiful-demo-sidebar>
        <Tree
          label="Pages"
          items={pages()}
          icon={iconOf}
          end={(page) =>
            page.draft ? <Badge>Draft</Badge> : page.children?.length ? <beautiful-tree-end>{page.children.length}</beautiful-tree-end> : undefined
          }
          selected={current()}
          onSelect={(page) => {
            setCurrent(page.id);
            say(`Showing ${page.path}`);
          }}
          expanded={expanded()}
          onExpandedChange={(ids) => setExpanded(ids)}
          actions={actions}
          onMove={(page, target, place) => {
            setPages((all) => moveTreeItem(all, page.id, target.id, place));
            say(`Moved ${page.label} ${place} ${target.label}`);
          }}
          canMove={(page, target, place) => page.path !== "/" && !(target.path === "/" && place === "before")}
        />
      </beautiful-demo-sidebar>
      <p role="status">{said()}</p>
    </beautiful-demo-stack>
  );
}
