---
"@randalvance/kraft-ui": minor
---

`Button`, `IconButton`, `Badge`, and `Sticker` take six more tones: `ochre`, `teal`, `violet`, `plum`, `blush`, and `navy`. Use them to give a workspace, a rail tile, or a model chip its own colour. The new `ExtendedTone` type names the five shared tones and these six, and `CardTone` is now the same set under its old name. `Tone` is unchanged.

Each new tone has three tokens with Paper and Night values: a face, a deeper cut edge, and an on-colour ink, named like `--kraft-teal-face`, `--kraft-teal-edge`, and `--kraft-on-teal`. A label keeps 4.5:1 on its face in both themes, with texture on or off. In Paper the teal, violet, and plum faces are deeper than `--kraft-teal`, `--kraft-violet`, and `--kraft-plum`, which cannot hold a label in either ink.
