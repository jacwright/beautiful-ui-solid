/** One row of docs/components.md. */
export type ComponentRow = {
  name: string;
  status: Status;
  notes: string;
  slug: string;
};

export const statuses = ["listed", "spec approved", "built"] as const;
export type Status = (typeof statuses)[number];

/** A component's page path, without the slash: "Focus ring" is focus-ring. */
export function slugOf(name: string): string {
  return name.toLowerCase().replaceAll(" ", "-");
}

/** Reads every table row in components.md. A row with an unknown status throws, so a typo fails the build. */
export function parseComponents(markdown: string): ComponentRow[] {
  const rows: ComponentRow[] = [];
  let header: string[] | undefined;
  for (const line of markdown.split("\n")) {
    if (!line.startsWith("|")) {
      header = undefined;
      continue;
    }
    const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
    if (!header) {
      header = cells;
      continue;
    }
    if (cells.every((cell) => /^-+$/.test(cell))) continue;
    const name = cells[0] ?? "";
    const status = cells[header.indexOf("Status")];
    if (!statuses.includes(status as Status)) throw new Error(`components.md: ${name} has status "${status}"`);
    rows.push({
      name,
      status: status as Status,
      notes: cells[header.indexOf("Notes")] ?? "",
      slug: slugOf(name),
    });
  }
  return rows;
}
