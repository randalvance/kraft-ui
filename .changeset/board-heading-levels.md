---
"@randalvance/kraft-ui": minor
---

`CorkBoardColumn` now renders its name as an `h2` by default, where it was an `h3`. A board directly under the page `h1` no longer skips a heading level, which axe reports as `heading-order`. Pass `headingLevel={3}` for a board that sits under an `h2`, which is also how to keep the previous output. The README and stories now say how to choose the level for a column name and for a heading placed in a `StickyNote` header.
