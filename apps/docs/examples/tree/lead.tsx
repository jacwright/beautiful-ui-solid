import { Tree } from "beautiful-ui-solid";

type Page = { id: string; label: string; children?: Page[] };

const pages: Page[] = [
  { id: "lead-home", label: "Home" },
  {
    id: "lead-about",
    label: "About",
    children: [
      { id: "lead-team", label: "Team" },
      { id: "lead-careers", label: "Careers" },
    ],
  },
  { id: "lead-pricing", label: "Pricing" },
  { id: "lead-contact", label: "Contact" },
];

export default function Lead() {
  return <Tree label="Pages of Spring launch" items={pages} defaultSelected="lead-team" defaultExpanded={["lead-about"]} />;
}
