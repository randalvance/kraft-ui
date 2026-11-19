# @randalvance/kraft-ui

## 0.3.0

### Minor Changes

- af6aef1: Add StickyNote with five paper tones, a curled corner, theme-controlled rotation, and header, body, and footer slots. Use a native button for pressable notes and show selection, waiting, and done states in Paper and Night themes.
- 920d3ed: Add Avatar portraits, monograms, and glyphs with a white cut border, optional labelled corner status, and theme-controlled tilt. Add overlapping AvatarGroup lists with overflow counts and AvatarPicker native radio choices with selection rings and visible keyboard focus.
- 7161127: Add Prose for long-form reading rhythm across headings, paragraphs, lists, links, rules, tables, inline code, code blocks, quotes, and todo items that strike through when ticked. Add CodeBlock for recessed monospaced code with an optional language label, copy button, line numbers, and added or removed line marks. Add Code for inline code chips and Blockquote for quotes beside a thick highlighter rule.

## 0.2.0

### Minor Changes

- edbb5a3: Add Mat for inset paper sheets, Tape for decorative edge and corner accents, and Pinwheel for row and button loading states. Button and IconButton now share the motion-aware Pinwheel while loading.
- 82b59db: Add Table and TableRowAction for native paper tables with sticky column heads, row groups, current and dimmed rows, and an empty state. Add DescriptionList for stacked or inline label-value pairs with one or two columns and optional actions.

## 0.1.0

### Minor Changes

- 1383ac9: Add a generic TreeView with hierarchical ARIA semantics, keyboard navigation, controlled or uncontrolled expansion and selection, optional row details, and Paper and Night styling.
- c0651eb: Introduce Kraft UI: paper, cardboard, and sticker primitives; scoped Paper and Night themes; token-based layout and typography; accessible native controls; and component documentation.
- 5e88af4: Add PaperPanel, a titled paper workspace with controls, navigation, footer, and an empty content state.
- b13ceb7: Add Checkbox and Toggle, native form choices with labels, optional descriptions, an indeterminate checkbox state, and an on/off switch drawn as a knob in a recessed rail.
- 28e13c3: Add native paper text, search, and multiline fields with connected labels, hints, and validation messages.
- 73369e3: Add radio choices, popover, action menu, single choice select, actionable list rows, and a resizable drawer layout.
- 2d8cdbb: Add paper Tabs with linked panes, controlled and uncontrolled selection, horizontal and vertical layouts, and keyboard navigation.
- 228bc5b: Add a theme-aware Tooltip and a provider for shared hover timing across nearby controls.
- b7b9c37: Add a controlled modal Dialog with native focus containment, Escape and backdrop dismissal, optional description and footer, and Paper and Night styling.
- 8daf5ca: Add Icon with 48 typed, single-ink glyphs, configurable sizing, native SVG refs, and decorative-by-default accessibility. Export individual glyph definitions and createIcon for tree-shaken application subsets, with Storybook examples for controls, tabs, badges, and list rows.
- 37cc0db: Let Tabs link to application-rendered panes, sit flush inside a Drawer or Dialog, or scroll a pane within a fixed height. Add named icon tabs with tooltips, second-line descriptions, and directional cues when the tab strip overflows. Use the trailing slot for count badges and status ticks.

### Patch Changes

- c0651eb: Fix painted text contrast on badges, stickers, and material surfaces. Add material-aware foreground roles and bounded mark gloss while preserving the base material colors and textures. Add browser screenshot and full-texture contrast regressions.
