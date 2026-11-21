import { DOMParser as SchemaParser, DOMSerializer, type Node, type Schema } from "prosemirror-model";
import { Transform } from "prosemirror-transform";

/**
 * The editor's value at its edges: ProseMirror's JSON, HTML, Markdown or plain text, as the
 * app stores it. Markdown is in ./markdown.ts, so its parser loads only where it's used.
 */

export type Format = "json" | "html" | "markdown" | "text";

/** A format's reader and writer. Markdown's comes from beautiful-ui-solid-editor/markdown. */
export type Codec = { parse: (value: string, schema: Schema) => Node; serialize: (doc: Node) => string };

/** The empty document. */
export function emptyDoc(schema: Schema): Node {
  return schema.topNodeType.createAndFill()!;
}

export function fromJSON(value: unknown, schema: Schema): Node {
  if (!value || typeof value !== "object") return emptyDoc(schema);
  try {
    const doc = schema.nodeFromJSON(value);
    doc.check();
    return doc;
  } catch {
    return emptyDoc(schema);
  }
}

/**
 * HTML read in an inert document, where no script runs and no picture loads, then through the
 * schema, which keeps only the elements and attributes it has a place for: anything else is
 * dropped, and a link or picture keeps only an address safeHref or safeSrc accepts. This is the
 * one place the kit reads a string as markup (CLAUDE.md, Security).
 */
export function fromHTML(html: string, schema: Schema): Node {
  const inert = new globalThis.DOMParser().parseFromString(html, "text/html");
  return SchemaParser.fromSchema(schema).parse(inert.body);
}

const escapeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (text: string) => escapeText(text).replace(/"/g, "&quot;");
const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/** Writes DOM nodes out as HTML, escaping every text and attribute: no parser or sink needed. */
function writeHTML(node: globalThis.Node): string {
  if (node.nodeType === 3) return escapeText(node.textContent ?? "");
  if (node.nodeType === 11) return [...node.childNodes].map(writeHTML).join("");
  if (node.nodeType !== 1) return "";
  const el = node as Element;
  const tag = el.localName;
  const attrs = [...el.attributes].map((a) => (a.value === "" ? ` ${a.name}` : ` ${a.name}="${escapeAttr(a.value)}"`)).join("");
  if (voidTags.has(tag)) return `<${tag}${attrs}>`;
  return `<${tag}${attrs}>${[...el.childNodes].map(writeHTML).join("")}</${tag}>`;
}

export function toHTML(doc: Node): string {
  const document = globalThis.document.implementation.createHTMLDocument("");
  const fragment = DOMSerializer.fromSchema(doc.type.schema).serializeFragment(doc.content, { document });
  return writeHTML(fragment);
}

/** Plain text: a blank line between blocks, and a line break where the text had one. */
export function toText(doc: Node): string {
  return doc.textBetween(0, doc.content.size, "\n\n", (leaf) => (leaf.type.name === "hard_break" ? "\n" : ""));
}

export function fromText(text: string, schema: Schema): Node {
  const { paragraph, hard_break: br } = schema.nodes;
  if (schema.topNodeType.inlineContent || !paragraph) {
    const line = text.replace(/\s*\n\s*/g, " ");
    return schema.topNodeType.create(null, line ? schema.text(line) : undefined);
  }
  const blocks = text.split(/\n{2,}/).map((block) => {
    const lines = block.split("\n");
    const content = lines.flatMap((line, i) => [...(i && br ? [br.create()] : []), ...(line ? [schema.text(line)] : [])]);
    return paragraph.create(null, content);
  });
  return schema.topNodeType.create(null, blocks.length ? blocks : [paragraph.create()]);
}

/** Reads a value in a format. */
export function parse(value: unknown, format: Format, schema: Schema, markdown?: Codec): Node {
  if (format === "json") return fromJSON(value, schema);
  const text = typeof value === "string" ? value : "";
  if (!text) return emptyDoc(schema);
  if (format === "html") return fromHTML(text, schema);
  if (format === "markdown") {
    if (!markdown) throw new Error('format="markdown" needs markdown={markdown} from "beautiful-ui-solid-editor/markdown".');
    return markdown.parse(text, schema);
  }
  return fromText(text, schema);
}

/**
 * The document without the pictures and videos still uploading: their address is a file on this
 * device, which is gone after a reload. They join the value when their upload lands.
 */
export function withoutUploads(doc: Node): Node {
  const uploading: { from: number; to: number }[] = [];
  doc.descendants((node, pos) => {
    if (node.attrs.upload) uploading.push({ from: pos, to: pos + node.nodeSize });
    return !node.attrs.upload;
  });
  if (!uploading.length) return doc;
  const tr = new Transform(doc);
  for (const { from, to } of uploading.reverse()) tr.delete(from, to);
  return tr.doc;
}

/** Writes the document in a format, leaving out what is still uploading. */
export function serialize(value: Node, format: Format, markdown?: Codec): unknown {
  const doc = withoutUploads(value);
  if (format === "json") return doc.toJSON();
  if (format === "html") return toHTML(doc);
  if (format === "markdown") {
    if (!markdown) throw new Error('format="markdown" needs markdown={markdown} from "beautiful-ui-solid-editor/markdown".');
    return markdown.serialize(doc);
  }
  return toText(doc);
}
