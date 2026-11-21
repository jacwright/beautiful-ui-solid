import type { JSX } from "@solidjs/web";
import { createSignal, omit, Show } from "solid-js";

/**
 * Avatar: a person, a team or a site, as a photo or their initials, on <beautiful-avatar>. The
 * initials are data-initials, drawn by CSS (styles/elements/avatar.css), and the photo is an
 * <img alt=""> laid over them, so they show while it loads. A photo that fails is dropped, so they
 * show then too. role="img" and aria-label name it once; decorative hides it beside its name.
 * AvatarGroup overlaps the avatars in it. The spec is the docs site's Avatar page.
 */

export const avatarColors = ["blue", "indigo", "violet", "pink", "orange", "amber", "emerald", "teal"] as const;
export type AvatarColor = (typeof avatarColors)[number] | "neutral";
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const firstLetter = (word: string) => graphemes.segment(word)[Symbol.iterator]().next().value?.segment ?? "";

/**
 * The initials of a name: the first letter of its first word and of its last, so "Lucía Reyes" is
 * LR and "Northwind" is N. Words that don't start with a letter or a digit, such as "(Guest)" or
 * an email address, don't count; a name with none gives "".
 */
export function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter((word) => /^[\p{L}\p{N}]/u.test(word) && !word.includes("@"));
  const first = words[0];
  if (!first) return "";
  const last = words.length > 1 ? words[words.length - 1]! : "";
  return (firstLetter(first) + (last ? firstLetter(last) : "")).toLocaleUpperCase();
}

/**
 * The tint a name always gets: FNV-1a over the code points of its trimmed, lowercased form, picking
 * one of avatarColors. A server writing the static markup gets the same color.
 */
export function colorOf(name: string): (typeof avatarColors)[number] {
  let hash = 0x811c9dc5;
  for (const char of name.trim().toLowerCase()) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return avatarColors[hash % avatarColors.length]!;
}

export type AvatarProps = Omit<JSX.HTMLAttributes<HTMLElement>, "color" | "children"> & {
  /** Whose avatar: a person's, a team's or a site's name. It gives the label, the initials and the tint. */
  name: string;
  /** The photo or logo. Without one, or until it loads, the initials show. */
  src?: string;
  /** In place of the ones from the name, or a count such as "+3". */
  initials?: string;
  /** 20, 24, 32, 40 or 64px. Left out, md, or the size of the AvatarGroup it's in. Avatars in a group share one size. */
  size?: AvatarSize;
  /** Left out, the name picks one, the same way every time. */
  color?: AvatarColor;
  /** Rounded corners, for a team, a site or a company. A circle is a person. */
  square?: boolean;
  /** Hides it from screen readers, for an avatar beside its name. */
  decorative?: boolean;
  /** Passed to the <img>. */
  loading?: "eager" | "lazy";
  referrerpolicy?: JSX.ImgHTMLAttributes<HTMLImageElement>["referrerpolicy"];
  crossorigin?: JSX.ImgHTMLAttributes<HTMLImageElement>["crossorigin"];
};

export function Avatar(props: AvatarProps) {
  const rest = omit(
    props,
    "name",
    "src",
    "initials",
    "size",
    "color",
    "square",
    "decorative",
    "loading",
    "referrerpolicy",
    "crossorigin",
  );
  // The src that failed to load. A new src gets its own try.
  const [failed, setFailed] = createSignal<string>();
  const initials = () => props.initials ?? initialsOf(props.name);

  return (
    <beautiful-avatar
      {...rest}
      role={props.decorative ? undefined : "img"}
      aria-label={props.decorative ? undefined : (props["aria-label"] ?? props.name)}
      aria-hidden={props.decorative ? "true" : undefined}
      data-color={props.color ?? colorOf(props.name)}
      data-size={props.size}
      data-square={props.square ? "" : undefined}
      data-initials={initials() || undefined}
    >
      <Show when={props.src && props.src !== failed() ? props.src : undefined}>
        {(src) => (
          <img
            src={src()}
            alt=""
            loading={props.loading}
            referrerpolicy={props.referrerpolicy}
            crossorigin={props.crossorigin}
            onError={() => setFailed(src())}
          />
        )}
      </Show>
    </beautiful-avatar>
  );
}

export type AvatarGroupProps = JSX.HTMLAttributes<HTMLElement> & {
  /** What the group is, such as "Editing now". */
  label?: string;
  /** The size of every avatar in it. */
  size?: AvatarSize;
};

/** Avatars side by side, each overlapping the one before by a quarter, with a clear gap cut around it. */
export function AvatarGroup(props: AvatarGroupProps) {
  const rest = omit(props, "label", "size");

  return (
    <beautiful-avatar-group
      {...rest}
      role="group"
      aria-label={props.label}
      data-size={props.size === "md" ? undefined : props.size}
    />
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-avatar": HTMLAttributes<HTMLElement>;
      "beautiful-avatar-group": HTMLAttributes<HTMLElement>;
    }
  }
}
