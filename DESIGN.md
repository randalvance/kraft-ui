---
name: Kraft UI
description: A tactile, calm, playful system of paper, cardboard, and stickers.
colors:
  desk: "#f4eee2"
  desk-2: "#e4dac6"
  sheet: "#fbf7ee"
  sheet-warm: "#f9f4e8"
  card: "#fdfaf3"
  paper: "#f6f0e4"
  paper-2: "#efe7d6"
  hover: "#f1e9d8"
  board: "#cfae78"
  board-2: "#a3844f"
  kraft: "#dcc08c"
  kraft-2: "#b3905a"
  mat-green: "#8fb08a"
  mat-green-2: "#5f8a5e"
  mat-red: "#cf6a52"
  mat-red-2: "#9e4530"
  mat-red-3: "#6b2a1c"
  ink: "#2a2219"
  mute: "#6f6252"
  faint: "#72654f"
  line: "#d9ccb1"
  rule: "#dfe5ee"
  bar: "#b9a98a"
  white: "#ffffff"
  sticker-cut: "#ffffff"
  red: "#c8553d"
  red-2: "#8f3a2a"
  blue: "#3b5b9a"
  blue-2: "#2a4070"
  on-blue: "#ffffff"
  green: "#5b8c5a"
  amber: "#b8792f"
  ochre: "#c7935a"
  ochre-soft: "#d9b48a"
  teal: "#4a8f99"
  violet: "#8b6bb3"
  plum: "#8d4f75"
  attention: "#f0c24a"
  on-attention: "#2a2219"
  highlighter: "#fff0a0"
  highlighter-2: "#d9b84a"
  tape: "#f1e3a6b8"
  edge: "#cbbc9a"
  edge-2: "#a89570"
  amb: "rgba(60,40,15,0.36)"
  amb-2: "rgba(60,40,15,0.22)"
  face: "rgba(255,255,255,0.16)"
  gloss: "rgba(255,255,255,0.30)"
  veil: "#2a221959"
  marker: "#ffe775"
  st-green: "#497048"
  st-amber: "#936126"
  st-red: "#a04431"
  rail: "#c9a86f"
  panel: "#cfae78"
  deck-1: "#ede4d2"
  deck-2: "#e6dcc8"
  shadow: "#cdbf9f"
  blush: "#e8a9a2"
  cork: "#b98c5e"
  cork-2: "#7a5634"
  stamp-ground: "#fffdf8cc"
  stamp-ground-soft: "#fffdf88c"
  knob: "#ffffff"
  glass: "#fffdf780"
  mark-gloss: "rgba(255,255,255,0.08)"
  link-paper: "#2d4a80"
  text-muted-paper: "#5b4f40"
  ink-kraft: "#2a2219"
  link-kraft: "#20324e"
  text-muted-kraft: "#3c2f1e"
  link-board: "#18283f"
typography:
  heading-lg:
    fontFamily: "\"Fraunces\", Georgia, serif"
    fontSize: "20px"
    lineHeight: 1.25
    fontWeight: 600
  heading:
    fontFamily: "\"Fraunces\", Georgia, serif"
    fontSize: "17px"
    lineHeight: 1.25
    fontWeight: 600
  heading-sm:
    fontFamily: "\"Fraunces\", Georgia, serif"
    fontSize: "15px"
    lineHeight: 1.25
    fontWeight: 600
  said:
    fontFamily: "\"Fraunces\", Georgia, serif"
    fontSize: "16px"
    lineHeight: 1.5
    fontWeight: 500
  cover:
    fontFamily: "\"Fraunces\", Georgia, serif"
    fontSize: "120px"
    lineHeight: 0.95
    fontWeight: 600
    letterSpacing: "-0.01em"
  body:
    fontFamily: "\"Nunito\", system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
    fontWeight: 400
  label:
    fontFamily: "\"Nunito\", system-ui, sans-serif"
    fontSize: "13px"
    lineHeight: 1.2
    fontWeight: 800
  label-sm:
    fontFamily: "\"Nunito\", system-ui, sans-serif"
    fontSize: "12px"
    lineHeight: 1.2
    fontWeight: 700
  badge:
    fontFamily: "\"Nunito\", system-ui, sans-serif"
    fontSize: "11px"
    lineHeight: 1
    fontWeight: 900
  greeting:
    fontFamily: "\"Caveat\", cursive"
    fontSize: "50px"
    lineHeight: 1
    fontWeight: 600
  title:
    fontFamily: "\"Caveat\", cursive"
    fontSize: "38px"
    lineHeight: 1.05
    fontWeight: 600
  title-compact:
    fontFamily: "\"Caveat\", cursive"
    fontSize: "26px"
    lineHeight: 1.05
    fontWeight: 600
  hand:
    fontFamily: "\"Caveat\", cursive"
    fontSize: "17px"
    lineHeight: 1.25
    fontWeight: 500
  chip:
    fontFamily: "\"Caveat\", cursive"
    fontSize: "15px"
    lineHeight: "16px"
    fontWeight: 600
  code:
    fontFamily: "\"Courier New\", Courier, ui-monospace, monospace"
    fontSize: "12px"
    lineHeight: 1.5
    fontWeight: 400
rounded:
  radius-2: "2px"
  radius-3: "3px"
  radius-4: "4px"
  radius-5: "5px"
  radius-7: "7px"
  radius-9: "9px"
  radius-10: "10px"
  radius-pill: "999px"
  radius-round: "50%"
spacing:
  space-2: "2px"
  space-3: "3px"
  space-4: "4px"
  space-6: "6px"
  space-8: "8px"
  space-10: "10px"
  space-12: "12px"
  space-14: "14px"
  space-16: "16px"
  space-24: "24px"
components:
  button-neutral:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-4}"
    padding: "8px 14px"
  button-blue:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.on-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-4}"
    padding: "8px 14px"
  button-sage:
    backgroundColor: "{colors.mat-green}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-4}"
    padding: "8px 14px"
  button-danger:
    backgroundColor: "{colors.mat-red-2}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-4}"
    padding: "8px 14px"
  button-attention:
    backgroundColor: "{colors.attention}"
    textColor: "{colors.on-attention}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-4}"
    padding: "8px 14px"
  button-sm:
    rounded: "{rounded.radius-4}"
    padding: "5px 10px"
  button-lg:
    rounded: "{rounded.radius-4}"
    padding: "12px 16px"
  icon-button:
    width: "44px"
    rounded: "{rounded.radius-10}"
    padding: "9px"
  icon-button-sm:
    width: "28px"
    rounded: "{rounded.radius-round}"
    padding: "5px"
  icon-button-lg:
    width: "48px"
    rounded: "{rounded.radius-10}"
    padding: "9px"
  surface-paper:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius-4}"
    padding: "{spacing.space-24}"
  surface-kraft:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.ink-kraft}"
    rounded: "{rounded.radius-4}"
    padding: "{spacing.space-24}"
  surface-cardboard:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius-10}"
    padding: "{spacing.space-24}"
  paper-panel:
    backgroundColor: "{colors.board}"
    contentColor: "{colors.sheet-warm}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius-10}"
    contentPadding: "{spacing.space-24}"
  checkbox:
    backgroundColor: "{colors.card}"
    checkedColor: "{colors.blue}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius-4}"
    width: "20px"
    height: "20px"
  toggle:
    backgroundColor: "{colors.rail}"
    checkedColor: "{colors.blue}"
    knobColor: "{colors.knob}"
    rounded: "{rounded.radius-pill}"
    width: "44px"
    height: "26px"
  link:
    textColor: "{colors.link-paper}"
  badge:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius-pill}"
    padding: "5px 9px"
  sticker:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.on-blue}"
    rounded: "{rounded.radius-round}"
    padding: "8px"
    width: "64px"
    height: "64px"
---
# Design System: Kraft UI

## Overview

**Creative North Star: "The Desk of Cut-outs"**

The Desk of Cut-outs makes structure feel assembled by hand: cardboard holds things, paper carries words, and stickers mark things. Materials provide warmth and hierarchy, while small, deliberate moments of play keep the interface calm and useful.

Components are tactile and dependable. Light comes from the top left; cut edges and shadows fall down and right. Night is the same desk after dark, preserving material relationships and behavior rather than replacing the world.

**Key Characteristics:**

- Materials communicate structure and warmth.
- Playfulness is small and deliberate.
- Native semantics and visible states make interaction dependable.
- Paper and Night share one geometry and material vocabulary.

## Colors

Warm paper neutrals and earthy material faces support a small set of printed accents. The frontmatter records normative Paper values under their existing descriptive names; the sidecar records Night overrides. Theme values originate in `src/tokens.json` and are emitted as scoped CSS custom properties.

### Primary

- **Blue** identifies blue actions and the default sticker; links use material-aware ink roles, while `blue-2` supplies its cut edge and `on-blue` its text.
- **Attention** marks deliberate emphasis, paired with `on-attention` and the `highlighter-2` edge.

### Secondary

- **Mat green / sage** distinguishes the sage button; **st-green** supplies the separate badge and sticker face.
- **Mat red** provides the danger button's face and edge; **st-red** provides the danger badge and sticker face. These are separate material assignments, not interchangeable tones.
- **Red, green, amber, ochre, teal, violet, plum, blush, marker, and highlighter** remain available palette tokens. Their presence does not introduce additional component variants.

### Neutral

- **Desk / desk-2** set the surrounding ground. **Sheet, sheet-warm, card, paper, paper-2, and hover** describe paper layers and state surfaces.
- **Board / board-2** and **kraft / kraft-2** pair material faces with darker edges. Rail, panel, deck, cork, and their companions extend the material vocabulary.
- **Ink** and **mute** remain foundation colors; components select the readable material-specific roles below. **Faint** carries disabled text. **Line, rule, and bar** provide supporting marks.
- **Edge, edge-2, amb, amb-2, shadow, face, and gloss** support depth and surface light. **White, sticker-cut, tape, veil, stamp-ground, stamp-ground-soft, knob, and glass** cover cuts, overlays, and translucent treatments.

**The Material Rule.** Cardboard holds things, paper carries words, and stickers mark things.

### Readable foreground roles

- **link-paper / text-muted-paper** supply link and secondary ink on the desk and paper surfaces.
- **ink-kraft / link-kraft / text-muted-kraft** supply ink on kraft surfaces. Night kraft deliberately uses its readable primary ink for secondary copy rather than lowering its contrast.
- **link-board** supplies labels rendered as links on cardboard; secondary labels use ink. Cardboard remains structural support rather than a body-copy ground.
- **mark-gloss** is the bounded highlight for badges and stickers. It preserves their printed finish without washing out small labels. The original gloss palette token remains available for illustration.

Surface establishes `--kraft-content-ink`, `--kraft-content-link`, and `--kraft-content-muted` for its own material. Each nested Surface and ThemeProvider resets these roles, so outer material ink cannot leak into an inner piece.

**The Readable Ink Rule.** Validate text against the fully painted material, including gloss and texture, in both themes; a passing solid swatch is not enough.


## Typography

**Display Font:** Fraunces, with Georgia and serif fallbacks.

**Body Font:** Nunito, with system-ui and sans-serif fallbacks.

**Written Font:** Caveat, with cursive fallback.

**Mono Font:** Courier New, Courier, ui-monospace, monospace.

Printed serif headings establish hierarchy, rounded sans text keeps controls legible, and handwritten accents add a restrained personal mark. The application loads fonts; the library does not fetch them.

### Hierarchy

- **Heading** uses the heading-sm, heading, and heading-lg roles through `Heading` sizes sm, md, and lg. `Heading` defaults to an h2; choose semantic level independently with `as`.
- **Title** is the handwritten `Heading` size title.
- **Body, label, label-sm, hand, and code** are the implemented `Text` variants. Body text has a maximum measure of 72ch; code uses tabular numerals.
- **Said, cover, badge, greeting, title-compact, and chip** are foundation typography tokens, not additional `Text` variants. Said's italic style and cover's optical-size setting are recorded in the sidecar because frontmatter does not support them.
- Buttons use label typography; badges and stickers have their own observed compact sans treatment, recorded with their geometry in the sidecar.

## Layout

Box provides padding; Stack and Inline add column and row flex composition. Both use space-8 as their default gap. Their shared API supports the existing spacing steps plus zero, alignment, justification, and optional wrapping. Each Box, Stack, and Inline resets its own padding and gap defaults, so nested layouts do not inherit a parent’s spacing. Surface accepts padding with a space-24 default; place Stack or Inline inside it for gap, alignment, justification, or wrapping. Box and text allow content to shrink and wrap; Inline wraps only when requested.

There is no library-wide grid, fixed container width, or responsive breakpoint. Applications compose responsive layouts for their surfaces. The Storybook desk arrangement is a documented surface composition rather than a rule for every consumer.

## Elevation & Depth

Depth is structural: a crisp material edge sits beneath a face, followed by a directional ambient shadow. Surface face gradients reinforce top-left light. Paper and board use distinct shadows; Night changes their pigments and shadow strength while retaining geometry. Exact shadow values live in the sidecar and source tokens.

### Shadow Vocabulary

- **lift-paper-1 / 2 / 3:** increasing paper depth, used by non-cardboard Surface elevations.
- **lift-board:** cardboard Surface depth; cardboard retains this shadow at nonzero elevations.
- **lift-board-sm / up and press-board:** the structural vocabulary reflected by button rest, hover, and press treatments, with the button's own variant edge color.
- **lift-mat / frame, press-paper, and recess:** available foundation depth tokens; they do not imply further components.
- **sticker / sticker-s / sticker-on:** zero-offset cut outlines, not cast shadows. Badge uses the small cut; Sticker uses the standard cut.

**The Cut-edge Rule.** Light comes from the top left. Structural edges and cast shadows travel down and right; sticker outlines never become cast shadows.

## Shapes

Paper and kraft Surface use radius-4; cardboard Surface uses radius-10. Buttons retain radius-4 at every size, including large. Icon buttons use radius-10 except the round small variant. Badges are pills; stickers offer round, pill, and square shapes, with square using radius-10. The exact component geometry is carried by frontmatter and the sidecar snippets.

Surface outlines lightly mix the material edge with transparency. Button edges are solid. Dashed separators are printed divisions rather than raised edges. Sticker cuts surround the face without adding a directional shadow. Texture, motion, and decorative tilt can each be disabled at a ThemeProvider boundary.

## Components

### Theme and composition

`ThemeProvider` scopes Paper or Night and the texture, motion, and tilt switches. `Box`, `Stack`, `Inline`, `Text`, `Heading`, and `Surface` accept `as` for native semantic composition and support refs. Choose semantic elements to match their actual function.

### Buttons

Tactile and dependable. `Button` has neutral, blue, sage, danger, and attention variants, and sm, md, and lg sizes. It defaults to native button semantics with type button. Hover lifts unpressed controls up and left; active and `aria-pressed="true"` travel down and right and reduce the shadow. Pressed toggles remain depressed on hover. Text buttons shrink to their available inline size and wrap long labels without truncation, including in flex and grid layouts; icon buttons retain their fixed geometry. Focus draws an ink outline with a clear offset. Disabled uses a quieter paper face; loading keeps its label, adds a small mark, disables activation, and announces busy state.

`IconButton` shares Button behavior and requires an accessible label. Its sizing and corner treatment differ from the text button; small icon buttons are exactly 28×28px with 16px glyphs; other icon sizes use 20px glyphs. During loading, the busy mark replaces the action icon. Small controls need suitable spacing or another WCAG 2.2 AA target-size accommodation in their composition.

**The Dependable Press Rule.** Buttons depress toward their cut edge and never tilt. Stickers stay upright in every shape; decorative rotation is reserved for paper.

### Checkboxes and toggles

Small, printed, and native. `Checkbox` is a 20px paper box with a recessed face and a muted ink edge; checking fills it with blue and a hand-weight check, and `indeterminate` shows a dash. Checked boxes gain a crisp cut edge down and right. `Toggle` is a native checkbox with `role="switch"`: a 44×26px recessed rail carrying a round paper knob that slides toward the end when on. The rail turns blue when on; Night uses the deeper blue-2 so the knob keeps contrast against it, and the knob travels toward the start in right-to-left text.

Both wrap the input in a label so the box and its text form one target. Focus draws the ink outline around the box or rail. Hover darkens the unchecked edge; press nudges the box down and right. Disabled uses the quiet paper face with a softened but visible edge, and the check or knob position still shows the state. An optional description sits under the label in secondary ink and is announced as the input's description rather than being part of its name. Use `Toggle` for settings that apply immediately and `Checkbox` for choices submitted later; pressed actions remain `Button` with `aria-pressed`.

**The Visible State Rule.** Checked, mixed, and on states change shape as well as color: a check, a dash, or a knob position.

### Surfaces

Paper carries content; kraft warms a paper-like panel; cardboard supplies support. `Surface` offers paper, cardboard, and kraft materials, elevations 0–3, and padding. Compose its contents with Stack or Inline when flex layout is needed. Elevation 0 removes the shadow for all materials; elevations 2 and 3 deepen only paper and kraft. It does not make a surface interactive.

`PaperPanel` standardizes a workspace sheet. Its board-colored header holds a title, optional leading mark, and controls; optional navigation sits directly below. The paper body has a thin dividing edge, a 24px inset, and a 220px minimum height even when empty. An optional footer returns to the frame material. The title labels the section, and `titleAs` follows the page's heading order. Callers supply control behavior and content. Size the empty body through `--kraft-panel-body-min-height` when the surrounding layout needs more space. Change `--kraft-panel-frame` and `--kraft-panel-frame-edge` together for a tinted workspace frame, then validate ink contrast against that tint in both themes.

### Links and separators

`Link` remains a native anchor, blue and underlined, with a thicker underline on hover and the same visible focus treatment as buttons. `Separator` renders horizontal or vertical dashed divisions and exposes separator semantics unless decorative.

### Badges and stickers

`Badge` is a compact printed mark, neutral by default. `Sticker` is a larger cut-out, blue and round by default, with round, pill, and square shape choices and no decorative rotation. Both share neutral, blue, sage, danger, and attention tones. They are spans rather than controls; `Sticker` can be marked decorative to hide it from assistive technology. All sticker shapes stay upright, independent of theme-level tilt. Round stickers have a fixed 64px diameter set by `--kraft-sticker-size`; use pills for longer labels.

## Do's and Don'ts

### Do:

- **Do** use material changes to communicate structure before adding decoration.
- **Do** keep buttons straight and preserve their visible pressed state.
- **Do** load the chosen fonts in the consuming application and keep the fallback stacks intact.
- **Do** target WCAG 2.2 AA with native semantics, visible keyboard focus, accessible names, sufficient contrast, and reduced motion.
- **Do** use scoped Paper and Night theme boundaries and honor texture, motion, and tilt preferences.

### Don't:

- **Don't** give stickers cast shadows or rotate them.
- **Don't** rotate interactive buttons.
- **Don't** use accent or material tokens as text colors without checking contrast against the actual background.
- **Don't** treat catalogued token names as evidence of an implemented control.
