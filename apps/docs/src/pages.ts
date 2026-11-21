/**
 * The components that have a page. App.tsx maps each name to its page. One name a line, so threads
 * adding pages at once don't conflict over a single line.
 */
export const pageNames = [
  "Button",
  "Button group",
  "Text",
  "Heading",
  "Link",
  "Divider",
  "Avatar",
  "Callout",
  "Dialog",
  "Alert",
  "Fieldset",
  "Popover",
  "Dropdown",
  "Context menu",
  "Shortcuts",
  "Shortcut sheet",
  "Command palette",
  "Tooltip",
  "Focus ring",
  "Input",
  "Radio",
  "Navbar",
  "Range",
  "Select",
  "Textarea",
  "Icon button",
  "Listbox",
  "Combobox",
  "Tag field",
  "Toast",
  "Spinner",
  "Card",
  "List",
  "Badge",
  "Disclosure",
  "Accordion",
  "Description list",
  "Table",
  "Skeleton",
  "Sidebar",
  "Tabs",
  "Pagination",
  "Checkbox",
  "Progress",
  "Meter",
  "Chip",
  "Toggle button",
  "Toggle group",
  "Switch",
  "Auth layout",
  "Drawer",
  "Stacked layout",
  "Sidebar layout",
  "Editor",
  "Tree",
] as const;
export type PageName = (typeof pageNames)[number];

export const isPageName = (name: string): name is PageName => (pageNames as readonly string[]).includes(name);

/**
 * The guides: pages that aren't one component, such as how a website is laid out. They have no row
 * in components.md. App.tsx maps each name to its page, after the components in the navigation.
 */
export const guideNames = ["Websites", "Illustrations", "Shadows"] as const;
export type GuideName = (typeof guideNames)[number];

/**
 * The sidebar's sections: every page and guide under one heading, by what it's for. A section's
 * pages are listed in name order. nav.test.ts fails on a page or guide left out, or named twice.
 */
export const pageGroups: { heading: string; pages: (PageName | GuideName)[] }[] = [
  { heading: "Foundations", pages: ["Focus ring", "Shadows"] },
  { heading: "Actions", pages: ["Button", "Button group", "Command palette", "Context menu", "Dropdown", "Icon button", "Link", "Shortcut sheet", "Shortcuts", "Toggle button", "Toggle group"] },
  {
    heading: "Forms",
    pages: ["Checkbox", "Combobox", "Editor", "Fieldset", "Input", "Listbox", "Radio", "Range", "Select", "Switch", "Tag field", "Textarea"],
  },
  { heading: "Text", pages: ["Description list", "Heading", "List", "Text"] },
  { heading: "Data display", pages: ["Avatar", "Badge", "Card", "Chip", "Table"] },
  { heading: "Feedback", pages: ["Callout", "Meter", "Progress", "Skeleton", "Spinner", "Toast"] },
  { heading: "Overlays", pages: ["Alert", "Dialog", "Drawer", "Popover", "Tooltip"] },
  { heading: "Navigation", pages: ["Navbar", "Pagination", "Sidebar", "Tabs", "Tree"] },
  { heading: "Layout", pages: ["Accordion", "Auth layout", "Disclosure", "Divider", "Sidebar layout", "Stacked layout"] },
  { heading: "Guides", pages: ["Illustrations", "Websites"] },
];
