---
"@randalvance/kraft-ui": minor
---

Add `StatusDot` and `StatusSticker` for showing what state something is in. `StatusDot` draws a working, waiting, blocked, done, or idle mark in solid, hollow, or dashed form, round or square, at 8, 10, or 12px. It takes visible `children` or an accessible `label`, so colour is never the only signal, and each tone has its own default form. `StatusSticker` prints the state in small capitals as a `solid`, plain `paper`, or dashed `ghost` sticker, with an optional `dot` or `spinner` indicator, in `sm` and `md` sizes. Adds the `StatusTone`, `StatusDotProps`, `StatusDotVariant`, `StatusDotShape`, `StatusDotSize`, `StatusStickerProps`, `StatusStickerVariant`, `StatusStickerIndicator`, and `StatusStickerSize` types. `AvatarStatus` now uses `StatusTone`.
