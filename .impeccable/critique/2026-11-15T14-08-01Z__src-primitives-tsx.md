---
target: the components
total_score: 26
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 1
target_identity: "file:/Users/randal/orca/workspaces/kraft-ui/doliolid/src/primitives.tsx"
target_fingerprint: "sha256:27dfa463cd21eab9c767a06da0cde38ceb0a56f62a7261e8389e34bcc42f6cea"
target_path: /Users/randal/orca/workspaces/kraft-ui/doliolid/src/primitives.tsx
timestamp: 2026-11-15T14-08-01Z
slug: src-primitives-tsx
---
Method: dual-agent (A: /root/critique_a · B: /root/critique_b)

# Kraft UI component critique

Target: `src/primitives.tsx` and its Storybook component views. Mode: Read/Operate. No component source was changed.

## Design specificity and overall impression

Kraft feels authored: paper fibres, directional cut edges, printed sticker outlines, serif headings, and handwritten accents share one material vocabulary. Night convincingly preserves the same world. Keep that direction. The biggest opportunity is making component states and extreme content as dependable as their native semantics.

Independent browser assessments agree on long-label overflow and small IconButton geometry. The static detector returned zero findings. Browser overlays reported three gradient contrast risks; these estimates require confirmation against the backgrounds beneath the actual text and are not a completed pixel contrast audit. Reliable overlays remain in the Badge and Quiet [Human] tabs; the temporary overlay server has been stopped.

## Design health

| Heuristic | Score | Main observation |
| --- | --- | --- |
| System status | 2/4 | Busy state exists; its mark becomes unclear in IconButton. |
| Real-world match | 4/4 | Materials and native control conventions reinforce each other. |
| User control | 3/4 | Scoped decoration controls work; app-level undo is outside scope. |
| Consistency | 2/4 | Pressed hover and small-disc geometry contradict the intended states. |
| Error prevention | 3/4 | Safe button defaults; long labels remain unbounded. |
| Recognition | 3/4 | Clear labels and material roles. |
| Efficiency | 3/4 | Native props, refs, semantic composition, and theme controls. |
| Aesthetic restraint | 3/4 | Coherent and focused, with deliberate decoration. |
| Error recovery | n/a | No error-producing transaction belongs to these primitives. |
| Documentation | 3/4 | Good guidance; supported prop combinations need more examples. |
| **Total** | **26/36 — Good** | **72%; focused hardening, rather than a redesign.** |

## What works

- Paper, cardboard, and stickers remain distinct and consistent in both themes.
- Native button/link semantics, required IconButton names, and preserved busy labels support predictable use.
- Long Text and Badge content wraps. Nested quiet preferences and reduced-motion emulation correctly disable transitions; texture and tilt opt-outs work.

## Priority issues

1. **[P1] Long Button labels break narrow layouts.** `src/styles.css:42`. At a 390px viewport, the unbroken test label produces a 669.95px button with a right edge at 693.95px. Both assessments reproduced horizontal overflow, including at 320px in both themes. This clips action wording and forces sideways scrolling. Constrain inline size and permit wrapping without changing IconButton's fixed geometry; add standalone and nested-flex long-label stories. Suggested command: `/impeccable harden`.
2. **[P2] Gloss introduces contrast risks.** `src/styles.css:63`. Browser gradient estimates report Night neutral Badge at 4.0:1, Night sage Badge at 4.2:1, and the Paper blue Sticker in Quiet at 4.2:1, below the intended 4.5:1. These are detector estimates, not confirmed glyph-by-glyph failures. Verify the actual rendered backgrounds under text; reduce gloss or adjust the affected foreground/face pair where necessary. Suggested command: `/impeccable audit`.
3. **[P2] Hover visually releases a pressed toggle.** `src/styles.css:49–50`. The Pressed story retains `aria-pressed="true"`, but hover changes its transform from `(2px,3px)` to `(-1px,-1px)`. The hover selector wins specificity. Keep selected controls depressed through hover and active transitions. Suggested command: `/impeccable harden`.
4. **[P2] IconButton loading crowds its icon and collapses the busy mark.** `src/primitives.tsx:47,51–52`; `src/styles.css:54–58`. Adding loading renders both symbols into the fixed face: the busy mark shrinks to 4px, and on small it spills outside the button. The broken-ring mark is also static. Replace or overlay the icon with a dedicated nonshrinking busy presentation; explicitly choose a static busy glyph or motion-enabled spinner with reduced-motion fallback. Suggested command: `/impeccable harden`, then `/impeccable animate` only if animation is chosen.
5. **[P3] The small round IconButton is an oval.** `src/styles.css:55,57`. Its measured dimensions are 28×32px because the 20px SVG, vertical padding, and border exceed the intended height. Reconcile glyph, inset, and fixed geometry. This is a shape defect, not automatically a target-size accessibility violation. Suggested command: `/impeccable polish`.

## Cognitive load and emotional journey

The eight-item checklist has zero failures for component exploration. Single focus, grouping, hierarchy, progressive disclosure, and low recall demands work. Five-tone galleries are intentional comparison sets, not five competing task actions. The material language creates warm curiosity and satisfying physical feedback; clipped labels and a busy icon's stray crescent interrupt that confidence.

## Persona red flags

- **Riley, stress tester:** long labels and the supported small-plus-loading combination expose missing composition constraints.
- **Sam, accessibility-dependent user:** visual pressed-state disagreement and the contrast estimates need attention. Focus visibility remains unverified in this run: automation moved focus but did not reliably produce `:focus-visible`; the stylesheet contains the expected focus rule.
- **Casey, mobile user:** long action wording escapes the viewport, and the compressed busy mark gives weak progress reassurance.

## Minor observations

A round Sticker with sentence-like content grows large while retaining its circle. It did not overflow in the inspected view; document pills as the better choice for longer labels. Cardboard's different elevation behavior is explicitly documented and is not a defect. No need to add out-of-scope forms, transactions, navigation, or persistence.

## Questions to consider

- Should the busy mark be an intentionally static printed symbol or a spinner with motion and reduced-motion treatments?
- Should round stickers be documented as short marks, with longer labels directed to pills?

## Run notes

A inspected component stories, both themes, desktop and 390px views, pressed/disabled/loading states, and long-content combinations. B performed one static scan and injected four fresh browser views: Button Variants/Paper, Badge Tones/Night, ThemeProvider Quiet/Paper, and IconButton Small/Night. Mutable script injection succeeded. Console findings: three low-contrast estimates. No established false positives; contrast and focus limitations are stated above. The temporary overlay server was stopped with `--keep-inject`; the existing Storybook server was retained. Evidence is archived under `.impeccable/critique-evidence/a/` and `b/`. No implementation changes were made.
