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
| Icons | `Icon`, `createIcon`, `iconNames`, individual glyph definitions (such as `searchIcon`) |
| Material | `Surface` |
| Structured sheet | `PaperPanel` |
| Controls | `Button`, `IconButton`, `Link` |
| Form choices | `Checkbox`, `Toggle`, `RadioGroup`, `Select` |
| Form fields | `FormField`, `TextField`, `Textarea`, `SearchField` |
| Collections | `ActionableList`, `ActionableListItem`, `TreeView` |
| Navigation | `Tabs` |
| Overlays and panes | `Tooltip`, `TooltipProvider`, `Popover`, `Menu`, `Dialog`, `Drawer`, `ResizablePane` |
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

`TextField`, `Textarea`, and `SearchField` keep native input behavior, including refs, controlled or initial values, validation, and form submission. Put one control inside `FormField` to connect a visible `label`, optional `description`, and `error` to that control automatically. An error draws a dashed red field edge, sets `aria-invalid`, and becomes part of its accessible description; application code decides when to show it. Set `controlId` on `FormField` when another element needs the input ID. Each control can also stand alone with an external `<label>` and `id`, or an `aria-label`. `className` and `style` on a control apply to its native input or textarea; on `FormField` they apply to the wrapper.

```tsx
import { FormField, SearchField, Textarea, TextField } from '@randalvance/kraft-ui';

function AgentFields() {
  return <form>
    <FormField label="Agent name" description="Shown in sessions">
      <TextField name="name" required placeholder="Name this agent" />
    </FormField>
    <FormField label="Description"><Textarea name="description" rows={3} /></FormField>
    <FormField label="Find notes"><SearchField name="query" placeholder="Search notes…" /></FormField>
  </form>;
}
```

`RadioGroup` renders native radio inputs on paper rows. Supply a group `label`, a shared form `name`, and options with unique `value` strings. Optional descriptions are announced separately from option names. Use `defaultValue` or controlled `value` with `onValueChange`. Native arrow keys, form submission, `required`, and disabled choices work without extra application code.

`Select` is a single choice field with a button and listbox. It supports `name`, `required`, disabled options, typeahead, and controlled or initial values. `Menu` is for actions; give it an accessible `label`, an array of actions and separators, and an `onAction` callback. `Popover` holds small structured content with a required title and a close button. Pass a ref forwarding button as a menu or popover `trigger`. These anchored surfaces keep the current theme by default; when an ancestor clips them, pass `portalContainer` pointing to a suitable element within the same theme scope.

`Tooltip` shows a short, noninteractive paper label on hover or keyboard focus. Give its `trigger` an accessible name of its own; the tooltip's `content` supplies supporting text. It closes on Escape or activation and keeps focus on the trigger. One tooltip works alone; wrap neighboring tooltips in `TooltipProvider` to share the hover delay. `delayDuration` adjusts an individual tooltip, while the provider also accepts `skipDelayDuration`. It follows the current theme and accepts `portalContainer` for a theme-scoped portal outside a clipping ancestor. Use `Popover` for content with buttons or links.

```tsx
import { IconButton, Tooltip, TooltipProvider } from '@randalvance/kraft-ui';

function Rail() {
  return <TooltipProvider>
    <Tooltip trigger={<IconButton aria-label="New session">+</IconButton>}
      content="Start a new session" side="right" />
  </TooltipProvider>;
}
```

```tsx
import { Button, Menu, RadioGroup, Select } from '@randalvance/kraft-ui';

function WorkChoices() {
  return <>
    <RadioGroup label="Effort" name="effort" defaultValue="medium" options={[
      { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ]} />
    <Select label="Workspace" name="workspace" options={[
      { value: 'desk', label: 'Desk' }, { value: 'shelf', label: 'Shelf' },
    ]} />
    <Menu label="Note actions" trigger={<Button>Actions</Button>} items={[
      { id: 'copy', label: 'Copy note' }, { id: 'delete', label: 'Delete note', destructive: true },
    ]} onAction={id => { /* Handle the chosen action. */ }} />
  </>;
}
```

`ActionableList` names a flat collection. Each `ActionableListItem` has one primary button or link, with optional descriptive copy, noninteractive trailing detail, and separate `actions`. Use `current` for the active destination and `disabled` for an unavailable row. Use `TreeView` for hierarchy and `Select` for one choice from a listbox.

`Drawer` is a titled paper side sheet with optional description and footer. Render it as the `pane` in `ResizablePane`, with `main` beside it. The caller owns `open` and `onClose`; resizing can be uncontrolled with `defaultSize` or controlled with `size` and `onSizeChange`. The divider accepts pointer dragging, Left/Right arrows, Home, and End. On narrow screens, the open pane fills the layout. Keep focus return in the application action that closes a pane.

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

## Icons

`Icon` renders the 29 original single-ink design-system glyphs and 19 additional application glyphs. Its required `name` is an `IconName` union, so unknown names are compile errors. `size` accepts pixels or a CSS length; omitted, it follows the surrounding text (`1em`) or the existing IconButton, Tabs, and list slot sizing. An explicit size overrides slot sizing. SVGs inherit `currentColor`, stay upright and static, and accept native SVG attributes, `className`, `style`, and an `SVGSVGElement` ref. `IconProps`, `IconDefinition`, and generic `NamedIconProps` are exported types.

Icons are decorative (`aria-hidden`) and unfocusable by default. Use `label`, native `aria-label`, or `aria-labelledby` to expose a standalone image with `role="img"`; `label` takes precedence over `aria-label`. Empty labels stay decorative, and explicit `aria-hidden` can hide a named icon. Put actions inside a named Button or IconButton so keyboard operation and visible focus belong to the control.

```tsx
import { Button, Icon, IconButton } from '@randalvance/kraft-ui';

<Button><Icon name="microphone" />Record</Button>;
<IconButton aria-label="Close panel"><Icon name="close" /></IconButton>;
<Icon name="pin" size={24} label="Pinned" />;
```

The original names are `agent`, `agents`, `background`, `branch`, `check`, `chevron-down`, `code`, `copy`, `factory`, `home`, `inbox`, `kanban`, `knowledge`, `mark`, `mcps`, `memory`, `pinwheel`, `plus`, `pull-requests`, `search`, `send`, `sessions`, `settings`, `share`, `skills`, `stop`, `trash`, `workflows`, and `workspaces`. Additional names are `microphone`, `close`, `pin`, `pencil`, `sync`, `folder`, `file`, `new-file`, `new-folder`, `grip`, `three-dots`, `terminal`, `clock`, `bolt`, `eye`, `link`, `chevron-left` (back), `power`, and `key`. `iconNames` lists the full catalogue.

The ready-made `Icon` supports runtime name lookup and includes the full catalogue. To tree-shake unused glyphs, import individual definitions and create a local Icon once at module scope. Each definition is named by its camel-cased icon name plus `Icon`, such as `newFileIcon` or `chevronLeftIcon`. The resulting component has the same props and ref support, with `name` restricted to the supplied keys. This requires no registration, provider, network requests, or bundler plugin.

```tsx
import { createIcon, searchIcon, closeIcon } from '@randalvance/kraft-ui';

const AppIcon = createIcon({ search: searchIcon, close: closeIcon });

<AppIcon name="search" size={20} />;
// <AppIcon name="folder" /> is a compile error; its glyph is absent from the bundle.
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
