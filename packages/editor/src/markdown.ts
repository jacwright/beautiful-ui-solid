import MarkdownIt from "markdown-it";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";
import { defaultMarkdownSerializer, MarkdownParser, MarkdownSerializer, type MarkdownSerializerState } from "prosemirror-markdown";
import type { Node, Schema } from "prosemirror-model";
import { fromHTML, toHTML, type Codec } from "./format.ts";

/**
 * Markdown for the editor's schema: CommonMark with strikethrough (~~) and highlight (==). A
 * picture on a line of its own is a figure, its title the caption. Videos and an app's blocks
 * have no Markdown, so they are kept as HTML blocks, read back through the schema as the HTML
 * format is. Any other HTML in the Markdown stays as its text, in a paragraph, never as markup.
 *
 * Import it from "beautiful-ui-solid-editor/markdown". The editor loads it itself for format="markdown".
 */

/** ==highlight==, as markdown-it has no rule for it. */
function highlightRule(state: StateInline, silent: boolean): boolean {
  const start = state.pos;
  const src = state.src;
  if (src.charCodeAt(start) !== 0x3d || src.charCodeAt(start + 1) !== 0x3d) return false;
  const end = src.indexOf("==", start + 2);
  // The closing == must be inside the text being read: a link's words end at their bracket.
  if (end < 0 || end === start + 2 || end + 2 > state.posMax) return false;
  const inner = src.slice(start + 2, end);
  if (/^\s|\s$/.test(inner)) return false;
  if (silent) return true;
  const max = state.posMax;
  state.push("mark_open", "mark", 1);
  state.pos = start + 2;
  state.posMax = end;
  state.md.inline.tokenize(state);
  state.push("mark_close", "mark", -1);
  state.pos = end + 2;
  state.posMax = max;
  return true;
}

function tokenizer() {
  const md = MarkdownIt("default", { html: true, linkify: false }).disable(["table"]);
  md.inline.ruler.before("emphasis", "mark", highlightRule);
  // A paragraph holding only a picture is a figure; a picture inside text keeps its alt as text.
  md.core.ruler.push("figures", (state) => {
    const out: Token[] = [];
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!;
      const inline = tokens[i + 1];
      const close = tokens[i + 2];
      const only = inline?.children?.filter((c) => !(c.type === "text" && !c.content.trim()) && c.type !== "softbreak");
      if (token.type === "paragraph_open" && inline?.type === "inline" && close?.type === "paragraph_close" && only?.length === 1 && only[0]!.type === "image") {
        const image = only[0]!;
        const open = new state.Token("figure_open", "figure", 1);
        open.attrs = [
          ["src", image.attrGet("src") ?? ""],
          ["alt", image.children?.map((c) => c.content).join("") ?? ""],
        ];
        const caption = new state.Token("inline", "", 0);
        const text = new state.Token("text", "", 0);
        text.content = image.attrGet("title") ?? "";
        caption.children = text.content ? [text] : [];
        caption.content = text.content;
        out.push(open, caption, new state.Token("figure_close", "figure", -1));
        i += 2;
        continue;
      }
      if (token.type === "inline" && token.children) {
        token.children = token.children.map((child) => {
          if (child.type === "image") {
            const text = new state.Token("text", "", 0);
            text.content = child.children?.map((c) => c.content).join("") ?? "";
            return text;
          }
          if (child.type === "html_inline") {
            const text = new state.Token("text", "", 0);
            text.content = child.content;
            return text;
          }
          return child;
        });
      }
      out.push(token);
    }
    state.tokens = out;
  });
  return md;
}

function listIsTight(tokens: Token[], i: number) {
  while (++i < tokens.length) if (tokens[i]!.type !== "list_item_open") return tokens[i]!.hidden;
  return false;
}

const parsers = new WeakMap<Schema, MarkdownParser>();

function parserFor(schema: Schema) {
  const existing = parsers.get(schema);
  if (existing) return existing;
  const has = (name: string) => !!schema.nodes[name] || !!schema.marks[name];
  const specs: Record<string, ConstructorParameters<typeof MarkdownParser>[2][string]> = {
    paragraph: { block: "paragraph" },
    blockquote: { block: "blockquote" },
    list_item: { block: "list_item" },
    bullet_list: { block: "bullet_list", getAttrs: (_t, tokens, i) => ({ tight: listIsTight(tokens, i) }) },
    ordered_list: {
      block: "ordered_list",
      getAttrs: (tok, tokens, i) => ({ order: Number(tok.attrGet("start")) || 1, tight: listIsTight(tokens, i) }),
    },
    heading: { block: "heading", getAttrs: (tok) => ({ level: Math.min(Math.max(Number(tok.tag.slice(1)), 2), 4) }) },
    code_block: { block: "code_block", noCloseToken: true },
    fence: { block: "code_block", getAttrs: (tok) => ({ params: tok.info || "" }), noCloseToken: true },
    hr: { node: "horizontal_rule" },
    figure: { block: "image", getAttrs: (tok) => ({ src: tok.attrGet("src"), alt: tok.attrGet("alt") ?? "" }) },
    hardbreak: { node: "hard_break" },
    em: { mark: "em" },
    strong: { mark: "strong" },
    s: { mark: "strike" },
    mark: { mark: "highlight" },
    link: { mark: "link", getAttrs: (tok) => ({ href: tok.attrGet("href"), title: tok.attrGet("title") || null }) },
    code_inline: { mark: "code", noCloseToken: true },
    html_block: { ignore: true, noCloseToken: true },
  };
  // What the schema can't hold reads as what it can, never as an error: a block it lacks becomes
  // a paragraph of its text (or just its text, in one line), a list or quote just its contents,
  // and a mark or a divider it lacks is left out. prosemirror-markdown throws on a token with no spec.
  const flat = new Set(["blockquote", "bullet_list", "ordered_list", "list_item"]);
  for (const [token, spec] of Object.entries(specs)) {
    const name = "block" in spec ? spec.block : "node" in spec ? spec.node : "mark" in spec ? spec.mark : undefined;
    if (!name || has(name)) continue;
    const closes = "noCloseToken" in spec && spec.noCloseToken;
    if ("block" in spec && !flat.has(token) && has("paragraph")) specs[token] = { block: "paragraph", noCloseToken: closes };
    else specs[token] = { ignore: true, noCloseToken: closes || "node" in spec };
  }
  const parser = new MarkdownParser(schema, tokenizer(), specs);
  parsers.set(schema, parser);
  return parser;
}

/**
 * HTML blocks: a video or an app's block, read through the schema as the HTML format does.
 * Any other HTML stays as its own text, in a paragraph, where it can be seen and fixed.
 */
function withHTMLBlocks(markdown: string, schema: Schema): Node {
  const md = tokenizer();
  const tokens = md.parse(markdown, {});
  const parser = parserFor(schema);
  const blocks: Node[] = [];
  const lines = markdown.split("\n");
  let from = 0;
  const flush = (to: number) => {
    const text = lines.slice(from, to).join("\n");
    if (text.trim()) blocks.push(...parser.parse(text).content.content);
  };
  for (const token of tokens) {
    if (token.type !== "html_block" || token.level !== 0 || !token.map) continue;
    flush(token.map[0]);
    from = token.map[1];
    const parsed = fromHTML(token.content, schema).content.content.filter((n) => n.type.name === "video" || n.type.name === "embed");
    if (parsed.length) blocks.push(...parsed);
    else if (schema.nodes.paragraph) blocks.push(schema.nodes.paragraph.create(null, schema.text(token.content.trim())));
  }
  flush(lines.length);
  return schema.topNodeType.create(null, blocks.length ? blocks : undefined);
}

/**
 * A block as HTML. Its opening tag ends its first line: CommonMark reads a line that starts with
 * a tag of any name as the start of an HTML block only when nothing follows the tag, so an
 * app's <beautiful-editor-embed> closes on the next line.
 */
function htmlBlock(state: MarkdownSerializerState, node: Node) {
  const html = toHTML(node.type.schema.topNodeType.create(null, node));
  state.write(html.replace(/^(<[a-z][a-z0-9-]*(?:\s[^>]*)?>)(?=<\/)/, "$1\n"));
  state.closeBlock(node);
}

const serializers = new WeakMap<Schema, MarkdownSerializer>();

function serializerFor(schema: Schema) {
  const existing = serializers.get(schema);
  if (existing) return existing;
  const nodes = defaultMarkdownSerializer.nodes;
  const serializer = new MarkdownSerializer(
    {
      ...nodes,
      image(state, node) {
        const alt = state.esc(node.attrs.alt || "");
        const src = String(node.attrs.src).replace(/[()]/g, "\\$&");
        const caption = node.textContent ? ` "${node.textContent.replace(/"/g, '\\"')}"` : "";
        state.write(`![${alt}](${src}${caption})`);
        state.closeBlock(node);
      },
      video: htmlBlock,
      embed: htmlBlock,
    },
    {
      ...defaultMarkdownSerializer.marks,
      strike: { open: "~~", close: "~~", mixable: true, expelEnclosingWhitespace: true },
      highlight: { open: "==", close: "==", mixable: true, expelEnclosingWhitespace: true },
    },
  );
  serializers.set(schema, serializer);
  return serializer;
}

export function parseMarkdown(markdown: string, schema: Schema): Node {
  return withHTMLBlocks(markdown, schema);
}

export function serializeMarkdown(doc: Node): string {
  return serializerFor(doc.type.schema).serialize(doc);
}

/** The codec the editor uses for format="markdown". */
export const markdown: Codec = { parse: parseMarkdown, serialize: serializeMarkdown };
