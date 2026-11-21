import { Editor } from "beautiful-ui-solid-editor";
import { embeds, fakeUpload } from "../../src/pages/editor-live.tsx";

const post = `## Why we roast on Fridays

Coffee is at its best a few days after roasting, once it has let go of most of its gas. Roasting on Friday means your bag lands ==right in that window==.

![A glass tank half full of indigo water, dripping from a small tap near its base.](/illustrations/reservoir.webp "Fresh beans let go of their gas slowly, like water from a tank.")

Every bag carries its roast date. Brew it within *three weeks* for the brightest cup.

> The best coffee I've had at home, and I never have to remember to order it.
`;

// A post, saved as Markdown: select words for the toolbar, type / on an empty line for blocks,
// right-click for the rest. Pictures and clips upload through the app's upload (here, kept in
// the browser), and the sign-up form is an app's own block.
export default function Post() {
  return <Editor preset="post" format="markdown" value={post} upload={fakeUpload} embeds={embeds} aria-label="Post" />;
}
