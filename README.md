# Marta Ros Florenza — portfolio

The portfolio website of Marta Ros Florenza, fashion stylist (Paris & Barcelona).

- **Part 1** is for Marta: how to change the website from the browser, with no installation.
- **Part 2** is for anyone technical who helps later: how to run, build and deploy it.

---

# Part 1 — Editing the website (no installation needed)

Everything on the site comes from a few files in this repository. You edit them directly on
**github.com** in your browser. When the site is connected to Vercel (see
[Putting the site online](#putting-the-site-online)), every change you save goes live by itself
in about two minutes.

## Where things are

| What you want to change | File or folder |
| --- | --- |
| Projects (titles, years, credits, photos, order) | `content/projects.json` |
| Bio, contact, clients, cover photo, info artwork | `content/profile.json` |
| The photo and video files themselves | `public/assets/` (one folder per shoot) |

## How to edit a file on GitHub

1. Open the repository on github.com and click the file (for example `content/profile.json`).
2. Click the **pencil icon** (top right of the file) to edit.
3. Make your change. Keep the quotes `"` and commas `,` exactly as they are around your text.
4. Click **Commit changes…** (green button), then **Commit changes** again.

> **If the site stops updating after an edit**, a comma or quote is probably missing.
> Open the file's **History**, compare with the previous version, or paste the file into
> [jsonlint.com](https://jsonlint.com) — it points to the exact line that is wrong.

## Change the bio, contact or clients

Edit `content/profile.json`:

- `"bio"` — the text on the info page. The first sentence is shown large, the rest smaller.
- `"contact"` — `"email"`, `"phone"`, `"instagram"` (the Instagram name without `@`).
- `"clients"` — the "selected clients" list: `["Loewe", "Adidas", "Coca-Cola"]`.
- `"seo"` — the title and description shown by Google and when the link is shared.

## Change a project's text

In `content/projects.json`, each project looks like this:

```json
{
  "slug": "vanguard",
  "category": "editorial",
  "title": "Vanguard Magazine",
  "client": "Vanguard Magazine",
  "year": 2026,
  "role": "Stylist",
  "description": "",
  "credits": [
    { "role": "photography", "name": "Talia Chetrit" }
  ],
  "media": [ ... ]
}
```

- `slug` — the project's web address (`/work/vanguard`). Lowercase, no spaces, use `-`.
  Each project needs a different one.
- `category` — one of `editorial`, `runway`, `commercial`.
- `credits` — any number of `{ "role": "…", "name": "…" }`. Leave `[]` for none.
  To hide all credits on the whole site, set `"showCredits": false` in `content/profile.json`.
- The **order of projects in the file is the order on the site**. To move a project, cut its
  whole block `{ … },` and paste it somewhere else (mind the commas between blocks).

## Add a new project

1. **Upload the photos.** Go to the `public/assets` folder on GitHub, click **Add file →
   Upload files**, and drag in a **folder** from your computer (for example `new-shoot`, with
   the photos inside). Use lowercase names without spaces, like `new-shoot/photo-01.jpg`.
2. **Add the project.** Open `content/projects.json`, copy an existing project block, paste it
   where you want it in the list, and change the text. The `media` list only needs the file
   paths, in the order you want them shown:

   ```json
   "media": [
     { "src": "/assets/new-shoot/photo-01.jpg" },
     { "src": "/assets/new-shoot/photo-02.jpg" },
     { "src": "/assets/new-shoot/clip-01.mp4" }
   ]
   ```

   You can add `"alt": "short description of the photo"` to each item for accessibility.
   Sizes and image quality are handled automatically. The first photo is the project's cover.
3. Commit. The new photos are resized and optimised automatically while the site rebuilds.

**Videos:** clips up to 60 seconds play silently in a loop (with a sound button). For longer
films add `"duration": 95` (seconds) to the item to show normal play controls instead.
GitHub's browser upload accepts files up to 25 MB; for bigger videos use
[GitHub Desktop](https://desktop.github.com) or ask someone technical.

## Remove or replace things

- **Remove a project:** delete its whole block from `content/projects.json` (and the comma
  before or after it). The photos can stay in `public/assets`; unused files are not shown.
- **Replace a photo:** upload a new file with the same name in the same folder.
- **Home page cover:** `"homeCover"` in `content/profile.json` (photo path, title, credits).
- **Info page artwork:** `"infoArtwork"` in `content/profile.json`. It is shown in black and
  white; to show it in colour, delete the `filter: grayscale(1)` line in `src/pages/info.css`.

## Bigger changes with Claude

For design or layout changes, use your own Claude account with
[Claude Code on the web](https://claude.ai/code): connect it to this GitHub repository and ask
in plain words ("make the project titles smaller", "add my drawings to the info page").
It works on this code directly and can save the changes back to GitHub. Any web developer can
also work on it — it is a standard React project (see Part 2).

---

# Putting the site online

The site is a static website; the free plan of [Vercel](https://vercel.com) is enough.

1. Sign up at vercel.com with **Continue with GitHub** (use Marta's GitHub account).
2. Click **Add New… → Project**, pick this repository, click **Import**.
3. Leave all settings as they are (they are read from `vercel.json`) and click **Deploy**.

After a few minutes the site is live at an address like `marta-ros-florenza.vercel.app`.
From then on, every change committed on GitHub is published automatically.

**Own domain** (for example `martarosflorenza.com`): in the Vercel project open
**Settings → Domains**, add the domain and follow the instructions shown there.

Other hosts work too (Netlify, Cloudflare Pages): build command `npm run build`, output folder
`dist`. A `public/_redirects` file for Netlify is already included.

---

# Part 2 — Technical notes

**Stack:** Vite 5, React 18, TypeScript, React Router 6, Framer Motion. No CMS or database:
content is plain JSON in `content/`, imported at build time.

## Run it locally

Requires Node.js 20+ (and `ffmpeg` on the PATH for video posters, optional).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ locally
```

## Media pipeline

`scripts/optimize-media.mjs` runs automatically before `dev` and `build` (or on its own with
`npm run media`). For every file in `public/assets/` it creates:

- AVIF and WebP versions at 480 / 960 / 1600 / 2400 px wide in `public/img/`,
- a tiny blurred placeholder, and for videos a poster frame (needs `ffmpeg`; without it the
  video shows its own first frame),
- `src/generated/media-manifest.json`, which the components read.

Results are cached by file content in `public/img/media-cache.json`, so only new or changed
files are processed (a full run takes minutes; a cached run under a second). Commit
`public/img/` and the manifest after processing locally to keep hosted builds fast.
Original files are never modified and videos are served untouched (full quality).

## Content model

`src/content.ts` loads and normalises the JSON. Most project fields are optional; media items
need only `src` — type comes from the extension and width/height from the manifest.
Projects with no media are skipped.

## Structure

```
content/              editable JSON (projects, profile)
public/assets/        original photos and videos
public/img/           generated image sizes (do not edit by hand)
scripts/              media pipeline, preview packaging
src/pages/            Home (index), Work (grid), Project, Info, NotFound
src/components/       Header, Footer, Img, Video, page transition, scroll reveal
src/styles/global.css design tokens (colours, type, grid) and base styles
```

Design tokens (colours, font stack, margins) are at the top of `src/styles/global.css`.
The type is the Helvetica Neue stack, which falls back to Helvetica and then Arial.
Motion respects `prefers-reduced-motion`.

## Single-file preview build

`npm run build:preview` makes `dist-preview/page.html`, a version with in-memory routing
and relative paths for hosts that cannot serve real URLs (used for private review links).
It is not needed for normal hosting.
