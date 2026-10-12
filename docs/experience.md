# GridPe website

GridPe's content in the requested Zero reference experience: five full-screen
WebGL scenes, the circle drawing interaction, animated hands, glass shards,
tunnel, clouds, map, audio, and floating signup controls.

## Preview

```sh
npm run dev
```

The current website remains at http://127.0.0.1:4173/.
Open the separate experience at http://127.0.0.1:4173/gridpe-experience.html. The drawing interaction starts the experience.
Local previews can open a scene directly with `/gridpe-experience.html#stage=stage1` through
`/gridpe-experience.html#stage=stage5`. These shortcuts are enabled only on localhost. Add `&progress=0.65` to inspect
a specific point in a scene. The build never writes the current `index.html`.
The wordmark and CTA icon use the existing logo and favicon assets.

## Checks

```sh
npm run check
node --test tests/*.test.mjs
```

Checks cover public asset paths, atlas bounds, signup destinations, circle
recognition, and signup success/error handling. Signup tests use mock requests.

## Editing the content

Narrative copy and its fixed texture regions are in
`assets/experience/content.json`. The build scripts compile text into the exact
UV coordinates used by the scene renderer. They require `@napi-rs/canvas`;
the Codex bundled Node runtime supplies it through `NODE_PATH`.

```sh
node scripts/build-text-atlas.cjs
node scripts/build-prop-atlases.cjs
node scripts/build-brand.cjs
node scripts/build-welcome.cjs
python3 scripts/adapt-reference.py
```

`adapt-reference.py` builds `gridpe-experience.html` and `assets/experience/engine.js` from
the saved reference runtime. Keep runtime changes in this script so subsequent
builds retain them. Refresh the browser after rebuilding.

## Signup

The email form uses the existing GridPe insert-only Supabase endpoint in
`assets/experience/waitlist.json`. It sends only `email` and `source`.
The endpoint's public anonymous key is already shipped by the previous site.
Optional preferences remain in the visitor's local browser; the existing
endpoint has no profile or queue-position contract. The completion counter
shows GridPe's six-digit OTP feature, rather than an invented queue position.

## Reference

Reference experience: https://why.zero.university/.
Original design: Zero University. Original development: BUNQ LABS.
The adaptation preserves the original scene runtime, assets, UV regions, and
motion, with GridPe content, brand, and signup integration. The detailed
extraction and verification notes are in `docs/reference-study.md`.

Changed lettering is fitted to the original text regions. Complete source
calligraphic glyphs are reused where applicable; replacement words use the
supplied fonts. Product card media uses the three supplied GridPe presenter videos. The India First card retains its static image.

Responsive audit results and tested viewport dimensions are in `docs/responsive-audit.md`. Responsive overrides live in `assets/experience/responsive.css`.

## Separate preview website

The current site remains at `/`. The experience entry is
`/gridpe-experience.html`, with independent menu pages at
`/experience/home.html`, `/experience/our-story.html`, and
`/experience/why-gridpe.html`. Its fallback, logo, share URLs, and legal links
stay inside this preview. The two versions reuse static assets and the same
waitlist backend, but neither navigates to the other.

The preview pages are marked `noindex, nofollow`. Nothing has been deployed or
switched at the production root. At launch, update the entry point, metadata,
indexing directives, and sitemap for the chosen production URL.

Home navigation and the logo open `/gridpe-experience.html`, the original 3D
experience. `/experience/home.html` is only the non-WebGL fallback; it is not
the experience homepage.

The companion Story and Why pages use scene media, local experience fonts,
a floating glass navigation dock, and a responsive editorial reading layout.
Their Home menu item and logo both open the original 3D entry.

Companion layouts now live in `assets/experience/companions.css`. Why GridPe
uses a selectable denomination sculpture, full-width city route illustration,
and replayable OTP handover. Our Story uses an arched city view and a cash
spread. These illustrations do not place orders. Reduced-motion visitors see
static compositions. Home remains the original 3D entry.

The companion cash sculptures now render in `notes-scene.js`: segmented WebGL
planes use the Home scene’s two-wave paper deformation, with independent
rotation, depth, and drift. The fragment shader samples intact note textures
only. It has no burn, char, or ember code. Rendering pauses offscreen, when
the document is hidden, for reduced motion, and with the footer pause control.
Static note images remain the fallback when WebGL cannot start.
