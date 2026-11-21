import { Tree } from "beautiful-ui-solid";

/** Line icons, hidden from screen readers. */
const icon = (...paths: string[]) => () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {paths.map((d) => (
      <path d={d} />
    ))}
  </svg>
);

const FolderIcon = icon("M3 6v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-6L8.5 5H4a1 1 0 0 0-1 1z");
const PageIcon = icon("M5 3h7l3 3v11H5z", "M12 3v3h3");

type Doc = { id: string; label: string; children?: Doc[] };

const docs: Doc[] = [
  {
    id: "guides",
    label: "Guides",
    children: [
      { id: "start", label: "Getting started" },
      { id: "websites", label: "Websites" },
      { id: "illustrations", label: "Illustrations" },
    ],
  },
  {
    id: "components",
    label: "Components",
    children: [
      {
        id: "forms",
        label: "Forms",
        children: [
          { id: "input", label: "Input" },
          { id: "select", label: "Select" },
          { id: "checkbox", label: "Checkbox" },
        ],
      },
      {
        id: "overlays",
        label: "Overlays",
        children: [
          { id: "dialog", label: "Dialog" },
          { id: "popover", label: "Popover" },
        ],
      },
    ],
  },
  { id: "changelog", label: "Changelog" },
];

/** A tree with no actions, holding its own state: the selected doc's folder starts open. */
export default function Docs() {
  return (
    <beautiful-demo-sidebar>
      <Tree
        label="Docs"
        items={docs}
        icon={(doc) => (doc.children ? <FolderIcon /> : <PageIcon />)}
        defaultSelected="websites"
        defaultExpanded={["components"]}
      />
    </beautiful-demo-sidebar>
  );
}
