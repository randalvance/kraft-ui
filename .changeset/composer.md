---
"@randalvance/kraft-ui": minor
---

Add `Composer`, the prompt box: a red cardboard frame around ruled paper with a native textarea that grows, a handwritten placeholder, `Kbd` key hints, disc actions, and a bar for the application's own controls. Enter sends and Shift+Enter starts a new line; `submitKey` changes that to Ctrl+Enter or Command+Enter, or to the send disc alone. Sending calls `onSend` with the text and submits a surrounding form. `mic` and `send` are action slots, with a built-in send disc named by `sendLabel`; `bar` and `barLabel` hold and name the application's controls; `hints` replaces or removes the key hints. `disabled` turns off the text and the send disc, and `busy` keeps the text editable while sending waits. Adds the `ComposerProps` and `ComposerSubmitKey` types.
