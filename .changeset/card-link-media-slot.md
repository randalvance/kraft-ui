---
"@randalvance/kraft-ui": patch
---

`Card` with `as="a"` now accepts any node in its `media` slot. The anchor's native `media` attribute is a string, and its type was merged into the slot's, so `<Card as="a" href="…" media={<Avatar … />}>` failed to typecheck. Card's slot names now take precedence over native attributes of the same name on every variant. Nothing changes at runtime: `media` was always rendered as slot content and never reached the link as an attribute.
