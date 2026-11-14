import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build` makes the real site. `npm run build:preview` makes a single self-contained
// HTML page (JS, CSS and fonts inlined) used for the private claude.ai preview link.
export default defineConfig(({ mode }) => {
  const preview = mode === "preview";
  return {
    plugins: preview ? [react(), viteSingleFile()] : [react()],
    publicDir: preview ? false : "public",
    build: preview ? { outDir: "dist-preview", assetsInlineLimit: 100_000_000 } : undefined,
    server: { host: true, port: 5173 },
    preview: { host: true, port: 4173 },
  };
});
