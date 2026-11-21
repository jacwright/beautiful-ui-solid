import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [solid()],
  // The navigation reads docs/components.md, outside this app's root.
  server: { fs: { allow: ["../.."] } },
});
