import { For } from "solid-js";
import { Prompt } from "../spec.tsx";

/**
 * The palette. Indigo is the main wash: it colors the point of each picture. Marigold is the
 * highlight, used only where a prompt names it. Both are apart from the UI's cobalt, which means
 * "you can press this", so a wash of color in a picture never looks clickable. They are the same
 * two colors the website uses for its own highlights (--color-indigo, --color-marigold).
 */
export const indigo = { name: "Indigo", hex: "#4B439C" };
export const marigold = { name: "Marigold", hex: "#F2B33D" };
/** The near-black of every line. */
export const ink = { name: "Ink", hex: "#1C1C24" };
/** The paper ChatGPT paints, which --color-paper matches so a picture's edges melt into its card. */
const paper = "#FCF5EC";
const indigoWord = indigo.name.toLowerCase();
const marigoldWord = marigold.name.toLowerCase();

/** Paste this first in a new ChatGPT chat. Every image request after it says "Same style." */
const basePrompt = `I'm going to ask you for a series of illustrations for a website and its blog. Use exactly this style for every image, and keep it consistent across the whole series:

Loose ink-and-watercolor illustration. Confident, slightly imperfect near-black ink outlines, like a fountain-pen sketch. Soft, translucent watercolor washes that bleed a little past the lines, in a restrained palette: warm paper white, a mid-gray wash, and two accent colors. Deep indigo ${indigo.hex} is the main wash, for the one or two things each image is about. Marigold yellow ${marigold.hex} is the highlight, for one small thing that should catch the eye, and only where a request names it. Everything else stays ink and gray.

Plenty of empty space around the subject. Keep the subject in the middle of the frame and leave the top and bottom edges empty, so the image can be cropped wider. Plain warm off-white paper background, ${paper}, edge to edge: no frame, no border, no vignette, no texture overlay, no drop shadow.

Clean, readable silhouettes that still read when the image is small on a phone. Friendly and calm, not cartoony, not childish, and not corporate clip art. People are small, simple figures with no facial features. No logos, brand names, real products, or real people.

Text: add only the words a request gives in quotes, exactly as written, where it says, hand-lettered in the same ink. Add no other text anywhere: no titles, captions, labels, signatures, numbers, or scribbles that look like writing, and nothing written on screens, papers, signs, or objects unless the request gives those words. When a request says "No text," the image has none at all.

Confirm you understand, then wait for the first image request.`;

const imageTemplate = `Image <n>, <3:2 landscape | square>. Same style.
The idea: <the one thing a reader should take from it, in a sentence>.
<The scene, in two to four sentences of concrete, physical things: what the subject is, what it's doing, and where it sits in the frame.>
The ${indigoWord} wash goes on <the one or two things the idea is about>; everything else stays ink and gray.
<Only when one small thing should catch the eye> The ${marigoldWord} highlight goes on <that one thing> only.
<Either> No text.
<Or> Text, exactly as given and nothing else: "<words>" on <where>; "<words>" on <where>.`;

type Worked = { title: string; idea: string; why: string; prompt: string };

const examples: Worked[] = [
  {
    title: "Contrast: struggle and ease",
    idea: "Doing it by hand is uphill. Handing it to your agent is downhill.",
    why: "Two halves of one frame, the same objects in both, so the only difference is the point.",
    prompt: `Image 1, 3:2 landscape. Same style.
The idea: doing the work by hand is a struggle; letting your own agent do it is easy.
A single low hill in profile across the middle of the frame. On the left slope, a small figure leans hard into a large boulder, pushing it uphill, strain visible in the posture. On the right slope, the same kind of boulder rolls freely downhill on its own while a relaxed small figure walks beside it with hands in pockets. The two halves should read instantly as "struggle" and "ease."
The ${indigoWord} wash goes on the boulders; everything else stays ink and gray.
No text.`,
  },
  {
    title: "Feeling: software that leaves you guessing",
    idea: "A screen full of buttons doesn't tell you what to do.",
    why: "A generic window, never a real app, and the feeling drawn as objects coming out of it.",
    prompt: `Image 2, 3:2 landscape. Same style.
The idea: software built for clicking leaves people guessing.
A simplified, generic software window drawn in ink: a rectangle with a title bar, a sidebar, a few empty content blocks and buttons, deliberately vague so it isn't any real app. Floating above and around the window are a dozen question marks of varying sizes, drawn in loose ink, drifting upward like they're rising out of the screen. No readable text on the window; just abstract shapes and lines where text would be.
The ${indigoWord} wash goes on the question marks; the window stays gray and neutral.
No text: the question marks are the only marks that look like writing.`,
  },
  {
    title: "One object: a limit running down",
    idea: "A plan's allowance is a tank, and use drains it.",
    why: "One iconic object, centered, with the amount shown by how full it is rather than by a number.",
    prompt: `Image 3, square. Same style.
The idea: what's left of an allowance, running down as it's used.
A simple cylindrical glass tank, like a laboratory reservoir or a water tower tank, seen straight on. It is filled to about halfway with water; the upper half is empty. A small tap near the bottom drips a few drops. Keep it clean and iconic: one tank, centered, lots of empty space. No gauge markings.
The ${indigoWord} wash goes on the water and the drops; everything else stays ink and gray.
No text.`,
  },
  {
    title: "Inside and outside: your context",
    idea: "An outside agent sees a slice of your business. Your own agent sees all of it.",
    why: "A wall with a keyhole makes \"limited view\" physical, and the same desk on both sides keeps the comparison fair.",
    prompt: `Image 4, 3:2 landscape. Same style.
The idea: an agent inside another company's product sees only a slice of your business; your own agent sees all of it.
A plain wall runs down the middle of the frame. On the left, outside the wall, a small figure bends to peer through a single keyhole. On the right, inside, a small figure sits at a wide desk covered with neat stacks of papers, folders, a ledger and a calendar, all within easy reach.
The ${indigoWord} wash goes on the papers and folders on the desk; everything else stays ink and gray.
No text.`,
  },
  {
    title: "A metaphor: one toolbox",
    idea: "Every service your business runs on, in one place your agent can reach.",
    why: "A spot illustration: one object, no figures, readable at 96px beside a feature's words.",
    prompt: `Image 5, square. Same style.
The idea: one toolbox holds everything the business runs on.
A single open wooden toolbox, seen from slightly above, with a few tools neatly inside: a hammer, a wrench, a ruler, a paintbrush. Nothing else in the frame. Draw it large enough to fill the middle third, with simple, bold shapes that still read when the image is shown very small.
The ${indigoWord} wash goes on the toolbox itself; the tools stay ink and gray.
No text.`,
  },
  {
    title: "Words in the picture: a setup checklist",
    idea: "Your agent does the setup steps that usually fall to you.",
    why: "Text is allowed because the words are the point: three one-word labels, in quotes, lettered by hand.",
    prompt: `Image 6, 3:2 landscape. Same style.
The idea: your agent works through the setup steps that usually fall to a person.
A clipboard held up by a small figure's hand coming in from the right edge of the frame. On the clipboard, three short lines, each with a large hand-drawn check mark beside it.
The ${indigoWord} wash goes on the three check marks; everything else stays ink and gray.
Text, exactly as given and nothing else: "Domain" on the first line, "Email" on the second, "Billing" on the third.`,
  },
  {
    title: "Words that explain: a flow chart",
    idea: "A change goes from draft to preview to live, and the agent can carry it the whole way.",
    why: "A flow chart needs its words: every box and the one arrow that matters is named, and nothing else is.",
    prompt: `Image 7, 3:2 landscape. Same style.
The idea: a change goes from draft to preview to live, and your agent can carry it the whole way.
A simple hand-drawn flow chart across the middle of the frame: three rounded boxes in a row, joined left to right by loose ink arrows. A small figure walks along the arrows carrying a single sheet of paper, partway between the second box and the third.
The ${indigoWord} wash goes on the third box; the other two stay gray.
Text, exactly as given and nothing else: "Draft" in the first box; "Preview" in the second box; "Live" in the third box; "publish" in small letters above the arrow into the third box.`,
  },
  {
    title: "The second accent: the clear pick",
    idea: "Of several options, one is the right one for you.",
    why: "Marigold goes on one small thing, so the eye lands on the winner without the picture getting louder.",
    prompt: `Image 8, 3:2 landscape. Same style.
The idea: of several options, one is the clear pick.
Three simple glass jars standing side by side on a plain shelf, each a different size and each partly filled. The middle jar has a small rosette ribbon tied around its neck, like a prize at a county fair.
The ${indigoWord} wash goes on what's inside the jars; everything else stays ink and gray.
The marigold highlight goes on the rosette ribbon only.
No text.`,
  },
];

const metaphors: [string, string][] = [
  ["Side by side", "Before and after, or the hard way and our way, in two halves of one frame with the same objects in each."],
  ["One object", "A single thing that stands for the system: a tank for an allowance, a toolbox for a suite of tools, a bridge for an integration."],
  ["Scale and weight", "Balance scales, a heavy load and a light one, many small things against one large one."],
  ["A path", "A road, stairs, or a river: where someone is, and where they're going."],
  ["Inside and outside", "A wall, a window, a fence: who can see what, and who is kept out."],
  ["Many into one", "A tangle of cords into one plug, scattered papers into one folder."],
  ["Who does the work", "A person steering while a helper does the rowing: the person drives, the agent does it."],
];

const checks = [
  "It matches the series: ink lines, washes that bleed, the paper, the empty space. If it drifts, ask again rather than fixing it.",
  "Its color is on the thing the idea is about, and marigold appears only if the prompt asked for it.",
  "It has the words the prompt gave, spelled as given, and no others: no stray labels, numbers, or scribbles that read as writing.",
  "Hands, figures and objects are whole: no extra fingers, no melted shapes.",
  "Nothing looks like a real product, logo or person.",
  "The top and bottom are empty enough to crop it to a 1.91:1 link preview.",
  "It still reads at 360px wide, the size of a phone's column.",
];

export default function IllustrationsPage() {
  return (
    <article>
      <p class="eyebrow">Guide</p>
      <h1>Illustrations</h1>
      <p class="lede">
        Pictures for a website and its blog: loose ink and watercolor, indigo and marigold, and a lot of paper. Claude
        writes the prompts, and ChatGPT's image model paints them.
      </p>

      <h2>What they're for</h2>
      <ul>
        <li>
          To explain, emphasize or simplify one idea, so a reader gets it at a glance: a contrast, a feeling, a
          limit, who does the work. Never decoration.
        </li>
        <li>
          One house style for every site, so a picture on one blog and one on another look like the same hand drew
          them.
        </li>
        <li>
          Calm and a little human, beside the kit's crisp UI. The loose line says a person thought about it; the
          restraint says it's serious.
        </li>
      </ul>

      <h2>The style</h2>
      <p>
        Near-black ink outlines, slightly imperfect, like a fountain-pen sketch. Translucent watercolor washes that
        bleed past the lines. Plain warm paper, no frame. Small, featureless people. Friendly and calm, not cartoony.
      </p>
      <ul class="swatches">
        <For
          each={[
            { ...ink, note: "every line" },
            { name: "Gray wash", hex: "#9A9A9A", note: "shadows and everything that isn't the point" },
            { ...indigo, note: "the main wash: the one or two things the image is about" },
            { ...marigold, note: "the highlight, only where the prompt names it: one small thing to catch the eye" },
            { name: "Paper", hex: paper, note: "the background, edge to edge" },
          ]}
        >
          {(swatch) => (
            <li>
              <beautiful-swatch style={{ background: swatch.hex }} />
              <p>
                <strong>{swatch.name}</strong> <code>{swatch.hex}</code>
                <br />
                <small>{swatch.note}</small>
              </p>
            </li>
          )}
        </For>
      </ul>
      <p>
        <strong>Indigo is the main wash</strong>, <code>{indigo.hex}</code>, a deep, ink-dark indigo. It marks the
        point of the picture, like a highlighter: the boulders, not the hill. It is the same indigo the website uses
        for its own small highlights, so a picture belongs to the page it sits on. It is not the UI's cobalt, which
        means "you can press this", so a wash in a picture never looks like a button.
      </p>
      <p>
        <strong>Marigold is the highlight</strong>, <code>{marigold.hex}</code>: one small thing that should catch the
        eye, such as the winner's ribbon, the spark, or the one step that matters. A prompt names it and what it goes
        on, and it goes nowhere else. A picture about a spark itself may wash its whole subject in marigold, with no
        indigo.
      </p>
      <figure data-illustration>
        <img
          src="/illustrations/reservoir.webp"
          width="1881"
          height="1254"
          alt="A glass tank half full of indigo water, dripping from a small tap near its base."
        />
        <figcaption>
          Painted by ChatGPT from the tank prompt below. It was square, so plain paper was added at its sides for
          this 3:2 slot. Switch the mode: the paper stays paper.
        </figcaption>
      </figure>

      <h2>Words in a picture</h2>
      <p>
        Use them whenever the picture needs them to be understood: the titles on a stack of books, the words in each
        box of a flow chart and on its arrows, the name on a signpost. ChatGPT's image model letters well. Its habit
        is adding words nobody asked for, so the prompt is explicit both ways:
      </p>
      <ul>
        <li>
          Every word the picture needs is in the prompt, in quotes, with where it goes. The model letters it by hand
          in the same ink.
        </li>
        <li>
          The base prompt forbids any other text, and an image prompt with no words ends with "No text." Screens,
          papers and signs are the usual places stray writing creeps in.
        </li>
        <li>
          Words go on things in the scene. A headline or a sentence about the picture goes in the page, where it is
          searchable and read aloud.
        </li>
        <li>
          Facts that change, such as a price or a plan's limit, stay out of a picture: it won't change when the page
          does.
        </li>
        <li>The logo is never painted. A product's name as a plain label is fine.</li>
        <li>The alt text says every word the picture does, so a screen reader gets them too.</li>
      </ul>

      <h2>Kinds and sizes</h2>
      <beautiful-table-scroll>
        <table>
          <thead>
            <tr>
              <th>Kind</th>
              <th>Shape</th>
              <th>Where</th>
              <th>What it shows</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Top of a post</td>
              <td>3:2 landscape</td>
              <td>Under the title, at the wide width. Cropped to 1.91:1 for the post's link preview.</td>
              <td>The post's one idea. Figures and a small scene are welcome.</td>
            </tr>
            <tr>
              <td>In the text</td>
              <td>3:2, or square</td>
              <td>At the prose width, with a caption that says its point.</td>
              <td>One idea from the section it sits in.</td>
            </tr>
            <tr>
              <td>Spot</td>
              <td>Square</td>
              <td>Beside a feature's words on a landing page, at 96px.</td>
              <td>One object, no figures, bold shapes.</td>
            </tr>
            <tr>
              <td>Hero</td>
              <td>3:2 landscape</td>
              <td>Beside or under a landing page's headline.</td>
              <td>The page's promise. One per page at most.</td>
            </tr>
          </tbody>
        </table>
      </beautiful-table-scroll>
      <p>
        Ask for the shape in the prompt. A square picture can fill a 3:2 slot with plain paper added at its sides,
        since the paper has no texture. A post gets its top picture, then one more for roughly every 800 words, and
        only where a reader would otherwise have to picture an idea themselves.
      </p>

      <h2>Making them</h2>
      <ol>
        <li>Claude reads the post and picks the ideas worth a picture: the post's one idea, then any others.</li>
        <li>
          For each, Claude picks a picture from <a href="#metaphors">the metaphors below</a> and writes its prompt
          from the template.
        </li>
        <li>
          In a new ChatGPT chat, paste the base prompt once, then each image prompt in turn. One chat per post keeps
          the series consistent.
        </li>
        <li>Check each picture against <a href="#checks">the checklist</a>. Ask again for any that fail.</li>
        <li>
          Save each as WebP, named <code>&lt;post-slug&gt;-&lt;idea&gt;.webp</code>, and keep its prompt beside the
          post, in its front matter, so it can be made again.
        </li>
      </ol>

      <Prompt title="Base prompt: paste first, once per chat" text={basePrompt} />
      <Prompt title="Image prompt template" text={imageTemplate} />

      <h2 id="metaphors">Finding the picture</h2>
      <p>
        One idea per picture, drawn as physical things rather than screens. Show the point in a posture or an
        object, and put the {indigoWord} on it. Skip the stock metaphors: a lightbulb for an idea, gears for a process, a
        rocket for a launch. These shapes work again and again:
      </p>
      <beautiful-table-scroll>
        <table>
          <tbody>
            <For each={metaphors}>
              {([name, how]) => (
                <tr>
                  <th scope="row">{name}</th>
                  <td>{how}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </beautiful-table-scroll>

      <h2>Worked examples</h2>
      <For each={examples}>
        {(example) => (
          <>
            <Prompt title={example.title} text={example.prompt} />
            <p class="prompt-note">
              <strong>Idea:</strong> {example.idea} <strong>Why it works:</strong> {example.why}
            </p>
          </>
        )}
      </For>

      <h2 id="checks">Before a picture goes up</h2>
      <ul>
        <For each={checks}>{(check) => <li>{check}</li>}</For>
      </ul>

      <h2>On the page</h2>
      <ul>
        <li>
          In a <code>&lt;figure data-illustration&gt;</code>, as the <a href="/websites">Websites</a> guide lays out:
          on its paper, with rounded corners, the same in both modes.
        </li>
        <li>
          The alt text says what is drawn and what it means: "A glass tank half full of indigo water, dripping from a
          small tap." A picture in the text also has a caption that says its point, so the post reads whole without
          it.
        </li>
        <li>
          Give the <code>&lt;img&gt;</code> its <code>width</code> and <code>height</code>, so the page doesn't jump
          as it loads, and <code>loading="lazy"</code> on every picture below the first screen.
        </li>
      </ul>
    </article>
  );
}
