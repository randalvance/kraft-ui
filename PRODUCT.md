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

The first release includes tokens, scoped Paper and Night themes, Box, Stack, Inline, Text, Heading, Surface, PaperPanel, Button, IconButton, Link, Separator, Badge, Sticker, Checkbox, Toggle, FormField, TextField, Textarea, SearchField, TreeView, Tabs, and Dialog. Selects and radios follow later. Components support native props and refs, server rendering, and current evergreen browsers. Applications control font loading. Texture, motion, and paper decoration tilt are configurable. Stickers always remain upright, and round stickers and small icon buttons use equal width and height.

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
