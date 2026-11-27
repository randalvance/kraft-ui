---
"@randalvance/kraft-ui": patch
---

RadioGroup no longer squeezes an option's `trailing` content. The slot shrank together with the label and description and could break in the middle of a word, so a `Stamp` in a `columns` card printed a few letters per line, and short notes such as "Medium" broke in horizontal rows. The trailing content now keeps its natural width and the description wraps first. When an option cannot hold the trailing content beside 9rem of mark, label, and description, the trailing content moves to its own line below them, at the end edge. The mark, leading content, and copy now sit in a `.kraft-radio-main` wrapper inside the option.
