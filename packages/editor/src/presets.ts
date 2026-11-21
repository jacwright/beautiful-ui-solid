import { clipboard, history, paragraphs, singleLine } from "./extensions/base.ts";
import { codeBlock, divider, heading, lists, quote, text as textBlock } from "./extensions/blocks.ts";
import { bold, code, highlight, italic, link, strike } from "./extensions/marks.ts";
import { embed, image, video } from "./extensions/media.ts";
import type { Extension } from "./types.ts";

/**
 * The presets: lists of extensions, exported to spread and change. Their order is the order
 * the menus show their actions in.
 */

/** One line: a page's headline, a button's words. Bold, italic, code and links. */
export const inline: Extension[] = [singleLine, history, clipboard, bold, italic, code, link];

/** An email, a page's section: paragraphs, lists, quotes, links and strikethrough. */
export const text: Extension[] = [paragraphs, history, clipboard, bold, italic, strike, code, link, textBlock, lists, quote];

/** A post: headings, code, dividers, highlight, pictures, video and an app's blocks. */
export const post: Extension[] = [
  paragraphs,
  history,
  clipboard,
  bold,
  italic,
  strike,
  code,
  highlight,
  link,
  textBlock,
  heading,
  lists,
  quote,
  codeBlock,
  divider,
  image,
  video,
  embed,
];

export const presets = { inline, text, post };
export type Preset = keyof typeof presets;
