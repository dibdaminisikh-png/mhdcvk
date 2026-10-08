# MAHDI

Mahdi Khorsand’s one-page English portfolio with two visual styles, published at https://dibdaminisikh-png.github.io/mhdcvk/ through GitHub Actions, with the existing Cloudflare Pages integration at https://mhdcvk.pages.dev.

A compact Caveat handwritten caption under “What’s your style?” reads “Because / your taste matters. ✦”. It rests at −3° in creamy white, with “your taste” slightly larger. A damped hanging-sign swing plays after the page and fonts load, and repeats on mouse entry or touch. Reduced motion keeps it still.

Every page load starts with a split 3D-world entry: an orange streetwear fox in a coral world and a tuxedoed pianist in a violet glass world. “I’m funky” opens the existing Pixel-inspired portfolio; “I’m classic” opens a new navy/silver/violet glass portfolio. Selection stays in memory for the current visit only. Refresh always returns to the entry, including after visiting section anchors. There is no style-switch control and no choice is saved in browser storage or the URL.

Both experiences live in `dist/index.html`. `entry.js` loads only the chosen style’s CSS and scripts, after making its root visible so the existing carousel can measure correctly. `portfolio-data.js` supplies the same seven category names and descriptions to both experiences. All resources are self-hosted and use relative paths for GitHub project Pages.

The classic experience uses Gloock display typography, Acumin body type, an interactive layered glass monogram, mouse-following violet light, asymmetric discipline cards, and a consistent plane reveal for all seven work cards and focus/ink/light reveals for the other sections. The monogram’s violet light starts off, blends on with scroll or pointer proximity, and dims smoothly in reverse; Ai Tools uses a red accent. Its category dialogs disclose temporary imagery and use the same contact links. Reveal progress follows scroll position in both directions: scrolling up reverses the same motion, and scrolling down rebuilds it. Cached layout coordinates ignore transforms to keep progress stable. The six glass tool icons (Photoshop, Illustrator, Premier, After effects, Ui/Ux, Ai Tools) smoothly take their brand colours within 60px of the mouse. On touch devices, each icon lights progressively through its own scroll position and dims in reverse. Telegram and Instagram contact buttons temporarily take their brand colours on mouse hover, keyboard focus or finger contact; touch release, cancellation and leaving the button restore their glass appearance.

## Contents

The following describes the preserved funky experience:

- MAHDI wordmark with a staggered outline-to-solid 3D rotation, adapted from the reference’s video loop, with a 4.94-second cycle and a one-second shorter solid hold; the exact requested hero statement is preserved.
- Seven scroll-driven 3D disciplines with smoothly fading captions: Youtube Thumbnails, Posters, Social media Posts, Video Productions, Ai Videos, Web, Printed products.
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

Scroll rendering uses native scroll timelines when the engine supports the animation range API, with the same geometry, timing and easing in a cached frame-based fallback. Classic pointer and scroll work shares one animation frame; geometry reads finish before writes, and distant tool icons are not measured. Mouse-light variables are scoped to the ambient layer. Funky slide controls update only when the active category changes; ring and headline geometry is measured on layout changes instead of every scroll. SVG logo projections are reused during the unchanged solid hold and hidden phase; the three identical mobile copies share one projection during movement. Resizes reuse native animations where possible. The visual styles and reverse-scroll behavior are preserved.

Both current styles are English-only. The source history retains earlier designs.
