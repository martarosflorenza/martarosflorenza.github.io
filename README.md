# Marta Ros Florenza — portfolio

The portfolio website of Marta Ros Florenza, fashion stylist (Paris & Barcelona).

- **Part 1** is for Marta: how to change the website from the browser, with no installation.
- **Part 2** is for anyone technical who helps later: how to run, build and deploy it.

---

# Part 1 — Editing the website (no installation needed)

Everything on the site comes from a few files in this repository. You edit them directly on
**github.com** in your browser. Once the site is online with one of the automatic hosts (see
[Putting the site online](#putting-the-site-online)), every change you save goes live by itself
in a few minutes.

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
- `"magazines"`, `"clients"` and `"productionAgencies"` — the lists on the info page, e.g. `["Loewe", "Adidas", "Coca-Cola"]`. Leave a list out to hide it.
- `"seo"` — the title and description shown by Google and when the link is shared.

## Change a project's text

In `content/projects.json`, each project looks like this:

```json
{
  "slug": "vanguard",
  "category": "editorial",
  "title": "Vanguard Magazine",
  "publication": "Vanguard Magazine",
  "year": 2026,
  "role": "Stylist & Creative Director",
  "media": [ ... ]
}
```

- `slug` — the project's web address (`/work/vanguard`). Lowercase, no spaces, use `-`.
  Each project needs a different one, and it must not be a category name (`editorial`…).
- `category` — one of `editorial`, `commercial`, `runway`, `music`. Each category has its own
  page (`/work/editorial`…). To add a category, add it to the `categories` list at the top.
- `role` — Marta's role, e.g. `Stylist`, `Styling Assistant`.
- `year` — the year.

Information fields — add only the ones that apply; empty ones are not shown:

| Field | Shown as | Used for |
| --- | --- | --- |
| `publication` | publication | **Editorial** — the magazine |
| `projectName` | project | **Editorial** — e.g. `"Passion Project"` |
| `designer` | designer | **Editorial** — the designer |
| `client` | client | Commercial and runway (never shown on editorial) |
| `artist` | artist | Music |
| `production` | production | The production company (never shown on editorial) |
| `note` | a line of its own | e.g. a festival selection |
| `caption` | the line under the images | Replaces the automatic "role + name" line |

- `credits` — any number of `{ "role": "…", "name": "…" }`, or leave it out.
  To hide all credits on the whole site, set `"showCredits": false` in `content/profile.json`.
- The **order of projects in the file is the order on the site**. To move a project, cut its
  whole block `{ … },` and paste it somewhere else (mind the commas between blocks).
- **Renaming a project's slug:** add the old one to `"redirects"` at the top of the file,
  e.g. `"redirects": { "old-slug": "new-slug" }`, so old links keep working.

### YouTube video projects

A project can show a YouTube video (played on the site, not sent to YouTube) instead of photos:

```json
{
  "slug": "adidas-backyard-legends",
  "category": "commercial",
  "title": "Adidas Backyard Legends — World Cup 2026",
  "youtubeId": "mJJY53qhJe0",
  "cover": "/assets/covers/adidas-backyard-legends-cover.jpg",
  "media": []
}
```

`youtubeId` is the part after `watch?v=` in the YouTube address. `cover` is the still image
shown in the lists; covers live in `public/assets/covers/` and should be a frame of the video,
**horizontal 16:9, 1920 × 1080 px**. Video projects are always shown at 16:9 in the lists.
To change a cover, upload a new file with the same name.

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

Two separate things are needed:

- **A domain** — the address, e.g. `martarosflorenza.com`. Bought from any domain company
  (Namecheap, OVH, GoDaddy, Google/Squarespace Domains, IONOS…), usually ~10–20 €/year.
- **A host** — the service that serves the website at that address. The site is "static"
  (just files), so free hosts work perfectly. The domain and the host do not have to be the
  same company: any host below can be connected to a domain bought anywhere.

Choose one host. With the first three, every change saved on GitHub goes live by itself.

| Host | Cost | Updates itself after edits | Notes |
| --- | --- | --- | --- |
| **GitHub Pages** | free | yes | Everything stays in GitHub. The repository must be public (free plan). |
| **Netlify** or **Cloudflare Pages** | free | yes | Repository can be private. One more account. |
| **Vercel** | free | yes | Same as Netlify. |
| The domain company's own hosting | paid | **no** | Each change must be rebuilt on a computer and uploaded by FTP. |

### Option 1 — GitHub Pages

1. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables → New repository variable**:
   name `DEPLOY_TO_PAGES`, value `true`.
3. **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**. After a few minutes the
   site is published (and again after every change).
4. Connect the domain: **Settings → Pages → Custom domain**, type the domain, **Save**, then add
   the DNS records GitHub shows at the domain company, and tick **Enforce HTTPS** when it
   becomes available.

   Use the custom domain: without one, GitHub Pages puts the site under
   `…github.io/marta-portfolio/`, a sub-folder this site is not set up for.

### Option 2 — Netlify, Cloudflare Pages or Vercel

1. Sign up with **Continue with GitHub** and import this repository.
2. Build command `npm run build`, output folder `dist` (Vercel reads them from `vercel.json`;
   Netlify picks up `public/_redirects` automatically).
3. Add the domain in the host's **Domains** settings and follow its DNS instructions.

### Option 3 — The domain company's hosting (FTP)

Someone with Node.js installed runs `npm install` and `npm run build`, then uploads the
**contents** of the `dist/` folder to the hosting's web folder (often `public_html`). The
included `.htaccess` file makes page addresses like `/work/vanguard` work on these servers.
Repeat after every change.

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
