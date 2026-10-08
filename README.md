# MAHDI

Mahdi Khorsand’s one-page English portfolio with two visual styles, published at https://dibdaminisikh-png.github.io/mhdcvk/ through GitHub Actions, with the existing Cloudflare Pages integration at https://mhdcvk.pages.dev.

Every page load starts with a split 3D-world entry: an orange streetwear fox in a coral world and a tuxedoed pianist in a violet glass world. “I’m funky” opens the existing Pixel-inspired portfolio; “I’m classic” opens a new navy/silver/violet glass portfolio. Selection stays in memory for the current visit only. Refresh always returns to the entry, including after visiting section anchors. There is no style-switch control and no choice is saved in browser storage or the URL.

Both experiences live in `dist/index.html`. `entry.js` loads only the chosen style’s CSS and scripts, after making its root visible so the existing carousel can measure correctly. `portfolio-data.js` supplies the same seven category names and descriptions to both experiences. All resources are self-hosted and use relative paths for GitHub project Pages.

The classic experience uses Gloock display typography, Acumin body type, an interactive layered glass monogram, mouse-following violet light, asymmetric discipline cards, and distinct plane/shutter/focus/ink/light reveals. Its category dialogs disclose temporary imagery and use the same contact links. Only reveal children are clipped; the observed parent remains measurable so animations cannot permanently hide content.

## Contents

The following describes the preserved funky experience:

- MAHDI wordmark with a staggered outline-to-solid 3D rotation, adapted from the reference’s video loop; the exact requested hero statement is preserved.
- Seven scroll-driven 3D disciplines: Youtube Thumbnails, Posters, Social media Posts, Video Productions, Ai Videos, Web, Printed products.
- Seven paired playful normal/hover labels; keyboard focus shows the alternate title.
- Personal introduction, a sidebar with staggered coral/lime/pink panels, category detail dialogs and the Let’s Talk section with the supplied Telegram and Instagram links.
- Stickers react to hover with the reference’s quick rotation or springy scale; touch also triggers the effect.
- The footer’s “do NOT click me” starts real gravity, collisions, dragging, throwing and mouse repulsion. Decorative objects and the footer invitation fall into a fixed scene. “Put it back” or Escape restores the page, without reloading; the physics runner and event handlers are cleaned up. The scene adapts to viewport changes.

The current category pictures are generated temporary illustrations, not the owner’s portfolio. Opening a category explicitly identifies the imagery as temporary. Replace them with actual work when provided. The nine-cell asset `dist/assets/category-scenes.webp` is displayed as seven CSS crops; the remaining two cells are unused.

The reference’s publicly served display fonts and decorative assets are in `dist/assets/pixel`. Source URLs are recorded in `ASSET_SOURCES.md`. No director portraits, original projects, original contact details, analytics or remote scripts from the reference are included.

## Hosting

GitHub Pages: Settings → Pages → Source → GitHub Actions. `.github/workflows/github-pages.yml` publishes `dist` on changes to that directory on `main`, or via manual dispatch. All asset URLs are relative to support the `/mhdcvk/` project path. No personal API token is required.

Cloudflare Pages: framework None, build command empty, output directory `dist`, production branch `main`. Pushes to main automatically publish. The existing Actions workflow uses repository secrets to configure the existing Pages project when its workflow/script changes or when manually requested. Never commit secrets. See `CLOUDFLARE.md`.

## Local preview

```sh
python3 -m http.server 8080 --directory dist
```

Reduced-motion users get a native horizontal carousel with functioning navigation controls. All seven categories remain usable without the pinned scroll sequence. Built-in dialogs support Escape, focus trapping and keyboard navigation.

The logo is a static solid wordmark and the menu opens immediately with reduced motion. Physics only starts after the visitor explicitly clicks its trigger. Matter.js is served locally with its MIT license; no CDN script request is required. Logo rendering pauses offscreen, and physics pauses when the tab is hidden.

Both current styles are English-only. The source history retains earlier designs.
