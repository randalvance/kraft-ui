---
"@randalvance/kraft-ui": minor
---

RadioGroup gains `variant` (`rows`, `flat`, `swatch`, `picture`) and `columns`. `columns` lays options out as equal-width cards, and horizontal rows now share the width equally even with descriptions. `flat` highlights only the picked row. `swatch` draws a row of ringed colour swatches from each option's `swatch` CSS colour, and `picture` shows each option's `picture`, for example a portrait; both name the radio with `aria-label` instead of a visible or clipped label. The trailing slot is no longer capped at 40% width, so it can hold a handwritten note. The picked row's description now prints in ink so it stays readable on the Night highlighter. `form` now reaches every radio. Adds the `RadioGroupVariant` type and the `swatch` and `picture` option fields.
