# @randalvance/kraft-ui

## 0.6.0

### Minor Changes

- 7ff2ac7: Add AppShell for the diorama page layout: a rail of navigation tiles, an optional top bar, an optional cardboard board, and one paper sheet filling the viewport with a 3px margin, where each region scrolls on its own and the sheet can keep a fixed head. On narrow shells the board becomes a dismissible overlay opened from the rail. Add RailTile, a 44px navigation card tile in any card tone that renders any router link through `as`, presses flat for the current page, and carries a count badge and a tooltip.
- c6e5098: Add `Kbd` for keycap hints, one key or a chord such as `keys={['Ctrl', 'K']}`, in `sm` and `md` sizes. SearchField gains a `trailing` slot for a Kbd or a count that stays clear of the native clear button, and an `icon` prop to replace or remove the leading mark. SearchField's frame now draws the paper: `className` and `style` size the whole field, so it can share a flex row without a wrapper, and the new `inputClassName` and `inputStyle` reach the input. Adds the `KbdProps` and `KbdSize` types.
- b529585: Fix Night theme contrast. `--kraft-red-2` and `--kraft-blue-2` are now light tints in Night, so red and blue text is readable on night paper. A new `--kraft-blue-deep` token keeps the deep blue for button and checkbox edges, the Night toggle rail, the navy tone, and avatar marks. Use the documented `--kraft-content-danger` ink role for danger text: it follows the material and theme, and form errors and destructive menu items now use it. Destructive menu items in Night no longer use the raw `--kraft-red`. Night `--kraft-green` is lighter so a green dot stays visible on a highlighted (picked) row. Icons on a Badge or Sticker print in the mark's ink, so a yellow glyph on an attention Sticker stays visible. Checkbox and toggle faces no longer fade between colors, so switching themes doesn't flash unchecked checkboxes dark.
- 565b7ae: Widen the type range. Text gains `serif` and italic `lead` variants, a `size` for the hand variant from 17px to a 52px display size, and `faint`, `danger`, and `attention` tones that stay readable on paper, kraft, and cardboard in both themes. Heading gains handwritten `title-sm` and `display` sizes. `measure={false}` on Text and `balance={false}` on Heading turn off the 72ch cap and balanced wrapping, and code text in a `pre` is no longer capped. Link gains `tone="inherit"` and `underline="hover"` for links inside headings. Adds the `TextVariant`, `TextTone`, `HandSize`, `HeadingSize`, and `LinkProps` types and nine `text-*` ink tokens.

## 0.5.0

### Minor Changes

- 507e118: Add compact ActionableList and TreeView rows with rich labels and descriptions, optional ellipsis and line clamping, flexible trailing detail, done styling, and reserved hover and focus actions. TreeView supports plain branches and typeahead for rich labels. ActionableListItem renders static content when given neither a destination nor an activation callback.
- 39d58af: Add leading media, trailing notes, checked-label strikethrough, and a pen-tick variant to Checkbox. Add CheckboxStatus for static marks and CheckboxGroup for labeled checklists with dashed row rules, responsive columns, and an optional tally.
- 104d7b2: Add `Tag` in kraft and paper variants with optional icons or color swatches. Tags truncate long labels, support native links and buttons, and can include a separately named removal control.
- edfbdfb: Add underlined text fields in four sizes, ruled textareas with optional monospaced text, auto-grow and a counter footer, and small uppercase field labels. Add InlineEdit for editing handwritten titles in place and a compact Select trigger that shows the selected option’s icon, status dot and label.
- 3daf975: Add rich headings, eyebrow slots, and header actions to Dialog and Drawer. Dialog supports three widths and keeps its top edge steady as content changes. Drawer supports an optional close button and a scrolling footer. ResizablePane fills its container with independently scrolling columns and supports stacked drawers in the side pane.

### Patch Changes

- b7403c0: Keep the paper-theme blue Button label at 4.5:1 across the whole face by multiplying the paper texture instead of letting its light fibres lighten the blue beneath white ink.

## 0.4.0

### Minor Changes

- 6bbc12d: Add small and count sizes to Badge and Sticker. Mark labels stay on one line and preserve their width in flex layouts.
- 5a2ae05: Add FormSection for titled paper form groups and PageHeader for persistent edit-page navigation and actions. Document accessible save status and setting row compositions.
- d575d8c: Add Stamp, an outlined paper ink mark with an optional signature, a native toggle form, and theme-aware tilt and stamp-down motion.
- 0c492af: Add Card and CardAddTile for paper grids, with optional colour spines, off and selected states, and native whole-card activation alongside independent controls.
- 642ff98: Add CorkBoard, a cork board in a wooden frame with a scrolling body and grid, free-position, and column layouts. CorkBoardItem places things by coordinates with a z-order and can be moved with the arrow keys. CorkBoardColumn adds a pinned kraft header with a name and count for Kanban boards. Pin draws a tack in four tones as a decoration or as a button to unpin.
- fb04d7a: Add ghost, text, and dashed Button variants, a leading icon slot, and flat pressed states. Add a bare IconButton variant and a corner badge slot. Button labels now stay on one line by default. Set `wrap` on buttons whose labels need to flow across lines.
- 6bbc12d: Add SegmentedControl and ToggleChips for native single- and multi-select form choices, with joined and separate chip layouts, highlighter and ink selection, option counts, and second lines.

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
