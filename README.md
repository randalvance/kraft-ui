# Kraft UI

Tactile React primitives made of paper, cardboard, and stickers.

Cardboard holds things. Paper carries words. Stickers mark things. Kraft UI brings that material vocabulary to composable, accessible interfaces in Paper and Night themes.

## Install

```sh
npm install @randalvance/kraft-ui
```

The package is being prepared for its first release. For local evaluation, run `npm pack` in this repository and install the resulting archive in your application.

```tsx
import { ThemeProvider, Stack, Surface, Heading, Text, Button } from '@randalvance/kraft-ui';
import '@randalvance/kraft-ui/styles.css';

export function Note() {
  return (
    <ThemeProvider theme="paper">
      <Surface as="article">
        <Stack gap={16}>
          <Heading as="h2">A fresh sheet</Heading>
          <Text>A place for your next idea.</Text>
          <Button variant="blue">Keep this idea</Button>
        </Stack>
      </Surface>
    </ThemeProvider>
  );
}
```

## Primitives

| Group | Exports |
| --- | --- |
| Theme | `ThemeProvider` |
| Layout | `Box`, `Stack`, `Inline` |
| Typography | `Text`, `Heading` |
| Material | `Surface` |
| Structured sheet | `PaperPanel` |
| Controls | `Button`, `IconButton`, `Link` |
| Form choices | `Checkbox`, `Toggle` |
| Hierarchy | `TreeView` |
| Navigation | `Tabs` |
| Overlay | `Dialog` |
| Marks | `Separator`, `Badge`, `Sticker` |

Layout, typography, and surfaces accept `as` to select the semantic HTML element. Native props and refs pass through. Buttons stay buttons; links stay anchors. `IconButton` requires `aria-label`. `Button` defaults to `type="button"`; loading disables activation, exposes `aria-busy`, and retains its label. A pressed `Button` uses application-managed `aria-pressed` and remains depressed on hover. Text buttons wrap long labels within their available width, including in flex and grid layouts.

Spacing props use `0 | 2 | 3 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 24`. Button and mark tones are `neutral | blue | sage | danger | attention`. Stickers are upright and noninteractive; use `decorative` for redundant marks. Round stickers are true 64px circles; customize `--kraft-sticker-size` for another diameter and use pills for longer labels. Small icon buttons are 28×28px circles with 16px glyphs. `Surface` materials are `paper | cardboard | kraft`. Paper and kraft support elevations 0–3; cardboard uses its structural elevation for 1–3 and no shadow for 0.

`Checkbox` and `Toggle` are native `<input type="checkbox">` elements, so `name`, `value`, `checked`/`defaultChecked`, `onChange`, `required`, and form submission work as usual. The ref reaches the input; `className` and `style` apply to the surrounding label, which is the whole hit target. Pass the label as `children` (or `aria-label` without visible text) and optional supporting text as `description`, which becomes the input's accessible description. `Checkbox` accepts `indeterminate` for a mixed state; update it when the selection changes. `Toggle` has `role="switch"`: use it for settings that apply immediately, and `Checkbox` for choices submitted with a form.

```tsx
import { useState } from 'react';
import { Checkbox, Toggle } from '@randalvance/kraft-ui';

function Choices() {
  const [autosave, setAutosave] = useState(true);
  return <>
    <Checkbox name="archive" description="Archived notes stay searchable.">Archive finished notes</Checkbox>
    <Toggle checked={autosave} onChange={event => setAutosave(event.target.checked)}>Autosave</Toggle>
  </>;
}
```

Text inputs, selects, radios, and other complex widgets are not yet included.

`PaperPanel` standardizes a titled sheet with a blank paper body. It accepts `leading`, `controls`, `navigation`, and `footer` slots around `children`. The title labels the section, and `titleAs` selects its heading level. The body has a default minimum height of 220px; override `--kraft-panel-body-min-height` when a workspace needs more room. Override `--kraft-panel-frame` and `--kraft-panel-frame-edge` together for a tinted frame, checking header text contrast against the chosen color. Application controls and navigation keep their own behavior.

`Dialog` is a controlled modal paper sheet. Pass `open`, `onOpenChange`, and a `title`; a short `description`, leading mark, and footer are optional. It uses native `<dialog>` so focus stays inside while open and returns to the opener on close. Escape, the close button, and a backdrop click request dismissal. Set `dismissible={false}` when the user must choose an action inside the dialog. The title receives initial focus by default; pass `initialFocusRef` to focus a task-specific element. Set `--kraft-dialog-width` to change its maximum width, and keep long content in the scrolling body.

```tsx
import { useState } from 'react';
import { Button, Dialog, Text } from '@randalvance/kraft-ui';

export function KeepIdea() {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>Keep idea</Button>
    <Dialog open={open} onOpenChange={setOpen} title="Keep this idea?"
      footer={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="blue" onClick={() => setOpen(false)}>Keep</Button></>}>
      <Text>This idea will stay on your shelf.</Text>
    </Dialog>
  </>;
}
```

`TreeView` renders a named hierarchy from nodes with unique, stable `id` values. Branches expand and collapse; leaves select unless disabled. Set `selectable: true` on a branch when it should select too. Nodes can show a description, decorative `leading` mark, and noninteractive `trailing` content. Arrow keys navigate visible items, Home/End jump to the edges, typing finds a label, and Enter/Space activates the focused item. Expansion and selection can be uncontrolled (`defaultExpandedIds`, `defaultSelectedId`) or controlled (`expandedIds`, `selectedId`) with change callbacks. Use `selectionMode="none"` for an exploration-only tree. Keep menus, links, filtering, and drag and drop in the application rather than nesting interactive controls inside a tree row.

```tsx
import { TreeView, type TreeNode } from '@randalvance/kraft-ui';

const pages: TreeNode[] = [
  { id: 'ideas', label: 'Ideas', children: [
    { id: 'sketches', label: 'Sketches' },
    { id: 'notes', label: 'Notes', description: 'Three pages' },
  ] },
];

export function Pages({ onOpen }: { onOpen: (id: string) => void }) {
  return <TreeView aria-label="Pages" items={pages} defaultExpandedIds={['ideas']}
    onSelectionChange={onOpen} />;
}
```

`Tabs` attaches a named tab strip to paper panes. Give each item a unique, stable `id`, a `label`, and `content`; optional `leading` and `trailing` marks sit beside the label. The first enabled tab is selected unless `defaultValue` or controlled `value` chooses another. Use `onValueChange` to respond to selection. Arrow keys move between enabled tabs, Home/End reach the edges, and Tab enters the active pane. Selection follows focus by default; use `activationMode="manual"` when opening a pane involves a noticeable delay. Set `orientation="vertical"` for tabs down the side. Hidden panes stay mounted, so local pane state survives selection changes. Set `--kraft-tabs-panel-min-height` when the sheet needs a different minimum height.

```tsx
import { Tabs, Text, type TabItem } from '@randalvance/kraft-ui';

const sections: TabItem[] = [
  { id: 'notes', label: 'Notes', content: <Text>Fresh thoughts.</Text> },
  { id: 'sketches', label: 'Sketches', content: <Text>Drawn ideas.</Text> },
];

export function IdeaSections() {
  return <Tabs aria-label="Idea sections" items={sections} defaultValue="notes" />;
}
```

## Themes and customization

Use `<ThemeProvider theme="night" texture={false} motion={false} tilt={false}>` for a quieter Night interface. The tilt setting controls paper decoration; stickers never rotate. Providers are scoped, can nest, and do not mutate the document. Reduced-motion preferences always disable transitions. Theme selection is explicit: applications choose persistence and system-preference behavior.

CSS variables use the `--kraft-` prefix. Override them on an application scope, for example `style={{ '--kraft-font-sans': 'Your font, sans-serif' } as React.CSSProperties}`. Surfaces provide material-aware link and secondary-text ink. Nested surfaces and providers reset those roles for their own material/theme. Night kraft uses its readable primary ink for secondary copy. Raw foundation tokens are available from `@randalvance/kraft-ui/tokens.json`. The stylesheet has root token defaults; visual resets and typography are scoped to Kraft components and providers.

Fonts are application-owned. The default stacks are Fraunces/Georgia, Nunito/system sans, Caveat/cursive, and Courier New/monospace. No remote font requests are made by the library. Storybook demonstrates locally bundled fonts.

React 18 and 19 and server rendering are supported. The package is ESM with TypeScript declarations. Modern evergreen browsers are required for CSS color mixing.

## Development

Use Node 24 (`nvm use`) and npm.

```sh
npm ci
npx playwright install chromium
npm run storybook
```

- `npm run typecheck`: component and story types.
- `npm test`: native semantics, keyboard behavior, refs, and server rendering.
- `npm run test:buttons`: real-browser wrapping and pointer-state regressions in both themes.
- `npm run test:contrast`: screenshot-based text contrast checks across materials, themes, and texture preferences.
- `npm run test:stories`: browser-rendered stories, interactions, and accessibility checks.
- `npm run build`: distributable ESM, CSS, assets, declarations, and tokens.
- `npm run build-storybook`: static documentation.
- `npm run check`: all required checks.

Storybook provides theme and decoration controls, material/color/type/spacing foundations, individual component APIs, and a working desk composition. Merged changes deploy to [the component explorer](https://randalvance.github.io/kraft-ui/) after GitHub Pages is configured.

See [DESIGN.md](DESIGN.md) for visual rules, [PRODUCT.md](PRODUCT.md) for product constraints, and [releasing](docs/releasing.md) for release setup.
