import type { JSX } from "@solidjs/web";

/** The editor's icons: 20px line drawings in the text's color, as the kit's are. */
const icon = (d: string) => (): JSX.Element => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const icons = {
  undo: icon("M7.5 5L4 8.5 7.5 12M4 8.5h8a4 4 0 0 1 0 8h-2"),
  redo: icon("M12.5 5L16 8.5 12.5 12M16 8.5H8a4 4 0 0 0 0 8h2"),
  cut: icon("M6 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7.5 6.5 16 14M7.5 13.5 16 6"),
  copy: icon(
    "M7 7V4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5v7a1.5 1.5 0 0 1-1.5 1.5H13M3 8.5A1.5 1.5 0 0 1 4.5 7h7A1.5 1.5 0 0 1 13 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 15.5z",
  ),
  paste: icon("M7 4H5.5A1.5 1.5 0 0 0 4 5.5v10A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 14.5 4H13M7.5 3h5v3h-5z"),
  bold: icon("M6 4h4.5a3 3 0 0 1 0 6H6zM6 10h5.5a3 3 0 0 1 0 6H6z"),
  italic: icon("M9 4h6M5 16h6M12 4 8 16"),
  strike: icon("M4 10h12M13.5 6.5C13 5 11.7 4 10 4 8 4 6.5 5 6.5 6.8c0 1.4 1 2.4 3.5 3.2M6.5 13.5C7 15 8.5 16 10.2 16c2 0 3.5-1 3.5-2.8"),
  code: icon("M7 6l-4 4 4 4M13 6l4 4-4 4"),
  highlight: icon("M12.5 3.5l4 4-7 7H5.5v-4zM3 17h14"),
  link: icon("M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.8-.8"),
  text: icon("M4 5h12M10 5v11"),
  heading: icon("M5 4v12M13 4v12M5 10h8"),
  bullets: icon("M8 5h9M8 10h9M8 15h9M4 5h.01M4 10h.01M4 15h.01"),
  numbers: icon("M9 5h8M9 10h8M9 15h8M3.5 4.5l1-.5v3M3.5 9.5h1.5l-1.5 2h1.5M3.5 14h1.5v3h-1.5M3.5 15.5h1.5"),
  quote: icon("M5 5v10M9 6h7M9 10h7M9 14h5"),
  codeBlock: icon("M3 4h14v12H3zM7 8l-2 2 2 2M13 8l2 2-2 2"),
  divider: icon("M3 10h14M6 6h8M6 14h8"),
  image: icon("M4 4h12v12H4zM4 13l4-4 3 3 2-2 3 3M12.5 7.5h.01"),
  video: icon("M3 5h10v10H3zM13 8.5l4-2.5v8l-4-2.5"),
  embed: icon("M4 4h5v5H4zM11 4h5v5h-5zM4 11h5v5H4zM11 11h5v5h-5z"),
  alt: icon("M4 5h12M4 10h12M4 15h7"),
  remove: icon("M4 6h12M8 6V4.5h4V6M5.5 6l.7 9.6a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4L14.5 6"),
  replace: icon("M4 8a6 6 0 0 1 10.5-3.5L16 6M16 3v3h-3M16 12a6 6 0 0 1-10.5 3.5L4 14M4 17v-3h3"),
  width: icon("M3 10h14M6 7l-3 3 3 3M14 7l3 3-3 3"),
  comment: icon("M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 3v-3A1.5 1.5 0 0 1 4 11.5z"),
  turnInto: icon("M4 6h9l-2-2M16 14H7l2 2"),
};
