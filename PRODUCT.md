# Kraft UI

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18 and 19 with TypeScript. An installable npm package with an explicitly imported stylesheet and CSS custom properties. No Tailwind or CSS-in-JS requirement.

## Users

React application developers building interfaces and exploring reusable components in Storybook.

## Product Purpose

Provide reusable primitives inspired by paper, cardboard, and stickers. Developers can compose interfaces with a consistent material vocabulary and predictable native HTML behavior.

## Capabilities and Constraints

The library includes tokens, scoped Paper and Night themes, Box, Stack, Inline, Text, Heading, Surface, Mat, Tape, PaperPanel, Card, CardAddTile, StickyNote, CorkBoard, CorkBoardItem, CorkBoardColumn, Pin, Avatar, AvatarGroup, AvatarPicker, Button, IconButton, Pinwheel, Icon, Link, Separator, Badge, Sticker, Stamp, Checkbox, Toggle, FormField, TextField, Textarea, SearchField, RadioGroup, SegmentedControl, ToggleChips, Select, ActionableList, ActionableListItem, TreeView, Table, TableRowAction, DescriptionList, Prose, CodeBlock, Code, Blockquote, Tabs, Tooltip, TooltipProvider, Popover, Menu, Dialog, Drawer, and ResizablePane. Components support native props and refs where applicable, server rendering, and current evergreen browsers. Applications control font loading. Texture, motion, and decoration tilt are configurable. Sticker marks remain upright; Avatar rotation is opt-in. Round stickers, avatars, and small icon buttons use equal width and height.

`Avatar` and `AvatarProps` draw an image (`src`), monogram (`initial`), or icon (`glyph`) as a white-bordered portrait. `size` sets the diameter in pixels (default 36, including 18–84px portraits); `tone` uses the five shared tones. `alt` is required unless `decorative` is true. `tilt` sets optional theme-controlled rotation. `status` takes an `AvatarStatus` with a required `label` and a `working`, `waiting`, `blocked`, `done`, or `idle` tone; the label joins the accessible name and the corner marks differ in shape or stroke as well as color. The native span and ref represent one named image. `AvatarGroup` and `AvatarGroupProps` take `label`, `avatars`, shared `size`, and `max` (default 4), overlap a native list of portraits, and name the remaining count. Its native props and ref reach the list. `AvatarPicker` and `AvatarPickerProps` take `label`, `name`, `options`, `size`, `value` or `defaultValue`, `onValueChange`, `description`, `hideLabel`, `required`, and `disabled`. Each `AvatarOption` supplies a unique `value`, accessible `label`, portrait content, and optional tone, tilt, status, description, and disabled state. Native fieldset props and the ref reach the fieldset. Native radios support form submission, reset, and keyboard navigation; selection has a portrait ring and focus a separate outline around a target of at least 44px.

`Mat` and `MatProps` offer a paper inset with `padding` inside a frame with `tone="kraft" | "amber" | "sage"`. Choose the frame element with `as`. `Tape` and `TapeProps` position a masking-tape strip at any edge or corner with `placement`. `Pinwheel` and `PinwheelProps` provide the shared busy indicator at `size="row" | "button"`. It stays still when theme motion is off or the system prefers reduced motion. Tape and Pinwheel accept an accessible `label` or native ARIA labelling attributes and are decorative by default. `Button` and `IconButton` use the decorative Pinwheel while `loading` and expose their own busy state.

`Card` and `CardProps` provide a paper article with `header`, `media`, `children` (body), `footer`, and `corner`. `tone` adds a spine in any `CardTone`, including ochre, teal, violet, plum, blush, and navy. `off` dims the paper while keeping actions available. `selected` marks the edge and adds a check. `tilt` sets optional theme-controlled rotation. `as="a"` requires `href` and `as="button"` supplies native activation. Both require `aria-labelledby` or `aria-label`, expose selection via `aria-current` or `aria-pressed`, and leave slot controls independently operable. A custom interactive region can set `data-card-interactive` for its own pointer hit area. Native props and the ref reach the action or static article. `className` and `style` style the outer article. `CardAddTile` and `CardAddTileProps` provide a dashed grid button with a plus, a required `label`, native button props, and a button ref. `--kraft-card-min-height` sets the base height of both.

`StickyNote` and `StickyNoteProps` provide a curled paper note with `header`, `children`, and `footer` slots and a numeric `tilt` in degrees that follows the theme setting. `StickyNoteTone` covers `attention`, `blush`, `blue`, `sage`, and `ochre`. `StickyNoteStatus` covers `waiting` (hatched) and `done` (struck body), with visible status text customizable via `statusLabel`. Choose `as="article"` for rich content or `as="button"` for native whole-note activation with optional controlled `selected` state. Native props and the ref reach the chosen element.

`CorkBoard` and `CorkBoardProps` draw cork in a wooden frame with a scrolling body sized by `height` or `maxHeight` and named by `scrollLabel` when it overflows. `CorkBoardLayout` covers `grid` (cells at least `minItemWidth` wide), `free`, and `columns`. `CorkBoardItem` and `CorkBoardItemProps` hold one pinned thing with an optional `pin`; on a free board `x`, `y`, and `z` place and stack it. With `label` and `onMove` it is a named tab stop that the arrow keys move by `step` pixels, reporting a `CorkBoardPosition`. `CorkBoardColumn` and `CorkBoardColumnProps` provide a Kanban column: a named section with a pinned kraft header showing `name`, `count`, and an optional `countLabel`, with `headingLevel` and `pinTone`. `Pin` and `PinProps` draw a tack with a highlight in a `PinTone` of `red`, `blue`, `green`, or `amber`. It is decorative by default, a named image with `label`, or a native button with `as="button"` and a required `label`.

Icon supplies 48 single-ink glyphs: the 29 original design-system icons and 19 application additions. Its props are a typed `name`, optional numeric or CSS-length `size`, optional accessible `label`, and native SVG attributes/ref. It inherits current text color and is decorative and unfocusable by default. Named images use `role="img"`; actions use the enclosing control's accessible name, keyboard handling, and focus. The full `Icon` and `iconNames` catalogue support runtime selection. `createIcon` plus individual definitions (for example `searchIcon`) builds a typed subset so unused glyphs are tree-shaken; `IconName`, `IconProps`, `IconDefinition`, and `NamedIconProps` describe these exports.

`Badge` and `Sticker` accept `size` through `BadgeProps` and `StickerProps`. The shared `MarkSize` covers `default`, `sm`, and `count`. Count marks fit one or two digits in an 18px height. Round stickers measure 64px by default, 36px at `sm`, and 18px at `count`, with `--kraft-sticker-size` available for a custom diameter. Both marks keep labels on one line and retain their width in flex rows.

`Stamp` and `StampProps` print text `children` as an outlined ink impression with an optional `signature` cell. `tone` supports neutral, blue, sage, danger, and attention, and `StampSize` supports `sm`, `md`, and `lg`. Use the default `as="span"` for a static stamp or `as="button"` for a controlled toggle with `pressed` and native `onClick`. The button exposes its state with `aria-pressed`, a dashed or solid impression, and visible keyboard focus. Its text supplies the accessible name. Native props and refs reach the rendered element. The ink follows theme tilt, and opt-in `animate` follows theme motion and system reduced-motion preferences.

`SegmentedControl` and `ToggleChips` expose `SegmentedControlProps`, `ToggleChipsProps`, and the shared `SegmentOption`. Each group takes `label`, `name`, `options`, `hideLabel`, `disabled`, `variant="joined" | "chips"`, and `tone="highlighter" | "ink"`. Each option has a unique `value` and a visible `label`, with optional `count`, `description`, and `disabled`. Counts and second lines describe the native inputs. Both accept `value`, `defaultValue`, and `onValueChange`. `SegmentedControl` uses one string and supports `required`. `ToggleChips` uses an array of strings. Named radios provide arrow-key movement. Checkboxes support Tab and Space. Native fieldset props and refs pass through, including external `form` association. Both submit enabled checked inputs under their form name. Selection uses a dot or checkmark alongside the fill and keyboard focus has its own outline.

`Tabs` and its exported `TabsProps` and `TabItem` support `panel="paper"`, `panel="bare"` for a Drawer or Dialog, and `panel="external"` for application-rendered content linked with `tabId` and `panelId`. Built-in panes take `content` and use `fill` to scroll independently within the available height. Tabs accept a `description` below the label and noninteractive `trailing` content for counts and status marks. `iconOnly` with a `leading` icon preserves the accessible label and reveals it in a tooltip. Overflow cues show where more tabs are available in either orientation.

`Table` and `TableProps` expose `columns`, `rows` or `groups`, `caption`, `empty`, `maxHeight`, and `scrollLabel`. A `TableColumn` supplies `id`, `header`, `align`, and `rowHeader`. `TableRow` supplies `id`, `cells`, `current`, and `dimmed`. `TableGroup` supplies `id`, `caption`, and `rows`. The table uses native headers, an ink rule under the sticky column heads, separate row groups, dashed row rules, and a highlighter mark for the current row. `TableRowAction` and `TableRowActionProps` provide a native button for opening details with pointer or keyboard. The application owns the current row and the drawer.

`DescriptionList` and `DescriptionListProps` display native label-value pairs using `items`, `columns={1 | 2}`, and `layout="stacked" | "inline"`. Each `DescriptionListItem` supplies `id`, `label`, `value`, and optional `action` and `wide`. The two-column layout fits narrow drawers by flowing to one column as space runs out.

`Prose` and `ProseProps` set reading rhythm for headings, paragraphs, lists, links, rules, tables, inline code, code blocks, quotes, and todo items placed inside it, using `as="div" | "article" | "section"`. A list item that starts with a checkbox strikes through when ticked. `Code` and `CodeProps` draw inline code as a chip on a faint strip. `CodeBlock` and `CodeBlockProps` show a recessed monospaced block from `code` with optional `language`, `copyable`, `copyLabel`, `lineNumbers`, `added`, `removed`, and `scrollLabel`. Added and removed lines use native `ins` and `del` with a sign as well as a tint. `Blockquote` and `BlockquoteProps` show a native quotation beside a thick highlighter rule.

## Brand Commitments

The name is Kraft UI. Preserve its established paper, cardboard, and sticker identity. Its character is tactile, calm, and playful.

## Operating Context

Distribute as @randalvance/kraft-ui under MIT. Storybook documents foundations, component states, interactions, accessibility, and compositions, with GitHub Pages deployment from main. Changesets manages versions and changelogs; GitHub Actions validates changes and publishes approved releases using npm trusted publishing. Initial publication is a separate release action.

## Product Principles

- Native semantics make interaction predictable.
- Materials communicate structure and hierarchy.
- Composition starts with small reusable primitives.
- Applications retain control over typography loading and decoration.

## Accessibility & Inclusion

Target WCAG 2.2 AA, including keyboard operation, visible focus, accessible names, contrast, and reduced motion. Decorative treatments must accommodate these requirements.
