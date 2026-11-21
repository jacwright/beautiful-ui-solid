import "beautiful-ui-solid/styles.css";
import "./harness.css";
import { wireTabs, wireToggleGroup } from "beautiful-ui-solid";

for (const tabs of document.querySelectorAll<HTMLElement>("beautiful-tabs")) wireTabs(tabs);
for (const group of document.querySelectorAll<HTMLElement>("beautiful-toggle-group")) wireToggleGroup(group);
document.body.dataset.wired = "";
