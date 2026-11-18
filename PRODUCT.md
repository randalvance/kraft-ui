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

The first release includes tokens, scoped Paper and Night themes, Box, Stack, Inline, Text, Heading, Surface, Mat, Tape, PaperPanel, Button, IconButton, Pinwheel, Icon, Link, Separator, Badge, Sticker, Checkbox, Toggle, FormField, TextField, Textarea, SearchField, RadioGroup, Select, ActionableList, ActionableListItem, TreeView, Tabs, Tooltip, TooltipProvider, Popover, Menu, Dialog, Drawer, and ResizablePane. Components support native props and refs where applicable, server rendering, and current evergreen browsers. Applications control font loading. Texture, motion, and paper decoration tilt are configurable. Stickers always remain upright, and round stickers and small icon buttons use equal width and height.

`Mat` and `MatProps` offer a paper inset with `padding` inside a frame with `tone="kraft" | "amber" | "sage"`. Choose the frame element with `as`. `Tape` and `TapeProps` position a masking-tape strip at any edge or corner with `placement`. `Pinwheel` and `PinwheelProps` provide the shared busy indicator at `size="row" | "button"`. It stays still when theme motion is off or the system prefers reduced motion. Tape and Pinwheel accept an accessible `label` or native ARIA labelling attributes and are decorative by default. `Button` and `IconButton` use the decorative Pinwheel while `loading` and expose their own busy state.

Icon supplies 48 single-ink glyphs: the 29 original design-system icons and 19 application additions. Its props are a typed `name`, optional numeric or CSS-length `size`, optional accessible `label`, and native SVG attributes/ref. It inherits current text color and is decorative and unfocusable by default. Named images use `role="img"`; actions use the enclosing control's accessible name, keyboard handling, and focus. The full `Icon` and `iconNames` catalogue support runtime selection. `createIcon` plus individual definitions (for example `searchIcon`) builds a typed subset so unused glyphs are tree-shaken; `IconName`, `IconProps`, `IconDefinition`, and `NamedIconProps` describe these exports.

`Tabs` and its exported `TabsProps` and `TabItem` support `panel="paper"`, `panel="bare"` for a Drawer or Dialog, and `panel="external"` for application-rendered content linked with `tabId` and `panelId`. Built-in panes take `content` and use `fill` to scroll independently within the available height. Tabs accept a `description` below the label and noninteractive `trailing` content for counts and status marks. `iconOnly` with a `leading` icon preserves the accessible label and reveals it in a tooltip. Overflow cues show where more tabs are available in either orientation.

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
