# Shulker Box — GitHub Pages site

Static landing page for [renzoreyn/ShulkerBox](https://github.com/renzoreyn/ShulkerBox).

## Enable GitHub Pages

1. Repo **Settings → Pages**
2. **Build and deployment → Source:** Deploy from a branch
3. **Branch:** `main` (or your default)
4. **Folder:** `/docs`
5. Save — site URL: `https://renzoreyn.github.io/ShulkerBox/`

If you publish only the `github-public/` folder (flat repo root), run `python scripts/build_github_public.py` first — it copies this site to the public folder root.

## Local preview

```bash
cd docs
python -m http.server 8080
```

Open `http://localhost:8080` — changelog loads from `./CHANGELOG.md`; releases need internet (GitHub API).

## Edit content

| What | Where |
|------|--------|
| Marketing copy | `index.html` |
| Styles | `css/site.css` |
| Motion | `js/site.js` (GSAP + ScrollTrigger) |
| Live changelog | `CHANGELOG.md` (sync from repo root before release) |
| Releases list | Fetched live from GitHub API in `js/site.js` |

Keep root `CHANGELOG.md` in sync — copy or run `python scripts/build_github_public.py` before pushing.

## Assets

See `images/README.md` for `logo.png` and `screenshot.png`.
