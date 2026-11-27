---
"@randalvance/kraft-ui": minor
---

Add fourteen glyphs to `Icon`, so an application rail and its toolbars no longer need a local `createIcon` set. `bulb`, `clipboard`, and `board` are the design system's own ideas, artifacts, and tasks drawings. `moon` is the night mode toggle and `chevron-right` pairs with `chevron-left`. `sparkle`, `filter`, `graph`, `expand`, `sliders`, `activity`, `ban`, and `question` cover common toolbar actions. `editor` is a window with code in it, for opening something in an editor without a product's logo. Each has a named definition for `createIcon`, such as `moonIcon` and `chevronRightIcon`, and `iconNames` now lists 62 names.
