# MAHDI

Mahdi Khorsand’s one-page English portfolio, rebuilt around the layout and interactions of https://pixel.melbourne/ at the owner’s request. Deployed at https://mhdcvk.pages.dev through the private GitHub repository and existing Cloudflare Pages integration.

## Contents

- Animated MAHDI wordmark; the exact requested hero statement is preserved.
- Seven scroll-driven 3D disciplines: Youtube Thumbnails, Posters, Social media Posts, Video Productions, Ai Videos, Web, Printed products.
- Seven paired playful normal/hover labels; keyboard focus shows the alternate title.
- Personal introduction, full-screen navigation, category detail dialogs and the Let’s Talk section with the supplied Telegram and Instagram links.
- The footer’s playful “do NOT click me” interaction resets itself after five seconds.

The current category pictures are generated temporary illustrations, not the owner’s portfolio. Opening a category explicitly identifies the imagery as temporary. Replace them with actual work when provided. The nine-cell asset `dist/assets/category-scenes.webp` is displayed as seven CSS crops; the remaining two cells are unused.

The reference’s publicly served display fonts and decorative assets are in `dist/assets/pixel`. Source URLs are recorded in `ASSET_SOURCES.md`. No director portraits, original projects, original contact details, analytics or remote scripts from the reference are included.

## Hosting

Cloudflare Pages: framework None, build command empty, output directory `dist`, production branch `main`. Pushes to main automatically publish. The existing Actions workflow uses repository secrets to configure the existing Pages project when its workflow/script changes or when manually requested. Never commit secrets. See `CLOUDFLARE.md`.

## Local preview

```sh
python3 -m http.server 8080 --directory dist
```

Reduced-motion users get a native horizontal carousel with functioning navigation controls. All seven categories remain usable without the pinned scroll sequence. Built-in dialogs support Escape, focus trapping and keyboard navigation.

The previous bilingual layout is replaced by the explicitly requested English-only design. The source history retains earlier versions.
