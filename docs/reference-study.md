# Zero reference extraction — GridPe adaptation

Reference: https://why.zero.university/ (inspected 7 October 2026).
The adaptation is a separate page: `gridpe-experience.html`.
The existing homepage and its assets remain unchanged.

Published page build: main-B9-HtP-f.js / main-yeWZtezw.css.

## Intake and layout

Live desktop canvas at 1151 × 873. This is a fixed, viewport-sized WebGL
experience, not a document of stacked HTML sections. The canvas fills the screen;
the HUD, stage ruler, floating email bar, and dialogs occupy separate layers.
The responsive breakpoint is 768px; camera FOV is 30° desktop / 40° mobile.
The source includes separate mobile cloud atlases and background video.

## Seven-layer extraction

- Grid: fixed canvas at z=1, pointer-transparent UI at z=2, dialogs above the HUD.
  Text is positioned in an orthographic scene with explicit anchors and UV regions.
  Text scale is relative to the shorter viewport dimension, with source clamps.
- Typography: narrative display lettering lives in a 3072 × 3072 texture atlas,
  sampled at 1.5× logical coordinates. Supply Sans, PP Supply Mono, STK Bureau
  Serif Book, Bethany Elingston, and Google Sans Flex are the actual UI fonts.
  Narrative calligraphy is baked artwork and is distinct from UI text.
- Palette: loader base rgb(28,72,57), mint gradient through rgb(212,246,235).
  Scene 1 moves from blue/mint to white; scene 2 is red/black; the tunnel is dark;
  clouds, landscape, and green glass controls return in scenes 4–5.
  UI text #1f1d1e, translucent pills #0006, borders #ffffff1a.
- Spacing: reference source values retained, including HUD offsets, 48px desktop /
  44px mobile email-bar circles, 320px desktop action, 32px dialog corners,
  10px dialog perimeter, 120px desktop / 10px mobile dialog top.
- Components: loader counter, draw-circle hint, animated hand cursor, audio toggle,
  XP counter, horizontal/vertical stage ruler, hold-to-continue control,
  spring-like expanding email bar, menu, profile dialog, origami reward,
  share poster, spinning waitlist ring, map markers, and scenario popovers.
- Atmosphere: real frost and normal textures; refraction, blur, grain, glow,
  god rays, particles, procedural gradients, atlas sampling, and color grading.
- Interaction: drawing recognition checks radius variance, signed angle coverage,
  and closure distance; wheel/touch scroll is smoothed; camera tracks animated
  GLB cameras; mouse/gyro gives parallax; gates require tap/hold; scene transitions
  mix audio; email submission opens a sliding form; final map can be dragged.

## Animation inventory

The scene runtime and asset animations are preserved directly; CSS recreations
would discard the camera curves, geometry deformation, and compositing passes.

1. Loader: numeric count → brand, 1s gradient/frost transition; brand exits over
   0.8s after 1.2s. The pointer draws a glowing trail, a hand follows the pointer,
   and the circle hint loops until a valid drawn circle is recognized.
2. Gate 0→1: 3.5s frost spread/melt and whiteout. Center glow rises over 1.4s.
3. Scene 1: 175vh of narrative; hands use skeletal animation, camera animation,
   portal burn, coin ring, petals, and six-layer garden parallax. End control
   appears at 0.95 progress and hides at 0.90.
4. Gate 1→2: hand ripple and glass fracture, preserving original baked shatter
   animation, refraction, color changes, sound, and camera motion.
5. Scene 2: glass fragments, animated hand, separate looping mobile/desktop video,
   red background, text dissolve, and progression into the tunnel.
6. Scene 3: tunnel travel, money burn/shreds, certificates, camera parallax,
   staggered narrative atlas regions. End gate uses a 1.5s hold with camera zoom.
7. Scene 4: cloud layers and world map scale with smoothstep; text group grows
   from zero over 2s, eight timed narrative phrases.
8. Scene 5: world/city atlas, halos, pulsing marker dots, panning controls,
   waitlist ring, marker popovers, and animated email/profile/share flow.
9. Text: original noisy directional blur/flare shader, 4s out-exponential reveal,
   0.3s exit. Atlas rectangles, anchors, rotations, sizes, and trigger intervals
   stay unchanged when the words change.
10. UI: glass is seven nested treatment layers; XP counts over 2s with a ripple;
    idle scroll prompt appears after 3s; source hover, focus, menu, and form
    animations remain intact. Audio uses the original Howler integration.

## Content scope

Only the reference's narrative and existing UI slots are used. GridPe copy is
sourced from this repository: doorstep notes, upfront fees, verified riders,
live tracking, OTP handover, Bengaluru first, Guwahati next, and no held balances.
The opening circle gesture remains a circle; its wording becomes DRAW A CIRCLE.
Stage labels keep their shape and number of characters, replacing BZ with GP.
Generic linking phrases such as “You Believed”, “But,” and “Introducing” remain.
GridPe's existing waitlist endpoint replaces the reference service. No reference
analytics or signup requests are retained. No real signup is submitted for QA.

## Fidelity limits

The runtime, scene geometry, camera tracks, visual effects, sound, spatial text
regions, and UI styling can be preserved exactly. New words cannot preserve the
original raster glyphs of the words they replace. Changed text uses the supplied
serif font and original calligraphic lead-ins where possible, fitted to the same
atlas region. This distinction must be stated when delivering the adaptation.

## Additional baked-content audit and fixes

The shards/petals/coins atlas contains six hiring-statistic overlays and eight
company-logo coins. These now contain GridPe product facts and labels; petals,
coin silhouettes, UVs, and animation are preserved. Paper props and newspaper
strips also contain education copy; their texture slots now contain GridPe
service passages and welcome cards. The fantasy city background remains the
reference artwork.

The first atlas build retained parts of old words beneath calligraphic headers.
User screenshots exposed the resulting fragments, the university label, and an
inverted CASH tile. The atlas now starts transparent. Whole connected script
glyphs are isolated, and changed regions are rendered in full. Rotated tiles
use the reference's clockwise orientation. Texture mipmaps are disabled for
the replacement text atlases to avoid adjacent-region bleed.

Reference runtime fixes: asynchronous shader prewarming safely handles materials
that have been disposed during scene changes; the tunnel hold state is initialized;
and restored/preview scenes align their global scroll position to the requested
segment. These fixes preserve the scene motion and prevent stale scene state.

Automated validation: eight tests cover circle recognition and signup requests;
69 public asset paths and narrative UV bounds are verified. Live signup is not
submitted during QA. Browser screenshots are taken for the scene and texture
checks; new errors are checked from a fresh browser tab.

## Scroll narrative revision

The added GRIDPE NOTE patch is removed; the original note texture is restored.
The tunnel copy now reads in animation order: “ATMs mean a trip. Why leave home?
Order your cash from home. Track your rider. Confirm with your OTP. Skip the ATM.
That’s doorstep cash delivery.” Paper geometry, shreds, and shader timings are
unchanged from the reference. GridPe printed paper layouts are adapted content.

## Indian-note and typography update

The tunnel uses the existing `assets/notes/500.webp` instead of the dollar prop.
The rotated atlas slot is unchanged; the note mesh aspect matches that asset.
Tunnel headings are reduced by 15%, with explicit word spacing and extra line
gap. Camera, burning, paper movement, and shredding remain unchanged.

## Compact line spacing and cursor correction

Tunnel text now stacks by measured glyph bounds, centered as one block, with a
0.12em line gap rather than tall independent line boxes. The native pointer is
used alone; the reference DOM cursor overlay and atlas cursor fallbacks are not
activated. The original homepage remains unchanged.
