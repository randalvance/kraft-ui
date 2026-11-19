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

The library includes tokens, scoped Paper and Night themes, Box, Stack, Inline, Text, Heading, Surface, Mat, Tape, PaperPanel, StickyNote, Button, IconButton, Pinwheel, Icon, Link, Separator, Badge, Sticker, Checkbox, Toggle, FormField, TextField, Textarea, SearchField, RadioGroup, Select, ActionableList, ActionableListItem, TreeView, Table, TableRowAction, DescriptionList, Prose, CodeBlock, Code, Blockquote, Tabs, Tooltip, TooltipProvider, Popover, Menu, Dialog, Drawer, and ResizablePane. Components support native props and refs where applicable, server rendering, and current evergreen browsers. Applications control font loading. Texture, motion, and paper decoration tilt are configurable. Stickers always remain upright, and round stickers and small icon buttons use equal width and height.

`Mat` and `MatProps` offer a paper inset with `padding` inside a frame with `tone="kraft" | "amber" | "sage"`. Choose the frame element with `as`. `Tape` and `TapeProps` position a masking-tape strip at any edge or corner with `placement`. `Pinwheel` and `PinwheelProps` provide the shared busy indicator at `size="row" | "button"`. It stays still when theme motion is off or the system prefers reduced motion. Tape and Pinwheel accept an accessible `label` or native ARIA labelling attributes and are decorative by default. `Button` and `IconButton` use the decorative Pinwheel while `loading` and expose their own busy state.

`StickyNote` and `StickyNoteProps` provide a curled paper note with `header`, `children`, and `footer` slots and a numeric `tilt` in degrees that follows the theme setting. `StickyNoteTone` covers `attention`, `blush`, `blue`, `sage`, and `ochre`. `StickyNoteStatus` covers `waiting` (hatched) and `done` (struck body), with visible status text customizable via `statusLabel`. Choose `as="article"` for rich content or `as="button"` for native whole-note activation with optional controlled `selected` state. Native props and the ref reach the chosen element.

Icon supplies 48 single-ink glyphs: the 29 original design-system icons and 19 application additions. Its props are a typed `name`, optional numeric or CSS-length `size`, optional accessible `label`, and native SVG attributes/ref. It inherits current text color and is decorative and unfocusable by default. Named images use `role="img"`; actions use the enclosing control's accessible name, keyboard handling, and focus. The full `Icon` and `iconNames` catalogue support runtime selection. `createIcon` plus individual definitions (for example `searchIcon`) builds a typed subset so unused glyphs are tree-shaken; `IconName`, `IconProps`, `IconDefinition`, and `NamedIconProps` describe these exports.

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
