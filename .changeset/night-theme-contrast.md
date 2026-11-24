---
"@randalvance/kraft-ui": minor
---

Fix Night theme contrast. `--kraft-red-2` and `--kraft-blue-2` are now light tints in Night, so red and blue text is readable on night paper. A new `--kraft-blue-deep` token keeps the deep blue for button and checkbox edges, the Night toggle rail, the navy tone, and avatar marks. Use the documented `--kraft-content-danger` ink role for danger text: it follows the material and theme, and form errors and destructive menu items now use it. Destructive menu items in Night no longer use the raw `--kraft-red`. Night `--kraft-green` is lighter so a green dot stays visible on a highlighted (picked) row. Icons on a Badge or Sticker print in the mark's ink, so a yellow glyph on an attention Sticker stays visible. Checkbox and toggle faces no longer fade between colors, so switching themes doesn't flash unchecked checkboxes dark.
