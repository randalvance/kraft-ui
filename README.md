# Kraft UI

Tactile React primitives made of paper, cardboard, and stickers.

Cardboard holds things. Paper carries words. Stickers mark things. Kraft UI brings that material vocabulary to composable, accessible interfaces in Paper and Night themes.

## Install

```sh
npm install @randalvance/kraft-ui
```

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
| Material | `Surface`, `Mat`, `Tape` |
| Loading | `Pinwheel` |
| Structured sheet | `PaperPanel` |
| Board notes | `StickyNote`, `StickyNoteProps`, `StickyNoteTone`, `StickyNoteStatus` |
| Portraits | `Avatar`, `AvatarGroup`, `AvatarPicker` |
| Controls | `Button`, `IconButton`, `Link` |
| Form choices | `Checkbox`, `Toggle`, `RadioGroup`, `SegmentedControl`, `ToggleChips`, `Select` |
| Form fields | `FormField`, `TextField`, `Textarea`, `SearchField` |
| Collections | `ActionableList`, `ActionableListItem`, `TreeView` |
| Data display | `Table`, `TableRowAction`, `DescriptionList` |
| Long-form content | `Prose`, `CodeBlock`, `Code`, `Blockquote` |
| Navigation | `Tabs` |
| Overlays and panes | `Tooltip`, `TooltipProvider`, `Popover`, `Menu`, `Dialog`, `Drawer`, `ResizablePane` |
| Marks | `Separator`, `Badge`, `Sticker` |

Layout, typography, and surfaces accept `as` to select the semantic HTML element. Native props and refs pass through. Buttons stay buttons and links stay anchors. `IconButton` requires `aria-label`, and `Button` defaults to `type="button"`. The `loading` prop shows a `Pinwheel`, disables activation, and sets `aria-busy` on both buttons while preserving their accessible names. It replaces the action glyph in an `IconButton`. A pressed `Button` uses application-managed `aria-pressed` and remains depressed on hover. Text buttons wrap long labels within their available width, including in flex and grid layouts.

Spacing props use `0 | 2 | 3 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 24`. Button and mark tones are `neutral | blue | sage | danger | attention`. `BadgeProps` and `StickerProps` share `MarkSize` through `size="default" | "sm" | "count"`. Small round stickers measure 36px. Count marks fit one or two digits in an 18px height. Labels stay on one line and keep their width in flex rows. Stickers are upright and noninteractive. Use `decorative` for redundant marks. Round stickers default to 64px and accept `--kraft-sticker-size` to set their diameter. Use pills for longer labels. Small icon buttons are 28×28px circles with 16px glyphs. `Surface` materials are `paper | cardboard | kraft`. Paper and kraft support elevations 0–3; cardboard uses its structural elevation for 1–3 and no shadow for 0.

### Avatars

`Avatar` shows one `src` image, `initial` monogram, or `glyph` (for example a decorative `Icon`) inside a white sticker cut border. `size` is the complete diameter in pixels (default `36`), including compact 18px marks and 84px portraits. `tone="neutral" | "blue" | "sage" | "danger" | "attention"` colors monograms and glyphs. `alt` is required for every meaningful portrait; use `decorative` when adjacent text already supplies its meaning. The complete portrait is exposed as one named image; its inner image or glyph is decorative. Native span props and the ref reach the outer span.

Pass `status={{ tone: 'working', label: 'Working' }}` for a corner mark. Status tones are `working`, `waiting`, `blocked`, `done`, and `idle`; the required label joins the portrait's accessible name. Filled, dashed, square, checked, and hollow marks distinguish those states beyond color. These static corner marks serve portraits; standalone status components are tracked separately in issue #16. `tilt` is an optional rotation in degrees (default `0`) and follows `ThemeProvider`'s tilt preference. Avatars have no cast shadow or animation.

`AvatarGroup` renders a named native list from `avatars` (an array of `AvatarProps`). `label` names the list, `size` sets every portrait's diameter (default `36`), and `max` limits visible portraits (default `4`). The remaining portraits become a named `+N` count. Use `max={0}` for just the count. Native list props and the ref reach the `<ul>`.

`AvatarPicker` renders a `<fieldset>` with a `label` legend, `name`, and `options`. Each `AvatarOption` has a unique `value`, `label`, one of `src`, `initial`, or `glyph`, and optional `tone`, `tilt`, `status`, `description`, and `disabled`. Portraits are decorative inside the radios; the option label names the input, and its description and status label are announced separately. Choose `size` (default `36`), `defaultValue` for an uncontrolled form or `value` with `onValueChange(value, option)` for a controlled choice. Native radios provide arrow-key navigation, submission, reset, and `required` validation. `disabled` disables the entire fieldset; `hideLabel` visually hides its legend, and `description` adds group guidance. Selection rings the portrait and keyboard focus outlines the whole target, which remains at least 44×44px at small portrait sizes. Native fieldset props and the ref reach the `<fieldset>`.

```tsx
import { Avatar, AvatarGroup, AvatarPicker, Icon } from '@randalvance/kraft-ui';

<Avatar src="/mochi.png" alt="Mochi" size={64} tilt={-3}
  status={{ tone: 'working', label: 'Reviewing notes' }} />;
<Avatar glyph={<Icon name="agent" />} alt="Desk helper" tone="blue" />;
<AvatarGroup label="Desk helpers" max={2} avatars={[
  { src: '/mochi.png', alt: 'Mochi' }, { initial: 'P', alt: 'Pip', tone: 'sage' },
  { initial: 'K', alt: 'Kit' },
]} />;
<AvatarPicker label="Choose a helper" name="helper" defaultValue="mochi" options={[
  { value: 'mochi', label: 'Mochi', src: '/mochi.png' },
  { value: 'pip', label: 'Pip', initial: 'P', tone: 'sage' },
]} />;
```

For a picker outside its form, set `form` to the form's `id`. The fieldset and every radio associate with that form, preserving submission, required validation, and reset.

The package exports `AvatarProps`, `AvatarStatus`, `AvatarGroupProps`, `AvatarPickerProps`, and `AvatarOption`.

### Mat, Tape, and Pinwheel

- `Mat` frames its children in an inset paper sheet. Use `tone="kraft"` (default), `tone="amber"` for work awaiting review, or `tone="sage"` for finished work. Use `padding` to set the sheet's inner spacing (default `16`) and `as` to choose the frame's native element. The ref points to the frame.
- `Tape` positions a masking-tape strip at `placement="top"` (default), `right`, `bottom`, `left`, or one of `top-left`, `top-right`, `bottom-left`, and `bottom-right`. Place it inside a `Mat` or another positioned ancestor.
- `Pinwheel` is Kraft's standard loading indicator. Use `size="row"` (default, 24px) or `size="button"` (16px) for a compact space. It stays still when theme motion is off or the system prefers reduced motion.

`Tape` and `Pinwheel` forward span props and refs. They are decorative by default. Pass `label`, `aria-label`, or `aria-labelledby` to expose Tape as a named image or Pinwheel as a named status. When visible status text supplies the meaning, leave the pinwheel decorative.

```tsx
import { Button, Heading, Inline, Mat, Pinwheel, Stack, Tape, Text } from '@randalvance/kraft-ui';

function Proof({ saving }: { saving: boolean }) {
  return <Mat as="article" tone="amber">
    <Stack gap={12} align="start">
      <Tape placement="top-right" />
      <Heading>Proof ready for review</Heading>
      <Inline role="status" gap={6}>
        <Pinwheel />
        <Text as="span">Updating the preview…</Text>
      </Inline>
      <Button loading={saving}>Save edits</Button>
    </Stack>
  </Mat>;
}
```

### StickyNote

`StickyNote` renders a handwritten paper note with a curled corner. Use `header` and `footer` for optional slots and `children` for the body. Its five tones are `attention` (yellow, the default), `blush` (pink), `blue`, `sage` (green), and `ochre` (orange). Set `tilt` in degrees per note (default `-2`). The note sits upright when the enclosing theme disables tilt.

The default `as="article"` accepts rich content, including links and controls. Choose `as="button"` to make the whole note a native button, and use text or other noninteractive phrasing content in its slots. The button defaults to `type="button"`. Native props such as `onClick` and `disabled` and the ref reach the rendered element. Use `selected` for controlled selection, exposed as `aria-pressed`. The visible note text supplies the button's accessible name. If you set `aria-label` or `aria-labelledby`, keep the visible text in the accessible name.

Use `status="waiting"` for a hatched top edge or `status="done"` to strike through the body. Both statuses include visible text and can coexist with selection. Override the default “Waiting” or “Done” with `statusLabel`.

```tsx
import { StickyNote } from '@randalvance/kraft-ui';

function ProofNote({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return <StickyNote as="button" tone="blush" tilt={2} selected={selected} onClick={onSelect}
    header="Print studio" footer="Tuesday" status="waiting">
    Review the poster proof.
  </StickyNote>;
}
```

### Interactive components and compositions

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

`SegmentedControl` uses native radios for a single choice. `ToggleChips` uses native checkboxes for independent choices. Both take a `label` for the fieldset, a form `name`, and `options` with unique `value` strings and visible `label`s. A `SegmentOption` also accepts a numeric `count`, a second line in `description`, and `disabled`. Counts and second lines are announced as descriptions.

Use `variant="joined" | "chips"` and `tone="highlighter" | "ink"`. The radio strip defaults to joined, the checkbox group defaults to chips, and both default to highlighter. `hideLabel` keeps the group name accessible, and `disabled` disables the fieldset. Native fieldset props and refs pass through, including `form` for association with an external form. `SegmentedControlProps`, `ToggleChipsProps`, and `SegmentOption` are exported.

Use `defaultValue` for an initial selection or `value` with `onValueChange(value, option)` to control it. A radio value is a string and `required` enables native validation. Arrow keys move between enabled radios. Toggle chip values are arrays of strings and the callback reports them in option order. Tab reaches each enabled checkbox and Space toggles it. Form submission uses the supplied name, with one entry per enabled checked input. Native form reset restores uncontrolled defaults.

```tsx
import { SegmentedControl, ToggleChips } from '@randalvance/kraft-ui';

function Filters() {
  return <form>
    <SegmentedControl label="Show" name="show" defaultValue="all" options={[
      { value: 'all', label: 'All', count: 12 },
      { value: 'on', label: 'On', description: 'Running now', count: 8 },
      { value: 'off', label: 'Off', count: 4 },
    ]} />
    <ToggleChips label="Tools" name="tools" defaultValue={['notes']} tone="ink" options={[
      { value: 'notes', label: 'Notes' },
      { value: 'search', label: 'Search' },
    ]} />
  </form>;
}
```

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

`Tabs` renders a tab list named by `aria-label` and accepts native div props and a ref. Give each `TabItem` a unique, stable `id` and a `label`. The first enabled tab is selected unless `defaultValue` or controlled `value` chooses another. Use `onValueChange` to respond to selection. Arrow keys move between enabled tabs, Home/End reach the edges, and Tab enters the active pane in document order. Selection follows focus by default. Use `activationMode="manual"` to select on Enter or Space when opening a pane involves a noticeable delay. Set `orientation="vertical"` for tabs down the side. Arrows at the strip edges indicate more tabs in the scroll direction.

- `panel="paper"` is the default. It wraps each item's `content` in a paper pane. Set `--kraft-tabs-panel-min-height` to change its minimum height.
- `panel="bare"` renders the same linked panes flush with a surrounding Drawer, Dialog, or other surface. Bare panes have zero padding and no paper styling or minimum height. Hidden built-in panes stay mounted in both layouts.
- `panel="external"` renders just the strip. Set each item's `tabId` and `panelId` to unique DOM IDs and render its panel with `id={panelId}`, `role="tabpanel"`, and `aria-labelledby={tabId}`. Use controlled selection to keep the active panel visible. Put the panels after the strip in document order and give them `tabIndex={0}` if focus should enter the panel itself.
- `fill` lets a paper or bare pane scroll inside the remaining height while the strip stays in place. Give Tabs or its container a definite height.

Use `description` for a second line with an accessible description. Use `trailing` for a noninteractive count `Badge` or a tick. Give a meaningful tick an accessible label, such as `<Icon name="check" label="Complete" />`. With `iconOnly` and a `leading` icon, the `label` becomes visually hidden and appears in a tooltip on hover or keyboard focus. `TabsProps` and `TabItem` are exported.

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

```tsx
import { useId, useState } from 'react';
import { Surface, Tabs } from '@randalvance/kraft-ui';

export function SeparateSheets() {
  const prefix = useId();
  const [value, setValue] = useState(sections[0].id);
  const tabs = sections.map(({ id, label }) => ({
    id, label, tabId: `${prefix}-tab-${id}`, panelId: `${prefix}-panel-${id}`,
  }));

  return <>
    <Tabs aria-label="Idea sections" items={tabs} panel="external" value={value} onValueChange={setValue} />
    {tabs.map(({ id, tabId, panelId }, index) => (
      <div key={id} id={panelId} role="tabpanel" aria-labelledby={tabId} tabIndex={0} hidden={value !== id}>
        <Surface padding={24}>{sections[index].content}</Surface>
      </div>
    ))}
  </>;
}
```

### Tables and description lists

`Table` renders a native `<table>` with column headers, dashed row rules, and a sticky head inside its scroll area. Name it with a visible `caption`, `aria-label`, or `aria-labelledby`. Native table props and the ref reach the `<table>`. `maxHeight` sets the scroll area's maximum height in pixels or as a CSS length. When the table overflows, the scroll area can receive keyboard focus and uses `scrollLabel` as its accessible name (default `Scrollable table`).

- Each `TableColumn` has an `id`, `header`, optional `align="start" | "center" | "end"`, and optional `rowHeader` to render that column's body cells as row headers.
- Supply `rows` or `groups`. A `TableRow` has an `id`, `cells` keyed by column ID, and optional `current` and `dimmed` states. Use `current` for the open detail row and `dimmed` for lower emphasis, alongside visible status text such as “Off”. Dimmed rows keep their controls available. A `TableGroup` has an `id`, optional `caption`, and `rows`. When there are no rows, `empty` replaces the default “No rows to display.” message.
- Put a `TableRowAction` in the cell that names the row. It is a native button with native props and a ref, and defaults to `type="button"`. Use `onClick` to open details, `aria-expanded` to reflect an open drawer, and `aria-controls` to point to that drawer when it is mounted. The application owns the current row and focus return. Other cells can hold independent controls.

`DescriptionList` renders a native `<dl>` with a `<dt>` and `<dd>` for each item. Pass `items` with stable `id` values, a `label`, a `value`, and an optional `action` beside the value. Use `layout="stacked"` (default) for the label above its value or `layout="inline"` for labels beside values. Use `columns={2}` to put pairs side by side when space permits. An item's `wide` prop lets it span both columns. The default is one column. Native list props and the ref reach the `<dl>`.

```tsx
import { DescriptionList, Link, Table, TableRowAction } from '@randalvance/kraft-ui';

<Table caption="Connected servers"
  columns={[
    { id: 'server', header: 'Server', rowHeader: true },
    { id: 'tools', header: 'Tools', align: 'end' },
  ]}
  rows={[{
    id: 'docs', current: open, cells: {
      server: <TableRowAction aria-expanded={open} onClick={openDetails}>Documentation</TableRowAction>,
      tools: 8,
    },
  }]} />;

<DescriptionList columns={2} items={[
  { id: 'transport', label: 'Transport', value: 'HTTP' },
  { id: 'workspace', label: 'Workspace', value: 'Product', action: <Link href="/settings">Change workspace</Link> },
]} />;
```

The package exports `TableProps`, `TableColumn`, `TableRow`, `TableGroup`, `TableRowActionProps`, `DescriptionListProps`, and `DescriptionListItem`.

### Long-form content

`Prose` sets reading rhythm for content placed inside it, such as a note, a report, or rendered markdown. Headings, paragraphs, lists, links, rules, tables, inline code, `pre` blocks, and quotes take their spacing and marks from it without extra components. Choose `as="div"` (default), `"article"`, or `"section"`; native props and the ref reach that element. Prose styles only elements without a `class`, so Kraft components such as `Heading` and `ActionableList`, and your own classed elements, keep their own styles. It adds only block spacing around `CodeBlock` and `Table`.

- A list item that starts with a checkbox becomes a todo item and is struck through when ticked. The checkbox can be a bare `<input type="checkbox">` (as markdown renderers emit), one inside a `<label>`, or a Kraft `Checkbox`. Give each checkbox an accessible name, for example by wrapping it and its text in a `<label>`.
- `Code` draws inline code as a chip on a faint strip. Bare `<code>` inside Prose looks the same. Native props and the ref reach the `<code>`.
- `CodeBlock` is a recessed monospaced block for the `code` string. `language` shows a short label above it. `copyable` adds a button that copies `code` and announces “Copied” or “Copy failed” in a status message; `copyLabel` sets its accessible name (default `Copy code`). `lineNumbers` adds a gutter that is not selected or copied. `added` and `removed` take 1-based line numbers, render those lines as native `<ins>` and `<del>`, and mark them with a + or − sign, an edge, and a tint. When the code overflows, the block can receive keyboard focus and uses `scrollLabel` as its accessible name (default “*language* code” or “Code”). Native props and the ref reach the outer element.
- `Blockquote` renders a native `<blockquote>` beside a thick highlighter rule. Native props, including `cite`, and the ref reach it. Put an attribution outside the quote, for example in a `<figcaption>`.

```tsx
import { Blockquote, Code, CodeBlock, Prose } from '@randalvance/kraft-ui';

<Prose as="article">
  <h2>Setting up the theme</h2>
  <p>Wrap the application in <Code>ThemeProvider</Code>.</p>
  <CodeBlock language="tsx" copyable lineNumbers added={[2]} code={source} />
  <Blockquote><p>Paper carries words.</p></Blockquote>
  <ul>
    <li><label><input type="checkbox" defaultChecked /> Write the changeset</label></li>
  </ul>
</Prose>;
```

The package exports `ProseProps`, `CodeProps`, `CodeBlockProps`, and `BlockquoteProps`.

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

Use `<ThemeProvider theme="night" texture={false} motion={false} tilt={false}>` for a quieter Night interface. The tilt setting controls paper decoration and opt-in Avatar rotation; Sticker marks stay upright. Providers are scoped, can nest, and do not mutate the document. Reduced-motion preferences always disable transitions. Theme selection is explicit: applications choose persistence and system-preference behavior.

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
