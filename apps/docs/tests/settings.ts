import type { Page } from "@playwright/test";
import { settings } from "../src/settings.ts";

export const themes = settings.theme.values;
export const modes = settings.mode.values;

/** Opens a docs page in one theme and mode, through the storage the site's toggles use. */
export async function open(page: Page, path: string, theme: (typeof themes)[number] = "glass", mode: (typeof modes)[number] = "light") {
  await page.addInitScript(
    (stored) => {
      for (const [key, value] of stored) localStorage.setItem(key, value);
    },
    [
      [settings.theme.key, theme],
      [settings.mode.key, mode],
    ] as [string, string][],
  );
  await page.goto(path);
  await page.locator("main > article > h1").waitFor();
}
