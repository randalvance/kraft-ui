# P1 contrast verification — 16 November 2026

Both P1 issue families from the [component audit](2026-11-15-components.md) are resolved. This is focused verification, not a new whole-library audit score. P2 host-selector scoping and P3 texture payload optimization remain open.

## Changes

- Bounded `mark-gloss` keeps printed marks glossy without washing out their small labels.
- Material-specific primary, secondary, and link ink roles cover paper, kraft, and cardboard. Night kraft uses bright primary ink for secondary copy, preserving readability instead of reducing contrast.
- Every Surface and ThemeProvider resets its content roles, so nested pieces and themes select their own readable ink.
- Existing base material colors, texture tiles, upright stickers, and circle geometry are preserved.
- DESIGN.md, the Impeccable sidecar/snippets, README, and Storybook's Readable Ink example reflect the implementation.

## Original failing examples

These use the same paired-screenshot glyph/background method as the audit.

| Case | Before | After |
| --- | --- | --- |
| Neutral Badge / night | 4.19:1 | 5.21:1 |
| Sage Badge / paper | 4.22:1 | 5.20:1 |
| Sage Badge / night | 4.38:1 | 5.09:1 |
| Blue pill Sticker / paper | 4.36:1 | 5.97:1 |
| Link on kraft / paper | 3.00:1 | 5.81:1 |
| Link on kraft / night | 1.96:1 | 5.45:1 |
| Link on paper / night | 3.94:1 | 6.08:1 |
| Muted Text on paper / paper | 4.13:1 | 5.55:1 |
| Muted Text on kraft / paper | 2.55:1 | 5.60:1 |
| Muted Text on kraft / night | 2.52:1 | 5.82:1 |

All ten originally reported examples now exceed 5:1. The complete current captures and raw coordinates/colors are under `../audit-evidence/2026-11-16-p1/`.

## Regression coverage

`npm run test:contrast` runs eight Chromium browser tests:

- Four real screenshot matrices cover 136 rendered-label combinations across both themes, texture on/off, every tone and sticker shape, all three materials, and nested surfaces/providers. Foreground colors are compared with the actual pixels behind glyphs; anti-aliased ink is not used as the normative foreground.
- Two full-texture tests evaluate every texel of the paper/board tiles at both material-light gradient endpoints. These guard against labels landing on different texture positions or fonts.
- Two full-gloss tests verify every mark tone at both gradient endpoints.

The harness fixes device scale and viewport size and asserts unscaled screenshot coordinates. The tests reproduced the original failures before the style fix. They are part of `npm run check` and therefore run in CI and publishing validation.

## Validation

All 109 test cases passed: 7 unit, 10 button browser regressions, 8 contrast regressions, and 42 stories in each theme. Typechecking, package build, and static Storybook build passed. Desktop and 390px mobile examples were inspected; no horizontal overflow was observed.

This focused pass does not replace physical-device, screen-reader, or cross-browser accessibility review.
