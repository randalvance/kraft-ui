---
"@randalvance/kraft-ui": minor
---

Add `Kbd` for keycap hints, one key or a chord such as `keys={['Ctrl', 'K']}`, in `sm` and `md` sizes. SearchField gains a `trailing` slot for a Kbd or a count that stays clear of the native clear button, and an `icon` prop to replace or remove the leading mark. SearchField's frame now draws the paper: `className` and `style` size the whole field, so it can share a flex row without a wrapper, and the new `inputClassName` and `inputStyle` reach the input. Adds the `KbdProps` and `KbdSize` types.
