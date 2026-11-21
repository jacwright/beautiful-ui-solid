import { Example, PropsTable } from "../spec.tsx";

const usage = `
// A line of a page's text: bold, italic, links. Enter doesn't add a line.
<Editor preset="inline" value={page.headline} onChange={save} />

// An email: paragraphs, lists, quotes, links.
<Editor preset="text" format="html" value={email.html} onChange={save} />

// A post: headings, code, images, video and the site's own blocks.
<Editor preset="post" format="markdown" value={post.body} onChange={save}
  upload={(file) => api.upload(file)}
  embeds={{ signup: { label: "Sign-up form", icon: GridIcon, component: SignupForm } }} />

// Your own mix: pick the extensions, add an action, turn a menu off.
<Editor extensions={[...text, image, mention({ search: findPeople })]}
  actions={(defaults) => [...defaults, askAgent]}
  menus={{ toolbar: false }} />
`;

const extension = `
interface Extension {
  name: string;
  nodes?: Record<string, NodeSpec>;       // image, video, embed
  marks?: Record<string, MarkSpec>;       // bold, link, a comment
  actions?: ActionList<EditorContext>;    // every menu and the keys read these
  inputRules?: InputRule[];               // "# " starts a heading
  plugins?: Plugin[];                     // collaboration, the placeholder
  nodeViews?: Record<string, NodeViewFactory>;
  paste?: (slice: Slice) => Slice;        // cleans what is pasted
}

type EditorContext = { state: EditorState; view: EditorView };
`;

export default function EditorPage() {
  return (
    <article>
      <p class="eyebrow">Built</p>
      <h1>Editor</h1>
      <p class="lede">
        Rich text people write in: one line of a page's text, an email, or a whole post with pictures, video and the
        site's own blocks. One component, set up by what it needs to hold, with ProseMirror under it and none of its
        setup left to the app.
      </p>
      <Example title="Editor" hero name="editor/lead" />

      <h2>What it does</h2>
      <ul>
        <li>
          It edits rich text in place, and what you see is what is saved: the same headings, lists, quotes and
          pictures, in the kit's type, as the page or email they end up on.
        </li>
        <li>
          A <strong>preset</strong> sets what it can hold. <code>inline</code> is one line with bold, italic, code
          and links. <code>text</code> adds paragraphs, lists, quotes and strikethrough, for an email or a page's
          section. <code>post</code> adds headings, code blocks, dividers, highlight, images, video and embeds.
        </li>
        <li>
          Each feature is an <strong>extension</strong>, and a preset is a list of them. An app spreads a preset
          and adds or drops one, or brings its own, such as tracked changes and comments. The editor builds the
          schema, keymap and plugins from the list, in a fixed order, so the app never does.
        </li>
        <li>
          Every menu is drawn from one <strong>action list</strong>, Context menu's <code>ActionList</code>. Bold is
          defined once, and it is then a button in the toolbar that shows when it's on, an item in the right-click
          menu with its ⌘B, and the ⌘B key. An app's own action, such as "Ask the agent to rewrite," is added to
          the same list and shows up wherever its group does.
        </li>
        <li>
          Four menus. The <strong>selection toolbar</strong> floats over selected words. The{" "}
          <strong>slash menu</strong> opens on <kbd>/</kbd> at the start of a line and inserts blocks, filtered as
          you type. The <strong>right-click menu</strong> holds undo, redo, cut, copy and paste, then the actions
          for what's under the pointer: on a picture, alt text, replace and remove. A <strong>fixed toolbar</strong>{" "}
          over the text is off unless the page asks for it. Each one can be changed or turned off.
        </li>
        <li>
          Markdown shortcuts work as you type: <code># </code> starts a heading, <code>- </code> a list,{" "}
          <code>&gt; </code> a quote, <code>**words**</code> turns bold. Backspace right after undoes the shortcut.
        </li>
        <li>
          Pictures go through the app's <code>upload</code>. Paste, drop and the slash menu all call it. The
          picture shows from the local file at once, dimmed under a progress bar, so writing doesn't stop. Its alt
          text and caption are edited under it. A picture without alt text is marked, never blocked.
        </li>
        <li>
          Video plays from an uploaded file in a native <code>&lt;video&gt;</code>. A YouTube or Vimeo link pasted
          on a line of its own becomes a player, in a sandboxed <code>&lt;iframe&gt;</code> the editor builds from
          the video's id, never from the pasted URL.
        </li>
        <li>
          An <strong>embed</strong> is an app's own block, such as a sign-up form, a pricing table or a small widget.
          It stores only its type and props, <code>{`{ type: "signup", props: { plan: "pro" } }`}</code>. The
          app's component draws it in the editor and its settings, and the app draws it again wherever the
          text is shown. No HTML is stored.
        </li>
        <li>
          The value is JSON, HTML, Markdown or plain text, as <code>format</code> says. <code>onChange</code> hears it
          when the person pauses and when the editor loses focus, not on every key, so a long post never re-saves
          per keystroke.
        </li>
        <li>
          In a Field it takes the label, description and error, as Input does. Its well is Input's: the same fill,
          edge, shade and hover. A post is written on the page itself, with no well
          (<code>appearance="plain"</code>).
        </li>
        <li>
          With no JS, the same markup reads as a static copy of the text, in the same look, for a preview.
        </li>
      </ul>
      <p>
        An Editor is for text with formatting. Plain text is a Textarea, and one line of it an Input.
      </p>

      <h2>Using it</h2>
      <pre tabindex="0"><code>{usage.trim()}</code></pre>

      <h2>Anatomy</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Part</th>
              <th>Renders</th>
              <th>Job</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>Editor</code></td>
              <td><code>&lt;beautiful-editor data-preset&gt;</code></td>
              <td>The frame: the well, then the toolbar if there is one, then the text.</td>
            </tr>
            <tr>
              <td>Text</td>
              <td><code>&lt;beautiful-editor-content role="textbox" contenteditable&gt;</code></td>
              <td>
                ProseMirror's editable root. <code>aria-multiline</code> unless inline. Named by the Field's label.
                Its blocks are native: <code>&lt;p&gt;</code>, <code>&lt;h2&gt;</code> to <code>&lt;h4&gt;</code>,
                lists, <code>&lt;blockquote&gt;</code>, <code>&lt;pre&gt;</code>, <code>&lt;hr&gt;</code>,{" "}
                <code>&lt;figure&gt;</code>.
              </td>
            </tr>
            <tr>
              <td>Fixed toolbar</td>
              <td><code>&lt;beautiful-editor-toolbar role="toolbar"&gt;</code></td>
              <td>Tertiary Toggle buttons, one tab stop, arrow keys between them. Off by default.</td>
            </tr>
            <tr>
              <td>Selection toolbar</td>
              <td><code>&lt;beautiful-editor-bubble popover="manual" role="toolbar"&gt;</code></td>
              <td>The same buttons on Popover's panel, over the selected words. Focus stays in the text until Alt+F10.</td>
            </tr>
            <tr>
              <td>Slash menu</td>
              <td>Combobox's <code>&lt;beautiful-listbox&gt;</code> on <code>&lt;beautiful-popover&gt;</code></td>
              <td>
                The blocks to insert. Focus stays in the text, which points at the lit option with{" "}
                <code>aria-activedescendant</code>, as Combobox's input does.
              </td>
            </tr>
            <tr>
              <td>Right-click menu</td>
              <td>Context menu's</td>
              <td>The edit actions, then the actions for what was clicked.</td>
            </tr>
            <tr>
              <td>Figure</td>
              <td><code>&lt;figure data-width&gt;</code></td>
              <td>
                A picture or video and its <code>&lt;figcaption&gt;</code>. Width is the text's, <code>wide</code> past
                it, or <code>full</code>.
              </td>
            </tr>
            <tr>
              <td>Embed</td>
              <td><code>&lt;beautiful-editor-embed contenteditable="false" data-type&gt;</code></td>
              <td>The app's component, under a quiet header with the embed's icon and name.</td>
            </tr>
            <tr>
              <td>Link editor</td>
              <td>Popover with an Input</td>
              <td>Opens on ⌘K or the link button, with the address and Remove. In place of the browser's prompt.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: "preset",
            type: '"inline" | "text" | "post"',
            default: '"text"',
            description: "What it can hold. Ignored when extensions is given.",
          },
          {
            name: "extensions",
            type: "Extension[]",
            default: "the preset's",
            description: (
              <>
                The features, in place of a preset. The presets are exported as arrays (<code>inline</code>,{" "}
                <code>text</code>, <code>post</code>) to spread and change.
              </>
            ),
          },
          {
            name: "value",
            type: "string | JSON",
            default: "empty",
            description:
              "The text, in format. A new value replaces the text only when it differs from what the editor last sent, so the page can pass its own state back without moving the cursor.",
          },
          {
            name: "format",
            type: '"json" | "html" | "markdown" | "text"',
            default: '"json"',
            description: (
              <>
                How value is read and written. HTML is read in an inert document and kept only where the schema has a
                place for it. Markdown is in <code>beautiful-ui-solid-editor/markdown</code>, so its parser loads only where
                it's used.
              </>
            ),
          },
          {
            name: "onChange",
            type: "(value) => void",
            description: "The value, when the person pauses typing and when the editor loses focus.",
          },
          {
            name: "placeholder",
            type: "string",
            description: "Shown on the empty first line. In post, every empty line says \"Press / for blocks\".",
          },
          {
            name: "actions",
            type: "(defaults: ActionList) => ActionList",
            default: "the extensions'",
            description: "Changes the one list every menu and key reads: add an app's actions, drop some, reorder.",
          },
          {
            name: "menus",
            type: "{ bubble?, slash?, context?, toolbar? }",
            default: "all but toolbar",
            description: (
              <>
                Each is <code>true</code>, <code>false</code>, or a function from the actions to the ones that menu
                shows.
              </>
            ),
          },
          {
            name: "upload",
            type: "(file: File, progress) => Promise<{ src, width?, height? }>",
            description: "Stores a picture or video and says where it is. Without it, pictures are added by URL only.",
          },
          {
            name: "embeds",
            type: "Record<string, { label, icon, component, settings? }>",
            description: "The app's own blocks, by type. Each shows in the slash menu by its label.",
          },
          {
            name: "appearance",
            type: '"well" | "plain"',
            default: '"well", "plain" for post',
            description: "In Input's well, or on the page with no frame.",
          },
          {
            name: "readOnly",
            type: "boolean",
            default: "false",
            description: "Shows the text, selectable, with no menus but copy.",
          },
          {
            name: "ref",
            type: "(editor: EditorHandle) => void",
            description: (
              <>
                The handle: <code>view</code>, a reactive <code>state</code>, <code>value()</code>,{" "}
                <code>run(actionId)</code> and <code>focus()</code>, for an app that needs ProseMirror itself.
              </>
            ),
          },
        ]}
      />

      <h2>Extensions</h2>
      <p>
        An extension is one plain object that brings everything a feature needs. The built-in ones are{" "}
        <code>bold</code>, <code>italic</code>, <code>strike</code>, <code>code</code>, <code>highlight</code>,{" "}
        <code>link</code>, <code>lists</code>, <code>heading</code>, <code>quote</code>, <code>codeBlock</code>,{" "}
        <code>divider</code>, <code>image</code>, <code>video</code>, <code>embed</code>, <code>placeholder</code>{" "}
        and <code>history</code>.
      </p>
      <pre tabindex="0"><code>{extension.trim()}</code></pre>
      <p>
        An app that already has a ProseMirror <code>Schema</code> passes it with its extensions, so that a
        server reading collaboration steps uses the same schema.
      </p>

      <h2>Keyboard and screen readers</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Does</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><kbd>⌘B</kbd> <kbd>⌘I</kbd> <kbd>⌘E</kbd> <kbd>⇧⌘X</kbd></td><td>Bold, italic, code, strikethrough.</td></tr>
            <tr><td><kbd>⌘K</kbd></td><td>Opens the link editor on the selection or the link the cursor is in.</td></tr>
            <tr><td><kbd>⌘Z</kbd> <kbd>⇧⌘Z</kbd></td><td>Undo and redo.</td></tr>
            <tr><td><kbd>⌥⌘1</kbd> to <kbd>⌥⌘3</kbd>, <kbd>⌥⌘0</kbd></td><td>Heading 2 to 4, and back to text (post).</td></tr>
            <tr><td><kbd>⇧⌘8</kbd> <kbd>⇧⌘7</kbd></td><td>Bulleted and numbered list.</td></tr>
            <tr><td><kbd>Tab</kbd> <kbd>⇧Tab</kbd></td><td>In a list, indent and outdent. Elsewhere, Tab leaves the editor, as it does any field.</td></tr>
            <tr><td><kbd>Enter</kbd> <kbd>⇧Enter</kbd></td><td>A new paragraph, and a line break in the same one. In inline, Enter does nothing.</td></tr>
            <tr><td><kbd>/</kbd></td><td>At the start of an empty line, opens the slash menu. <kbd>↑</kbd> <kbd>↓</kbd> move, <kbd>Enter</kbd> inserts, <kbd>Esc</kbd> leaves the slash as typed.</td></tr>
            <tr><td><kbd>⌥F10</kbd></td><td>Moves focus into the selection toolbar. <kbd>←</kbd> <kbd>→</kbd> move, <kbd>Esc</kbd> goes back to the text.</td></tr>
            <tr><td><kbd>⇧F10</kbd>, the Menu key</td><td>Opens the right-click menu at the cursor.</td></tr>
            <tr><td><kbd>⌥↑</kbd> <kbd>⌥↓</kbd></td><td>Moves the block the cursor is in, or the selected picture or embed, up or down.</td></tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        ⌘ is Ctrl on Windows and Linux. A screen reader hears a text box with its label, and the toolbar buttons as
        pressed or not. The slash menu's options are read as the arrow keys move, with focus still in the text.
      </p>

      <h2>States</h2>
      <ul>
        <li><strong>Empty:</strong> the placeholder on the first line, drawn by CSS, so it is never part of the value.</li>
        <li><strong>Focused:</strong> the kit's focus ring around the well. A plain post shows only the caret.</li>
        <li><strong>Selected block:</strong> a picture, video or embed takes the accent ring, a step out.</li>
        <li><strong>Uploading:</strong> the local picture, dimmed, under a progress bar. A failed upload says so on the picture, with Retry and Remove.</li>
        <li><strong>Invalid:</strong> in a Field with an error, the well's edge turns red, as Input's does.</li>
        <li><strong>Read only and disabled:</strong> no menus but copy, the well muted when disabled.</li>
      </ul>

      <h2>Security</h2>
      <ul>
        <li>
          The HTML format is the one place the kit reads a string as markup. It parses in an{" "}
          inert document, the browser's own parser, where no script runs and no picture loads, and the schema keeps only the
          elements and attributes it has a place for. A link keeps <code>http</code>, <code>https</code> and{" "}
          <code>mailto</code> only. Its tests feed it script tags, event attributes and <code>javascript:</code>{" "}
          links.
        </li>
        <li>
          Pasted HTML takes the same path. Embeds store data, not markup, and video players are built from an id.
        </li>
        <li>The editor makes no requests of its own. Uploads go through the app's <code>upload</code>.</li>
      </ul>

      <h2>References</h2>
      <p>
        No reference kit has an editor. The behavior follows APG's Toolbar and Combobox patterns and ProseMirror's
        own examples.
      </p>

      <h2>Other examples</h2>
      <p>Each one is the editor itself: select words, type / on an empty line, or right-click.</p>
      <Example title="A line of a page's text" name="editor/page-text" />
      <Example title="An email, with the fixed toolbar" name="editor/email" />
      <Example title="A post" name="editor/post" />
    </article>
  );
}
