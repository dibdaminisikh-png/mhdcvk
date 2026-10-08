# Asset sources

Reference: https://pixel.melbourne/

Reference-supplied typography and decorative assets were fetched from its public Webflow CDN for this requested clone. They do not represent Mahdi’s original portfolio work:

- Swell Regular: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/699f1f0a816df2e4304335e8_Swell-Regular.otf
- Acumin Variable Concept: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/699f1f0a5d5b7f5e5c1f45bd_AcuminVariableConcept.otf
- Animation sticker: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/69aae571820dafe3af48e916_01_animation.gif
- Live action sticker: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/69aae571c790ab5bc026a755_03_live%20action.gif
- Wizardry sticker: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/69aae5719ea2abd2b5835d16_02_wizardry.gif
- Footer hand: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/69aec1624dd9a4d1ef3bd193_04_hand%20footer.gif
- Shaka: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/69adee5e7eba9e2be4f10464_shaka.avif
- Cursor: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/69adee5e102e5aaee797fbca_pixel_OK.avif
- Thumb: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/69adee5e893318c192543483_pixel_shaka.avif
- Heart: https://cdn.prod.website-files.com/699637b29cf8a85d12ebac48/69adee5e5a166df842c1bf6e_heart.avif

Category art: original generated 3×3 contact sheet produced for the current adaptation, served locally as `dist/assets/category-scenes.webp`. Seven cells correspond to the seven requested categories. Actual client work is pending.

`dist/assets/mahdi-outlines.json` contains the five MAHDI outlines generated from the Swell font above. `logo-motion.js` projects those contours to recreate the timing and extruded outline-to-solid motion of the reference’s 5.94-second hero loop. The original PIXEL video is not shipped.

Matter.js 0.19.0, the MIT-licensed physics library used by the reference, is self-hosted at `dist/assets/vendor/matter.min.js`:
- Source distribution: https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js
- License: https://github.com/liabru/matter-js/blob/0.19.0/LICENSE (included as `MATTER-LICENSE.txt`).

Split-world entry art: generated for this brief, copied unchanged to `dist/assets/style-worlds.png`. The two 3D scenes share one diptych asset; CSS displays each half with pointer parallax. Characters are fictional entry mascots, not portfolio pieces or the owner's portrait.

Classic display font: Gloock, locally served as `dist/assets/Gloock-Regular.ttf`.
- Font distribution: https://fonts.gstatic.com/s/gloock/v8/Iurb6YFw84WUY4N5jw.ttf
- SIL Open Font License: https://github.com/google/fonts/blob/main/ofl/gloock/OFL.txt (included as `Gloock-OFL.txt`).
