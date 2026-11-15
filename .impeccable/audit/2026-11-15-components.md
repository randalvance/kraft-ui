# Kraft UI component audit — 15 November 2026

> Follow-up, 16 November: both P1 issue families are resolved. See [P1 verification](2026-11-16-p1-verification.md). P2 and P3 remain open; the original audit below records the pre-fix state.

## Implementation integrity verdict

**Coherent system; contrast work remains before the WCAG AA target can be claimed.** Paper, cardboard, printed marks, scoped themes, and native semantics consistently implement Kraft UI's design. No component source was changed during this audit.

## Audit health

| Dimension | Score | Evidence |
| --- | --- | --- |
| Accessibility | 2/4 | Native keyboard focus works; rendered text contrast fails in several supported combinations. |
| Performance | 3/4 | Lean 3.5kB JS; four inline texture images dominate CSS transfer. |
| Theming | 3/4 | Nested themes/preferences work; foreground roles need material-aware contrast validation. |
| Responsive design | 3/4 | 320px reflow and text-spacing probes pass; physical devices and full browser zoom remain untested. |
| Implementation integrity | 3/4 | Consistent material system; generic data-attribute layout selectors escape the component scope. |
| **Total** | **14/20 — Good** | **A solid foundation with release-blocking contrast defects.** |

Counts: **0 P0, 2 P1, 1 P2, 1 P3**. Counts represent issue families, not each affected color pair. This technical score uses a different rubric from the earlier Nielsen critique.

## P1 — Gloss causes small-label contrast failures

Category: Accessibility / Theming. Location: `src/styles.css:65–70`, Badge and Sticker.

Rendered foreground/background contrast beneath actual glyph locations:

| Component | Theme | Minimum measured ratio |
| --- | --- | --- |
| Neutral Badge | Night | 4.19:1 |
| Sage Badge | Paper | 4.22:1 |
| Sage Badge | Night | 4.38:1 |
| Blue pill Sticker, “A printed mark” | Paper | 4.36:1 |

These 12px labels fall below the 4.5:1 minimum for normal text under [WCAG SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). The scan's earlier warnings are no longer only gradient estimates: screenshot pairs confirm low-contrast backgrounds beneath the rendered text. The blue round Sticker inspected in Paper passes at 5.32:1; shape and label placement change which part of the gloss sits behind text.

Impact: small status and identity labels become difficult to read for users with reduced contrast sensitivity. Base token ratios alone do not describe the painted result.

Recommendation: reduce or constrain gloss over text, or adjust component foreground/face pairings. Verify the complete rendered treatment across both themes and shapes. Preserve the material identity. Suggested command: `/impeccable harden`.

Evidence: `../audit-evidence/2026-11-15/pixel-contrast.json` and paired `*-text.png` / `*-background.png` captures.

## P1 — Foregrounds are not safe across supported textured surfaces

Category: Accessibility / Theming. Locations: `src/styles.css:31` (muted Text), `:36` (Surface), and `:61` (Link).

Equivalent public-component markup was composed in a temporary browser-only surface matrix. Its CSS uses the actual library stylesheet and fonts; no component implementation was edited.

| Composition | Theme | Minimum measured ratio |
| --- | --- | --- |
| Link on kraft Surface | Paper | 3.00:1 |
| Link on kraft Surface | Night | 1.96:1 |
| Link on paper Surface | Night | 3.94:1 |
| Muted Text on paper Surface | Paper | 4.13:1 |
| Muted Text on kraft Surface | Paper | 2.55:1 |
| Muted Text on kraft Surface | Night | 2.52:1 |

The kraft pairs fail broadly across the glyphs; the paper pairs contain lower-contrast texture regions. All are normal-size text under SC 1.4.3. The raw matrix also includes cardboard measurements, but body copy on cardboard is outside the documented material intent and is not counted as an additional defect.

Impact: individually sensible tokens become unreadable when developers compose reusable text/link primitives onto supported materials.

Recommendation: establish foreground roles for each material/theme and constrain texture luminance under text. Include rendered composition tests rather than validating only solid color swatches. Suggested command: `/impeccable harden`.

Evidence: `../audit-evidence/2026-11-15/surface-contrast.json` and `surface-composition-{text,background}.png`.

## P2 — Layout selectors affect host content outside Kraft

Category: Implementation integrity. Location: `src/styles.css:15–23`.

Bare selectors such as `[data-align="center"]`, `[data-justify="between"]`, and `[data-wrap="true"]` match unrelated application elements. A foreign flex element outside any Kraft provider changed from `align-items: normal` to `center`, and gained wrapping, solely by receiving those generic attributes.

Impact: importing the stylesheet can alter another component library or application's layout.

Recommendation: scope the attribute selectors to Kraft classes, such as `.kraft-box[data-align="center"]` and `.kraft-inline[data-wrap="true"]`. Keep the documented root token defaults separate from component layout rules. Suggested command: `/impeccable harden`.

Evidence: `../audit-evidence/2026-11-15/runtime-results.json`, isolation record.

## P3 — Optional stylesheet payload reduction

Category: Performance. Location: `dist/kraft-ui.css`, generated from `src/tokens.css` and four material textures.

The built stylesheet is 126,921 bytes (89,673 gzip); JS is 3,481 bytes (1,220 gzip). Both themes' four PNG tiles are embedded as data URLs, so consumers transfer all four even when using a single theme or disabling texture.

Impact: avoidable initial CSS transfer. No frame-rate or interaction performance failure was established.

Recommendation: evaluate external, cacheable texture assets or optional texture/theme entry points while retaining the current appearance and simple default API. Suggested command: `/impeccable optimize`.

## Verified positives

- Native Tab order skips disabled/busy controls. Button, IconButton, and Link acquire `:focus-visible` with a 2px solid outline and 5px offset in both themes. Real Playwright keyboard input generated the evidence; this resolves the earlier automation uncertainty. Screenshots are archived.
- Enter and Space activate the named Button as expected.
- Reduced motion removes transitions while preserving the depressed selected state. Forced-colors emulation retains solid borders, removes shadows, and supplies system foreground/background colors.
- Nested Night and quiet providers override their own theme, texture, and motion without altering the outer Paper controls. Stickers remain upright.
- 320px reflow and standard text-spacing overrides produced no measured clipping in the representative composition. Round stickers stayed 64×64px; small icon buttons stayed 28×28px.
- A 28px small button is not automatically a WCAG AA target-size failure: [SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) uses a 24×24 CSS px minimum, subject to its exceptions. Larger targets remain preferable where practical.
- All 99 existing tests passed: 7 unit, 10 button browser regressions, and 41 stories in each theme. Typechecking, package build, and static Storybook build passed. Seven additional audit probes passed.

## Detector and systemic patterns

One bundled detector run over `src`, `stories`, and `.storybook` returned two advisories: an unused preserved bounce easing token (`src/tokens.css:120`) and composition-specific display sizing (`.storybook/preview.css:6`). Neither is a confirmed component defect. No repeat detector run was needed.

The main systemic gap is validating token colors without their composited material treatment. Gloss, texture, shape, and placement can change actual contrast. Passing story accessibility checks did not establish these pixel-level pairs as safe.

## Method and limits

Contrast evidence uses paired browser screenshots, with text temporarily made transparent in the second capture without changing layout. The original/background difference locates glyph pixels; contrast is calculated from the specified foreground against background pixels at those locations. Anti-aliased foreground pixels are not used as the normative foreground color. Font loading completed before capture. Raw coordinates, colors, masks' sample counts, and ratios are archived. Surface probes reproduce the public DOM/classes; runtime interaction probes render the actual React components.

Browser coverage: Chromium, source inspection, Storybook at 1000px for pixel sampling, 320px automated reflow, actual native keyboard input, reduced-motion and forced-colors emulation. No physical touch device, screen-reader session, Safari/Firefox pass, or full browser 200% zoom session was performed. There are no custom drag gestures in this primitive set.

The full suite's successful status is reported separately from the confirmed contrast failures. This is not a WCAG certification.

## Recommended actions

1. **P1 `/impeccable harden`**: fix composited small-label contrast and material-aware Link/muted-Text foregrounds.
2. **P2 `/impeccable harden`**: scope layout data selectors to Kraft elements.
3. **P3 `/impeccable optimize`**: evaluate optional texture payload reduction after correctness work.
4. **`/impeccable polish`**: verify the resulting appearance and state consistency.

These can be addressed together or individually. Re-run `/impeccable audit` after fixes to measure improvement.
