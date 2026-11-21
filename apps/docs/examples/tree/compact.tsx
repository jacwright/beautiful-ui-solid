import { Tree } from "beautiful-ui-solid";

/** A page icon, hidden from screen readers. */
const PageIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M5 3h7l3 3v11H5z" />
    <path d="M12 3v3h3" />
  </svg>
);

type Page = { id: string; label: string; children?: Page[] };

const pages: Page[] = [
  {
    id: "handbook",
    label: "Handbook",
    children: [
      { id: "logo", label: "Logo files" },
      {
        id: "policies",
        label: "Policies",
        children: [
          { id: "days-off", label: "Availability and days off" },
          { id: "deadlines", label: "Deadlines" },
        ],
      },
      { id: "referrals", label: "Referral program" },
    ],
  },
  { id: "billing", label: "Billing" },
  { id: "requests", label: "Requests" },
];

/** Every page can hold pages, so the chevron takes the icon's place under the pointer. */
export default function Compact() {
  return (
    <beautiful-demo-sidebar>
      <Tree
        label="Handbook pages"
        chevron="icon"
        items={pages}
        icon={() => <PageIcon />}
        defaultExpanded={["handbook"]}
      />
    </beautiful-demo-sidebar>
  );
}
