---
"@randalvance/kraft-ui": minor
---

Add `Composer`, the prompt box: a red cardboard frame around a ruled paper card that wraps a native textarea and grows with the text from `rows` to `maxRows` lines. Enter sends and Shift+Enter adds a line, or `sendKey="mod-enter"` sends on Ctrl+Enter or ⌘+Enter. The keys are shown as `Kbd` hints that describe the textarea, and `hints` replaces or removes them. The send key calls `onSend` and submits an enclosing form through its submit button, as a single-line input does. `bar` holds the application's controls, and `mic` and `send` hold actions drawn as discs. `busy` holds the send key and shows a Pinwheel with `busyLabel`, and `disabled` quiets the frame. Native textarea props and the ref reach the textarea, and a `FormField` supplies its label, description, and error. Adds the `ComposerProps` and `ComposerSendKey` types.
