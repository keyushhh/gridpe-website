# GridPe experience: responsive and functional audit

Date: 7 October 2026. Scope: `/gridpe-experience.html` and its assets. The original homepage remains unchanged.

## Result

Completed a local audit in the Codex in-app browser, with 23 explicit viewport dimensions. The service-card layout stayed within every tested viewport. No page-level horizontal overflow remained. Short cards scroll internally so their content and CTA remain reachable. All 20 regression tests pass.

This is evidence for the tested layouts and interactions, not certification of every browser, screen, or physical device.

## Findings and fixes

| Finding | Fix |
|---|---|
| Mobile card CTA and close control looked oversized | CTA uses 16px text. Close uses a 14px SVG cross in a 28px visual face, with a 44px hit area. |
| Cursors appeared in phone previews | Hide website cursors at widths up to 768px and on coarse touch pointers. Desktop cursors remain available. |
| Service and zoom controls absent on phones | Added a compact mobile row; buttons have 44px touch targets. Desktop map buttons use 48px. |
| Cards could exceed short viewport heights | Bound card height to the visible viewport, use internal vertical scrolling, preserve 16:9 video framing. |
| No explicit card-close action | Added Close and Escape handling. Closing pauses/resets the video and restores focus. Hidden cards no longer expose keyboard controls. |
| Circle size/recognition depended on aspect ratio | Size the hint with vmin; recognize physical circles in normalized aspect-correct coordinates. Added a keyboard-accessible Skip drawing option. |
| Browser zoom disabled | Removed maximum-scale and user-scalable restrictions. |
| Mobile keyboard and device safe areas could cover signup | VisualViewport-aware bottom offset, safe-area spacing, 16px email input text, 44px submit target. Keyboard offset is regression-tested; physical OS keyboards remain to be tested. |
| Signup bar failed to reflow when resized within one breakpoint | Recompute its widths and positions without clearing the input. Retested closed and expanded states at 280px. |
| Breakpoint mismatch at exactly 768px | Use the same 768px boundary for renderer and UI. Preserve timeline position when the asset variant reloads across that boundary. |
| Small/inaccessible mobile scene-menu trigger | Added a 44px target, button label, keyboard activation, and hidden-menu focus protection. Restart now works from stage1 too. |
| Blank experience if renderer/module/required assets fail | Added main-site fallback for startup failures, missing WebGL, older non-module browsers, and disabled JavaScript. Regression tests cover error branches. |

## Viewport matrix

| Dimension (CSS px) | Page overflow | Card bounds | Map/nav control bounds |
|---|---|---|---|
| 280 × 653 | None | Pass | Pass |
| 320 × 568 | None | Pass | Pass |
| 360 × 640 | None | Pass | Pass |
| 375 × 667 | None | Pass | Pass |
| 390 × 844 | None | Pass | Pass |
| 430 × 932 | None | Pass | Pass |
| 568 × 320 | None | Pass | Pass |
| 600 × 960 | None | Pass | Pass |
| 667 × 375 | None | Pass | Pass |
| 740 × 360 | None | Pass | Pass |
| 767 × 1024 | None | Pass | Pass |
| 768 × 1024 | None | Pass | Pass |
| 769 × 1024 | None | Pass | Pass |
| 820 × 1180 | None | Pass | Pass |
| 834 × 1194 | None | Pass | Pass |
| 844 × 390 | None | Pass | Pass |
| 1024 × 768 | None | Pass | Pass |
| 1180 × 820 | None | Pass | Pass |
| 1280 × 720 | None | Pass | Pass |
| 1366 × 768 | None | Pass | Pass |
| 1440 × 900 | None | Pass | Pass |
| 1920 × 1080 | None | Pass | Pass |
| 2560 × 1080 | None | Pass | Pass |

Raw measured geometry is saved in `responsive-measurements.json`. The 280px record includes the final signup reflow retest. These tests resize a browser viewport; they do not emulate device hardware, DPR, mobile browser chrome, or a physical touchscreen.

## Interaction checks

- Intro completion reaches the first story scene; circle recognition covers portrait, landscape, and ultrawide dimensions in regression tests.
- Mobile scene picker opens, and −100 GP restarts at the drawing intro, including when stage1 is already selected.
- Cash Delivery, Live Tracking, and Clear Pricing videos load and play. India First retains its static poster. Closing a card pauses and resets media.
- Service cycling, explicit card closing, mobile menu expansion/collapse, and invalid email feedback were exercised in the browser.
- Signup success, duplicate submission, validation rejection, and request failure are tested with mock requests. No real signup was submitted during the audit.
- Keyboard-offset, orientation resume (including stage1), expired-session handling, and unsupported-browser/error fallback behavior are regression-tested.
- Public assets, relative module imports, CSS links, atlas bounds, signup destinations, and unchanged homepage checks pass.

## Remaining validation limits

- Physical iOS Safari, Android Chrome, Firefox, and device GPUs were not available for this audit. Touch pinch behavior, OS keyboards, browser address-bar resizing, and real safe-area values need physical-device checks before a broad production launch.
- This remains a substantial WebGL experience. The renderer is approximately 1.2 MB and the three presenter clips total approximately 19 MB, before models/textures/audio. FPS, low-memory behavior, and slow-network startup were not benchmarked. The fallback keeps the main website reachable when startup fails.
- Reduced-motion CSS removes the hold-button ripple, but the full 3D story is still animated. This report is not a formal WCAG conformance certification.
- The five-bank city remains a raster asset; bank-logo fidelity and its resolution are documented separately in `bank-city.md`.

## Repeat checks

```sh
python3 scripts/adapt-reference.py
npm run check
npm test
```

Keep renderer edits in `scripts/adapt-reference.py`; responsive rules are in `assets/experience/responsive.css`, with visual-viewport handling in `assets/experience/viewport.js`.
