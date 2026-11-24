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
  blue-deep: "#2a4070"
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
  text-faint-paper: "#585249"
  text-danger-paper: "#8a3626"
  text-attention-paper: "#704a14"
  text-faint-kraft: "#3a342c"
  text-danger-kraft: "#5e1a0c"
  text-attention-kraft: "#4a2f06"
  text-faint-board: "#30281d"
  text-danger-board: "#4b1106"
  text-attention-board: "#382200"
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

- **Blue** identifies blue actions and the default sticker; links use material-aware ink roles, while `blue-deep` supplies its cut edge and `on-blue` its text. `red-2` and `blue-2` are text inks: in Paper they are deep, and in Night they are light tints that clear 4.5:1 on every night paper, including highlighted rows. Structural deep blue (edges, the Night toggle rail, the navy tone) uses `blue-deep`, which keeps the earlier deep values.
- **Attention** marks deliberate emphasis, paired with `on-attention` and the `highlighter-2` edge.

### Secondary

- **Mat green / sage** distinguishes the sage button; **st-green** supplies the separate badge and sticker face.
- **Mat red** provides the danger button's face and edge. The raised face blends mat-red-2 with mat-red-3 to keep white ink readable over texture. **st-red** provides the danger badge and sticker face.
- **Green** is lifted in Night so a green dot stays at least 3:1 against a highlighted (picked) row.
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
- **text-faint / text-danger / text-attention**, each with a `-paper`, `-kraft`, and `-board` value, supply the `Text` status tones. Every value clears 4.5:1 against the darkest and lightest texel of its ground, so faint ink sits just lighter than muted, and the night kraft values are near-white tints.
- **mark-gloss** is the bounded highlight for badges and stickers. It preserves their printed finish without washing out small labels. The original gloss palette token remains available for illustration.

Surface establishes `--kraft-content-ink`, `--kraft-content-link`, `--kraft-content-muted`, `--kraft-content-faint`, `--kraft-content-danger`, and `--kraft-content-attention` for its own material. `--kraft-content-danger` is the semantic danger text role; form errors and destructive menu items use it, and applications should too rather than choosing a raw red. Each nested Surface and ThemeProvider resets these roles, so outer material ink cannot leak into an inner piece.

**The Readable Ink Rule.** Validate text against the fully painted material, including gloss and texture, in both themes; a passing solid swatch is not enough.


## Typography

**Display Font:** Fraunces, with Georgia and serif fallbacks.

**Body Font:** Nunito, with system-ui and sans-serif fallbacks.

**Written Font:** Caveat, with cursive fallback.

**Mono Font:** Courier New, Courier, ui-monospace, monospace.

Printed serif headings establish hierarchy, rounded sans text keeps controls legible, and handwritten accents add a restrained personal mark. The application loads fonts; the library does not fetch them.

### Hierarchy

- **Heading** uses the heading-sm, heading, and heading-lg roles through `Heading` sizes sm, md, and lg. `Heading` defaults to an h2; choose semantic level independently with `as`.
- **Title** is the handwritten `Heading` size title. `title-sm` uses the title-compact role and `display` is a 52px greeting. Balanced wrapping can be turned off.
- **Body, label, label-sm, hand, serif, lead, and code** are the implemented `Text` variants. Hand runs from 17px through 22, 26, and 38px to a 52px display size. Serif is 15px running copy and lead uses the italic said role. Text has a maximum measure of 72ch that can be turned off and never applies to code in a `pre`; code uses tabular numerals.
- **Link** can inherit the surrounding ink and hold its underline for hover and focus when it fills a heading.
- **Cover, badge, greeting, and chip** are foundation typography tokens, not additional `Text` variants. Said's italic style and cover's optical-size setting are recorded in the sidecar because frontmatter does not support them.
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

Surface outlines lightly mix the material edge with transparency. Raised buttons have solid edges, and the dashed add variant uses a printed outline. Dashed separators mark printed divisions. Sticker cuts surround the face without adding a directional shadow. Texture, motion, and decorative tilt can each be disabled at a ThemeProvider boundary.

## Components

### Theme and composition

`ThemeProvider` scopes Paper or Night and the texture, motion, and tilt switches. `Box`, `Stack`, `Inline`, `Text`, `Heading`, and `Surface` accept `as` for native semantic composition and support refs. Choose semantic elements to match their actual function.

### Buttons

`Button` has neutral, blue, sage, danger, and attention card variants in sm, md, and lg sizes. Raised buttons lift on hover and travel down and right during activation. `ghost`, `text`, and `dashed` are flat by default and show a paper tint on hover. Text actions can use danger ink. A persistent `aria-pressed="true"` has a flat face and inset ink ring, with the same label alignment as its neighbors. The `leading` slot spaces a decorative glyph before the label. Labels stay on one line by default and flow within the available width with `wrap`. Focus draws an offset ink outline. Disabled controls use muted ink. Loading keeps the label, shows a small Pinwheel in place of the leading icon, disables activation, and announces the busy state.

`IconButton` requires an accessible label. Small icon buttons are 28×28px with 16px glyphs, and larger sizes use 20px glyphs. `bare` keeps the hit area and removes the resting card face. The optional corner `badge` holds an upright count sticker. During loading, the busy mark replaces the action icon and the corner badge stays visible.

**The Dependable Press Rule.** Raised buttons depress toward their cut edge during activation. Persistent toggles flatten in place. Buttons and stickers stay upright.

### Checkboxes and toggles

Small, printed, and native. `Checkbox` is a 20px paper box with a recessed face and a muted ink edge; checking fills it with blue and a hand-weight check, and `indeterminate` shows a dash. Checked boxes gain a crisp cut edge down and right. `Toggle` is a native checkbox with `role="switch"`: a 44×26px recessed rail carrying a round paper knob that slides toward the end when on. The rail turns blue when on; Night uses the deeper blue-deep so the knob keeps contrast against it, and the knob travels toward the start in right-to-left text.

Both wrap the input in a label so the box and its text form one target. Focus draws the ink outline around the box or rail. Hover darkens the unchecked edge; press nudges the box down and right. Faces and edges change color instantly; only the tick, the knob, and the press move, so switching themes never shows a box in the previous theme's color. Disabled uses the quiet paper face with a softened but visible edge, and the check or knob position still shows the state. An optional description sits under the label in secondary ink and is announced as the input's description rather than being part of its name. Use `Toggle` for settings that apply immediately and `Checkbox` for choices submitted later; pressed actions remain `Button` with `aria-pressed`.

**The Visible State Rule.** Checked, mixed, and on states change shape as well as color: a check, a dash, or a knob position.

### Form fields

`TextField`, `Textarea`, and `SearchField` are paper strips with a thin cut edge and a shallow shadow. Their ink and placeholders stay readable in Paper and Night. The search mark sits inside the start edge and reverses naturally in right-to-left layouts. SearchField's frame, not its input, carries the paper, so a trailing hint or count sits in flow at the end edge, after the browser's clear button, and the focus outline wraps the whole frame. A replacement mark, such as a funnel, takes the same muted ink and 16px box. `Kbd` keycaps are small sheets with a 2px bottom edge for depth, bold 12px sans ink (11px at `sm`), and a muted plus sign between chord keys; they never tilt. A multiline field keeps the browser's vertical resize affordance. Focus draws the same offset ink outline as other controls; disabled fields use quiet tinted paper without a lifted edge.

`FormField` places a bold label and a short handwritten hint above one native control. A validation message sits below it in red ink while the control gains a dashed red lower edge. The label names the control; hints and errors describe it, and an error also sets its invalid state. Applications decide when validation appears. A field can be used without the wrapper when an external label or accessible name is supplied.

### Radio choices and select

`RadioGroup` lays native radio inputs on individual paper rows. The chosen row carries a highlighter face and a filled ink dot, so its state remains legible without colour. Descriptions sit below their option labels and are announced separately. The group name comes from a visible fieldset legend. Native arrow navigation, validation, and form submission remain intact.

`Select` uses a paper trigger and a paper listbox. The trigger has a cut edge and an ink chevron; the open list highlights the focused and chosen options. Option descriptions add context while the short label remains the accessible option name. Use it for one value, including a form value. Menus express actions instead.

### Popovers and menus

`Popover` is a small, upright paper sheet with a short title, an optional handwritten line, a close target, and a tape mark. It stays nonmodal and returns focus to its trigger after dismissal. `Menu` is a compact paper action list with a printed division and quiet disabled actions; destructive actions use red ink. Both follow the trigger, avoid viewport edges, and support keyboard navigation and Escape. Their interactive behavior comes from unstyled primitives while Kraft owns the materials and spacing.

`Tooltip` is a smaller upright slip of card paper with a thin cut edge and a short shadow. It has no tape, arrow, or controls. The trigger keeps its own accessible name; the slip adds a brief description on hover or keyboard focus. Escape or trigger activation closes it without moving focus. `TooltipProvider` shares a short hover delay across neighboring marks. Longer or interactive content belongs in a Popover.

### Actionable lists and side panes

`ActionableList` makes flat rows from paper strips. The main area is a native button, link, or static content. Optional row actions sit beside it and keep their own focus. Compact rows reduce the inset and gap for long lists. Leading marks are decorative, and descriptive and trailing text contribute to the primary target's name. A current row takes the highlighter face. Done titles strike through in muted ink. Hover actions reserve their space and appear on pointer hover or keyboard focus. Use `TreeView` for nested items and `Select` for a listbox.

`Drawer` is a titled side sheet with a thin dividing rule, scrollable body, and optional footer. `ResizablePane` sets that sheet beside the main content. Its dashed ink divider moves with pointer drag and keyboard arrows, with Home and End reaching size limits. Narrow layouts present the side pane across the available width. The application decides when it opens and where focus goes when it closes.

### Surfaces

Paper carries content; kraft warms a paper-like panel; cardboard supplies support. `Surface` offers paper, cardboard, and kraft materials, elevations 0–3, and padding. Compose its contents with Stack or Inline when flex layout is needed. Elevation 0 removes the shadow for all materials; elevations 2 and 3 deepen only paper and kraft. It does not make a surface interactive.

`PaperPanel` standardizes a workspace sheet. Its board-colored header holds a title, optional leading mark, and controls; optional navigation sits directly below. The paper body has a thin dividing edge, a 24px inset, and a 220px minimum height even when empty. An optional footer returns to the frame material. The title labels the section, and `titleAs` follows the page's heading order. Callers supply control behavior and content. Size the empty body through `--kraft-panel-body-min-height` when the surrounding layout needs more space. Change `--kraft-panel-frame` and `--kraft-panel-frame-edge` together for a tinted workspace frame, then validate ink contrast against that tint in both themes.

### Tree view

`TreeView` gives nested paper items one roving treeitem focus. Branches use a board-colored strip by default and can be plain for a file navigator. Child rows sit beside a dashed connector. The selected row uses a highlighter face and focus has a separate ink outline. Compact rows have shallower insets and can clip rich titles and descriptions. Done titles strike through in muted ink. Separate row actions use native controls and can reveal themselves on hover or focus. Disabled rows retain their shape and hierarchy without responding to input.

Branches expand and collapse. Leaves select by default and branches can opt into selection. Arrow keys follow visible rows and enter or leave branches, Home and End reach the edges, and typing jumps to a matching label. Tab reaches the separate row actions. The tree needs a name, stable unique node IDs, and a label for every item. Application code supplies navigation, filtering, and drag and drop.

### Tabs and panes

`Tabs` joins kraft index tabs to a paper sheet. Unselected tabs use the warmer board face; the active tab shares the pane's paper face and gains a red cut edge. The strip scrolls horizontally when tabs exceed its width. A vertical arrangement places tabs against the sheet's side. Tabs and panes stay upright in both themes. The sheet can hold plain copy or application controls without imposing a content layout.

A named tab list contains one tab stop. Each tab is linked to its pane; the active pane is keyboard focusable, and inactive panes stay mounted but hidden. Arrow keys, Home, and End move focus among enabled tabs. Selection follows focus for immediate content; manual activation waits for Enter or Space when showing a pane takes time. Focus remains distinct from selection, especially in manual mode. Callers provide unique stable IDs, labels, and pane content; they own any data loading within a pane.

### Dialog

`Dialog` lifts a paper sheet above the desk with a quiet ink veil. Its compact header carries a title, optional mark and short supporting line, and a 44px close target. Dotted rules separate the content and optional action footer. The sheet stays upright, centers within the viewport, and scrolls its body when content is long. Paper and Night keep the same material relationship; forced colors replace the sheet edge and shadow with system colors.

The native modal dialog owns the focus boundary and makes the page behind it inert. The title is the default initial focus point; callers can focus a task-specific control instead. Escape, the close target, and a backdrop click request dismissal unless `dismissible` is false. The application owns `open` state, decisions, and action labels. Use a short description for a simple message; keep structured content in the body without repeating it in the dialog description.

### Long-form content

`Prose` gives notes and rendered markdown a calm reading rhythm: printed serif headings, a 72ch measure, muted dash markers, dashed rules, and tables with an ink rule under the head. Inline code is a small mono chip on a faint ink strip. `CodeBlock` is a recessed paper well with a small-caps language label, a small copy disc, an optional line-number gutter, and added or removed lines that carry a sign and an edge as well as a green or red tint. `Blockquote` sets the quote in the said voice beside a thick highlighter rule. A ticked todo item strikes through in secondary ink. None of these tilt or move.

### Links and separators

`Link` remains a native anchor, blue and underlined, with a thicker underline on hover and the same visible focus treatment as buttons. `Separator` renders horizontal or vertical dashed divisions and exposes separator semantics unless decorative.

### Cork boards and pins

`CorkBoard` is the one place the cork tokens appear: **cork** is the speckled face and **cork-2** is the wooden frame and the grain. The cork sits recessed in the frame and scrolls with its contents. Cork holds things and never carries words, so column names sit on a pinned kraft label and notes stay on paper. Column labels tilt one degree when theme tilt is on and stay in view while the board scrolls.

`Pin` is a round tack with a white highlight and an ink rim. The rim keeps every tone distinct on cork and on any note. A button pin has a 28px target, lifts on hover, and is hollow and dashed when disabled. Focus rings for the board, a movable item, and a pin are ink, drawn on cork rather than on the frame, and the item in use comes to the front.

### App shell and rail

`AppShell` is the diorama page. The rail colour is the ground: it frames the page, carries the navigation tiles, and shows through a 3px margin around everything. The optional board is a raised piece of cardboard with a darker cut edge that holds lists and filters, and one paper sheet carries the words. The sheet can keep a fixed head above a body that scrolls on its own. When the shell is narrow, the board lifts off the layout and lies over the sheet beside the rail until it is dismissed.

`RailTile` is a 44px card tile in any card tone, with an icon inked in whichever of dark or light ink keeps 3:1 on its face. The neutral tile is paper, so it stands apart from the rail. Tiles lift on hover and press flat for the current page, with an inset ink keyline so the state never depends on shadow alone. A small ink pill carries the count, and tiles stay upright when theme tilt is on.

### Avatars

`Avatar` is a portrait sticker with a white cut border and no cast shadow. Images fill the circle; monograms and glyphs use the five shared tones with paper texture and readable ink. Diameters run from tiny 18px marks to 84px portraits. A labelled corner status uses a solid, dashed, square, checked, or hollow mark, carrying meaning beyond color. Portraits stay upright by default; their optional tilt follows the theme preference. This opt-in portrait tilt is the exception to the upright sticker rule.

`AvatarGroup` overlaps portraits in a native list and finishes with a named count of those omitted. `AvatarPicker` places portraits inside native radio labels, rings the chosen portrait, and outlines the entire keyboard-focused target separately. Targets remain at least 44px, and the radio labels stay upright even when a portrait tilts. Portrait alt text, option labels, and status labels supply the accessible meaning.

### Stamps

`Stamp` is a transparent ink impression on paper with an outlined frame, Courier capitals, and an optional divided name cell. The toggle has a faded dashed frame when off and a solid impression when on. The ink tilts with the theme while the button target and its focus outline remain upright. An optional quick stamp-down animation respects theme motion and the system reduced-motion preference.

### Status dots and stickers

`StatusDot` is an 8 to 12px mark drawn in a 12-unit box, so its cut ring, 1.5-unit stroke, fixed dash count, and done tick keep their proportions at every size. Each state differs in form as well as hue: working is a solid blue disc, waiting a dashed amber ring, blocked a solid red square, done a green disc with a tick, and idle a hollow grey ring. Paper uses the deep blue, sticker amber, red, and green inks on a white cut; Night uses the lighter blue, amber, red, and green on a desk-dark cut, so every dot keeps 3:1 against its own ring on any material. `StatusSticker` prints bold 11px sans capitals with wide tracking (10px at `sm`) on a radius-4 face: `solid` fills it with the status ink and the small sticker cut, `paper` sets ink on textured sheet inside a tone edge, and `ghost` draws a dashed tone outline over the surrounding material. An indicator dot inside a solid sticker takes the sticker's ink. Neither mark tilts.

### Badges and stickers

`Badge` is a compact printed mark, neutral by default. `Sticker` is a larger cut-out, blue and round by default, with round, pill, and square shape choices and no decorative rotation. Both share neutral, blue, sage, danger, and attention tones. They are spans rather than controls; `Sticker` can be marked decorative to hide it from assistive technology. All sticker shapes stay upright, independent of theme-level tilt. Round stickers have a fixed 64px diameter set by `--kraft-sticker-size`; use pills for longer labels. Marks print in a single ink: an icon on a badge or sticker takes the mark's ink, so an accent-colored glyph, such as an attention-yellow one, cannot disappear into a face of the same hue.

## Do's and Don'ts

### Do:

- **Do** use material changes to communicate structure before adding decoration.
- **Do** keep buttons straight and preserve their visible pressed state.
- **Do** load the chosen fonts in the consuming application and keep the fallback stacks intact.
- **Do** target WCAG 2.2 AA with native semantics, visible keyboard focus, accessible names, sufficient contrast, and reduced motion.
- **Do** use scoped Paper and Night theme boundaries and honor texture, motion, and tilt preferences.

### Don't:

- **Don't** give stickers cast shadows. Keep Sticker marks upright; only Avatar portraits can opt into tilt.
- **Don't** rotate interactive buttons.
- **Don't** use accent or material tokens as text colors without checking contrast against the actual background.
- **Don't** treat catalogued token names as evidence of an implemented control.
