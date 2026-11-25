---
"@randalvance/kraft-ui": minor
---

`Toggle` is now drawn as a pull-tab: a thick card tab slides in a slot cut into the paper, and the slot shows a handwritten “on” or “off” and turns blue when on. It is still a native checkbox with `role="switch"`; the written state is decorative and hidden from assistive technology. The switch is 56×26px instead of 44×26px. `Toggle` gains `labelSide` (`"end"` by default, or `"start"`): `"start"` puts the label before the switch and stretches the row, so a settings row reads name first and switch last while the whole row stays clickable. Hovering anywhere on the label now darkens the unchecked edge. The slide follows the theme motion setting and system reduced motion, and forced colours keep the written state legible. Adds the `ToggleLabelSide` type and the `--kraft-toggle-on-ink` custom property. The `.kraft-toggle-knob` class is replaced by `.kraft-toggle-slot`, `.kraft-toggle-word`, and `.kraft-toggle-tab`.
