import { moveTreeItem, Tree } from "beautiful-ui-solid";
import { createSignal } from "solid-js";

/** Line icons, hidden from screen readers. */
const icon =
  (...paths: string[]) =>
  () => (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path d={d} />
      ))}
    </svg>
  );

const FolderIcon = icon("M3 6v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-6L8.5 5H4a1 1 0 0 0-1 1z");
const PageIcon = icon("M5 3h7l3 3v11H5z", "M12 3v3h3");

type Page = { id: string; label: string; children?: Page[] };

const sections = ["Blog", "Guides", "Docs", "Help", "Stories", "Events", "Recipes", "Places", "Products", "Press"];
const topics = [
  "Getting started",
  "Billing",
  "Design",
  "Hiring",
  "Launches",
  "Marketing",
  "Pricing",
  "Security",
  "Support",
  "Teams",
];

/** Ten sections of fifty folders of ten pages: 5,510 pages in all. */
const site: Page[] = sections.map((section, s) => ({
  id: `s${s}`,
  label: section,
  children: Array.from({ length: 50 }, (_, f) => ({
    id: `s${s}-f${f}`,
    label: `${topics[f % 10]} ${Math.floor(f / 10) + 1}`,
    children: Array.from({ length: 10 }, (_, p) => ({
      id: `s${s}-f${f}-p${p}`,
      label: `Page ${f * 10 + p + 1}`,
    })),
  })),
}));

/** A tree of thousands of pages in a panel that scrolls. Only the rows in view are on the page. Drag near an edge and it scrolls. */
export default function LargeSite() {
  const [pages, setPages] = createSignal(site);
  const [expanded, setExpanded] = createSignal<readonly string[]>(sections.map((_, s) => `s${s}`));
  return (
    <beautiful-demo-sidebar data-scroll="">
      <Tree
        label="Every page"
        items={pages()}
        icon={(page) => (page.children ? <FolderIcon /> : <PageIcon />)}
        expanded={expanded()}
        onExpandedChange={(ids) => setExpanded(ids)}
        onMove={(page, target, place) => setPages((all) => moveTreeItem(all, page.id, target.id, place))}
      />
    </beautiful-demo-sidebar>
  );
}
