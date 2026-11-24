---
"@randalvance/kraft-ui": minor
---

Widen the type range. Text gains `serif` and italic `lead` variants, a `size` for the hand variant from 17px to a 52px display size, and `faint`, `danger`, and `attention` tones that stay readable on paper, kraft, and cardboard in both themes. Heading gains handwritten `title-sm` and `display` sizes. `measure={false}` on Text and `balance={false}` on Heading turn off the 72ch cap and balanced wrapping, and code text in a `pre` is no longer capped. Link gains `tone="inherit"` and `underline="hover"` for links inside headings. Adds the `TextVariant`, `TextTone`, `HandSize`, `HeadingSize`, and `LinkProps` types and nine `text-*` ink tokens.
