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
| Typography | `Text`, `TextProps`, `TextVariant`, `TextTone`, `HandSize`, `Heading`, `HeadingProps`, `HeadingSize` |
| Icons | `Icon`, `createIcon`, `iconNames`, individual glyph definitions (such as `searchIcon`) |
| Material | `Surface`, `Mat`, `Tape` |
| Loading | `Pinwheel` |
| Structured sheet | `PaperPanel` |
| Cards | `Card`, `CardProps`, `CardTone`, `CardSize`, `CardAddTile`, `CardAddTileProps` |
| Board notes | `StickyNote`, `StickyNoteProps`, `StickyNoteTone`, `StickyNoteStatus` |
| Cork boards | `CorkBoard`, `CorkBoardItem`, `CorkBoardColumn`, `Pin` |
| Portraits | `Avatar`, `AvatarGroup`, `AvatarPicker` |
| Controls | `Button`, `ButtonProps`, `ButtonVariant`, `IconButton`, `IconButtonProps`, `IconButtonVariant`, `Link`, `LinkProps` |
| Form choices | `Checkbox`, `CheckboxGroup`, `CheckboxStatus`, `Toggle`, `RadioGroup`, `SegmentedControl`, `ToggleChips`, `Select` |
| Form fields | `FormField`, `TextField`, `Textarea`, `SearchField`, `InlineEdit` |
| Key hints | `Kbd`, `KbdProps`, `KbdSize` |
| Prompt box | `Composer`, `ComposerProps`, `ComposerSendKey` |
| Status marks | `StatusDot`, `StatusDotProps`, `StatusDotVariant`, `StatusDotShape`, `StatusDotSize`, `StatusSticker`, `StatusStickerProps`, `StatusStickerVariant`, `StatusStickerIndicator`, `StatusStickerSize`, `StatusTone` |
| Edit pages | `FormSection`, `FormSectionProps`, `PageHeader`, `PageHeaderProps` |
| Collections | `ActionableList`, `ActionableListItem`, `TreeView` |
| Data display | `Table`, `TableRowAction`, `DescriptionList` |
| Long-form content | `Prose`, `CodeBlock`, `Code`, `Blockquote` |
| App layout | `AppShell`, `AppShellProps`, `RailTile`, `RailTileProps` |
| Navigation | `Tabs` |
| Overlays and panes | `Tooltip`, `TooltipProvider`, `Popover`, `Menu`, `Dialog`, `Drawer`, `ResizablePane` |
| Marks | `Separator`, `Badge`, `Sticker`, `Stamp`, `StampProps`, `StampSize`, `Tag`, `TagProps`, `TagVariant` |

Layout, typography, and surfaces accept `as` to select the semantic HTML element. Native props and refs pass through. Buttons stay buttons and links stay anchors.

Spacing props use `0 | 2 | 3 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 24`. Mark tones are `neutral | blue | sage | danger | attention`. `BadgeProps` and `StickerProps` share `MarkSize` through `size="default" | "sm" | "count"`. Small round stickers measure 36px. Count marks fit one or two digits in an 18px height. Labels stay on one line and keep their width in flex rows. Stickers are upright and noninteractive. Use `decorative` for redundant marks. Round stickers default to 64px and accept `--kraft-sticker-size` to set their diameter. Use pills for longer labels. `Surface` materials are `paper | cardboard | kraft`. Paper and kraft support elevations 0–3; cardboard uses its structural elevation for 1–3 and no shadow for 0.

### Typography

`Text` renders a paragraph by default. Its `variant` is `body` (default), `label`, `label-sm`, `hand`, `serif`, `lead`, or `code`. `serif` prints running copy in the heading face and `lead` sets an italic serif opening line. The `hand` variant takes `size="sm" | "md" | "lg" | "xl" | "display"` for 17, 22, 26, 38, and 52px handwriting. `sm` is the default, and other variants ignore `size`.

`tone` is `default`, `muted`, `faint`, `danger`, or `attention`. Each tone picks an ink that stays readable on the desk and on paper, kraft, and cardboard surfaces in both themes. Faint ink stays only a little lighter than muted to keep that contrast. Say the status in the words as well, since colour alone does not carry it.

Text is capped at 72ch. Set `measure={false}` to let it fill its container. Code text in a `pre` is never capped.

`Heading` renders an `h2` by default. Sizes `sm`, `md` (default), and `lg` print in serif. `title-sm`, `title`, and `display` are handwritten at 26, 38, and 52px. Wrapped headings balance their lines. Set `balance={false}` for ordinary wrapping.

`Link` takes `tone="inherit"` to use the surrounding ink and `underline="hover"` to show its underline only on hover and keyboard focus. Use both when a link fills a heading. Keep the default underline for links inside running text.

```tsx
import { Heading, Link, Stack, Text } from '@randalvance/kraft-ui';

<Stack gap={8}>
  <Heading as="h1" size="display">Good morning, Mina</Heading>
  <Text variant="lead">Three proofs are waiting on your desk.</Text>
  <Heading as="h2" size="title-sm">
    <Link href="/proofs/spring" tone="inherit" underline="hover">Spring catalogue</Link>
  </Heading>
  <Text as="span" tone="danger">Overdue by two days</Text>
  <Text as="pre" variant="code">npm run check</Text>
</Stack>
```

The italic lead needs an italic Fraunces face. Load one with your other fonts, or the browser slants the upright face.

### Buttons

`Button` has five raised variants (`neutral`, `blue`, `sage`, `danger`, `attention`) plus `ghost` for a flat outline, `text` for a bare action, and `dashed` for an add action. Set `tone="danger"` on the text variant for destructive actions. Use `leading` for a decorative icon before the label. Labels stay on one line by default. Add `wrap` to let long labels fit a narrow container.

`IconButton` supports the same five raised variants and `bare` for a glyph without a card face. It requires `aria-label`. The optional `badge` slot places a visual count at the top-end corner. Include a meaningful count in `aria-label` or an accessible description. Small icon buttons have a 28×28px target with a 16px glyph.

Both render a native `type="button"` by default and forward native props and refs. Set `aria-pressed` from application state to flatten a toggle in place. `loading` disables activation, sets `aria-busy`, and shows a `Pinwheel` in place of the leading icon or action glyph. The label and any corner badge remain visible.

```tsx
import { Button, Icon, IconButton, Sticker } from '@randalvance/kraft-ui';

<Button variant="dashed" leading={<Icon name="plus" />}>Add note</Button>
<Button variant="text" tone="danger">Remove draft</Button>
<IconButton variant="bare" aria-label="Inbox, 12 unread"
  badge={<Sticker size="count" tone="attention">12</Sticker>}>
  <Icon name="inbox" />
</IconButton>
```

### Edit pages

`FormSection` groups `children` on a paper sheet. Pass a `title` and an optional `hint` for the handwritten note alongside it. The title names the native `<section>` by default. `titleAs` selects `h1` through `h6` and defaults to `h2`. Use `titleAs="h3"` for a section nested under an `h2` and adjust deeper sections to match the document hierarchy.

`PageHeader` renders a native `<header>` with a `title`, `titleAs` (`h1` by default), and optional `back`, `leading`, `status`, and `actions` slots above a dashed rule. Use a `Link` in `back` and an `Avatar` or mark in `leading`. Both components forward native props and refs to their root elements.

The header sticks at the top of its nearest scroll container. For edit forms, put the header and the independently scrolling body in separate rows of a bounded layout so focused fields stay visible. A submit `Button` in `actions` can use the native `form` attribute to submit the form below it.

Keep a `role="status"` element mounted in the status slot so changes are announced. Use “All saved” at rest, “Unsaved changes” after edits, and “Saved” briefly after a successful save before returning to “All saved”. A setting row with only a name, a note, and a switch is a `Toggle` with `labelSide="start"`. To put other content between them, pair the visible name and note with the `Toggle` through `aria-labelledby` and `aria-describedby`, and put the optional metadata next to the switch.

```tsx
import { useId, type FormEvent } from 'react';
import { Avatar, Button, FormSection, Inline, Link, PageHeader, Stack, Text, Toggle } from '@randalvance/kraft-ui';

function ProfileSettings({ saveStatus, onSave, onEdit }: {
  saveStatus: 'All saved' | 'Unsaved changes' | 'Saved';
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: () => void;
}) {
  const id = useId();
  return <main style={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', blockSize: '100dvh' }}>
    <PageHeader title="Edit Mochi’s profile"
      back={<Link href="/profiles">All profiles</Link>}
      leading={<Avatar initial="M" decorative />}
      status={<span role="status">{saveStatus}</span>}
      actions={<Button variant="blue" type="submit" form={id}>Save changes</Button>} />
    <form id={id} aria-label="Profile settings" onSubmit={onSave} onChange={onEdit}
      style={{ overflow: 'auto', padding: 16 }}>
      <FormSection title="Notifications" hint="For the shelter team">
        <Inline justify="between" wrap gap={16}>
          <Stack gap={4}>
            <Text id={`${id}-name`} variant="label">Adoption inquiries</Text>
            <Text id={`${id}-note`} tone="muted">Receive messages about this profile.</Text>
          </Stack>
          <Inline gap={8}>
            <Text as="span" variant="label-sm" tone="muted">Email</Text>
            <Toggle name="inquiries" defaultChecked aria-labelledby={`${id}-name`} aria-describedby={`${id}-note`} />
          </Inline>
        </Inline>
      </FormSection>
    </form>
  </main>;
}
```

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

- `Mat` frames its children in an inset paper sheet. Use `tone="kraft"` (default), `tone="amber"` for work awaiting review, `tone="sage"` for finished work, or `tone="red"` for the red cardboard of the `Composer` frame. Use `padding` to set the sheet's inner spacing (default `16`) and `as` to choose the frame's native element. The ref points to the frame.
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

### Card and CardAddTile

`Card` renders a paper article with `header`, `media`, `children` (body), `footer`, and `corner` slots. The corner sits beside the heading at the inline end. `tone` adds a spine in any `CardTone` (`neutral`, `blue`, `sage`, `danger`, `attention`, `ochre`, `teal`, `violet`, `plum`, `blush`, or `navy`). `off` dims the paper while keeping actions available. Supply a visible status such as “Paused” if the off state carries meaning. `selected` marks the edge and adds a check. `tilt` sets an optional rotation in degrees and follows `ThemeProvider`.

Use `as="a"` with `href` for navigation or `as="button"` for an action. Give the primary target a name with `aria-labelledby` or `aria-label`. The whole paper surface activates that target, and controls inside slots have their own pointer and keyboard behavior. Custom interactive regions can opt into their own pointer hit area with `data-card-interactive`. With `selected`, the button reports `aria-pressed`, and the link defaults to `aria-current="true"`. The ref and native props reach the primary action (or the article in the static variant). `className` and `style` apply to the outer article.

`CardAddTile` is a dashed button with a decorative plus and required handwritten `label`. It accepts native button props and a button ref. Both button components default to `type="button"`. Place the tile in the same grid as the cards to match its row height.

Both components have a base height of `10rem`, which suits a grid of tiles. For a card that holds a line or two, such as one on a board, in a list, or in a thread, pass `size="compact"` (`CardSize`: `"default"` or `"compact"`). A compact card or tile is as tall as its content. To change the base height instead, set `--kraft-card-min-height` on the card or an ancestor; a compact card ignores it.

```tsx
import { Card, CardAddTile, Heading, Icon, IconButton } from '@randalvance/kraft-ui';

<Card as="a" href="/workspaces/print" aria-labelledby="print-title" tone="teal"
  header={<Heading as="h2" id="print-title">Print Studio</Heading>}
  corner={<IconButton aria-label="Pin Print Studio" onClick={pinWorkspace}><Icon name="pin" /></IconButton>}
  footer="4 agents · 2 boards">
  Track packaging proofs and studio runs.
</Card>;
<CardAddTile label="Add workspace" onClick={addWorkspace} />;

<Card size="compact" as="a" href="/threads/csv-export" aria-label="Add CSV export" header="Add CSV export">
  Waiting on your review
</Card>;
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

### Stamp

`Stamp` prints its text `children` in outlined, typewriter capitals on the underlying paper. Pass `signature` to add a name in a second cell. `tone` accepts `neutral` (default), `blue`, `sage`, `danger`, or `attention`. `StampSize` supports `sm`, `md` (default), and `lg`.

The default `as="span"` renders a static impression. Use `as="button"` for a native toggle with a faded dashed outline when off and a solid ink impression when on. Pass `pressed` (default `false`) and update it from `onClick`. The stamp text and signature form the button's accessible name. Native props and refs reach the chosen element, and the button defaults to `type="button"`.

Pass `animate` for a brief stamp-down motion on mount for a static stamp, or when the toggle shows its pressed impression. Motion respects the theme setting and the system preference for reduced motion. The theme tilt setting controls the ink impression.

```tsx
import { Stamp } from '@randalvance/kraft-ui';

function ApprovalStamp({ approved, onToggle }: { approved: boolean; onToggle: () => void }) {
  return <Stamp as="button" tone="sage" size="sm" signature="Mara" animate
    pressed={approved} onClick={onToggle}>Done</Stamp>;
}
```

### StatusDot and StatusSticker

`StatusDot` is a small coloured mark for the state of something: beside a word, in a legend, or on the corner of a portrait. `tone` is required and takes a `StatusTone`: `working`, `waiting`, `blocked`, `done`, or `idle`. Colour is never the only signal. Pass visible `children` to print a label beside the dot, or an accessible `label` when the dot stands alone; a labelled dot is one named image. Each tone also has its own form by default: working is a solid disc, waiting a dashed ring, blocked a solid square, done a disc with a tick, and idle a hollow ring. `variant="solid" | "hollow" | "dashed"` and `shape="round" | "square"` override the form. `size` takes `8`, `10` (default), or `12` pixels; the cut ring, stroke, and number of dashes scale together, so every size keeps its shape. The cut ring uses the theme's light or dark backing, so a dot stays at 3:1 or better on paper, kraft, and cardboard in both themes.

`StatusSticker` is a small uppercase sticker for a state such as RUNNING, IDLE, or BLOCKED. Its `children` are the words, read as written; the capitals are only drawn. `tone` takes a `StatusTone`. `variant="solid"` (default) fills the sticker with the tone, `"paper"` prints ink on plain paper inside a tone edge, and `"ghost"` draws a dashed tone outline over the surrounding material in its ink. `indicator="dot"` adds a decorative dot in the tone's form, and `indicator="spinner"` adds the shared Pinwheel, which stops when motion is off. `size` is `"sm"` (10px text) or `"md"` (11px, default); every length is in em, so a custom font size from 8 to 12px keeps the shape. Both components are noninteractive spans that stay upright when tilt is on. Native props and the ref reach the outer span. Add `role="status"` to a sticker yourself if its changes should be announced.

```tsx
import { StatusDot, StatusSticker } from '@randalvance/kraft-ui';

<StatusDot tone="working">Working</StatusDot>;
<StatusDot tone="blocked" size={12} label="Blocked" />;
<StatusSticker tone="working" indicator="spinner">Running</StatusSticker>;
<StatusSticker tone="idle" variant="ghost">Idle</StatusSticker>;
```

### Tag

`Tag` takes a text label in `children`. The default `variant="kraft"` has a pointed edge, a punched hole, and monospaced ink for ticket keys, branches, models, and PR numbers. Use `variant="paper"` for workspace labels. Pass `leading` for a decorative icon or `swatch` for a decorative CSS color. The label truncates with an ellipsis in narrow layouts and retains its full accessible name. Optional `tilt` sets a rotation in degrees and defaults to `0`. Tag follows `ThemeProvider` for texture, motion, and tilt, and respects system reduced motion.

By default Tag renders a static `span`. Set `as="a"` with `href` for navigation or `as="button"` for an action. Native props and the ref reach the chosen element. The button defaults to `type="button"`. `className` and `style` apply to the outer tag, so `maxInlineSize` can constrain the whole tag.

Pass `onRemove` with a `removeLabel` such as “Remove Print Studio” to add a separately focusable close button. The application removes the tag in the callback and can move focus to the next tag or a nearby control. A disabled primary button still allows removal.

```tsx
import { Icon, Tag } from '@randalvance/kraft-ui';

<Tag as="a" href="/branches/main" leading={<Icon name="branch" />}>main</Tag>;
<Tag as="button" onClick={openTicket}>KW-19</Tag>;
<Tag variant="paper" swatch="var(--kraft-teal)" onRemove={removeWorkspace}
  removeLabel="Remove Print Studio">Print Studio</Tag>;
```

### CorkBoard and Pin

`CorkBoard` draws textured cork in a wooden frame. Native props and the ref reach the frame; choose `as="div"` (default) or `as="section"` with an `aria-label`. The cork scrolls inside the frame: set `maxHeight` to cap it or `height` to fix it. When the cork overflows it becomes a keyboard stop named by `scrollLabel` (default “Scrollable board”).

`layout` chooses how the board arranges its children:

- `grid` (default) flows children into equal cells at least `minItemWidth` pixels wide (default 208).
- `free` places each `CorkBoardItem` by `x` and `y` in pixels from the cork's top-left corner, with `z` for stacking order. Give the board a `height`. The cork grows a scroll area to fit items placed beyond its edge. Items are `minItemWidth` wide.
- `columns` lines up `CorkBoardColumn`s for a Kanban board and scrolls sideways when they do not fit.

`CorkBoardItem` wraps one pinned thing in any layout and draws its `pin` over the top edge. Pass `onMove` and a `label` to make a free item movable by keyboard: it becomes a named tab stop, the arrow keys call `onMove` with the next `{ x, y }`, and Shift moves five steps. `step` sets the distance in pixels (default 8). The item never moves past the top or left edge, the focused item comes to the front, and the board scrolls to follow it. Store the position yourself and pass it back as `x` and `y`. The board does not add pointer dragging; if you add it, keep `onMove` so every move also works without a drag.

`CorkBoardColumn` renders a named `<section>` with a pinned kraft header that stays in view while the board scrolls. `name` is its heading (`headingLevel`, default 3) and names the region. `count` shows a number beside it; pass `countLabel`, such as “3 notes”, for what screen readers hear in its place. `pinTone` colors the header's tack. Size columns with `--kraft-cork-board-column-width` (default `15rem`).

`Pin` draws a tack with a highlight in `tone="red"` (default), `blue`, `green`, or `amber`. It is a decorative span by default; pass `label` to expose it as a named image. `as="button"` makes it a native button that requires a `label`, such as “Unpin the poster proof”, lifts on hover, and has a 28px target. Native props and the ref reach the span or button.

```tsx
import { CorkBoard, CorkBoardColumn, CorkBoardItem, Pin, StickyNote } from '@randalvance/kraft-ui';

function Wall({ notes, onMove, onUnpin }: WallProps) {
  return <CorkBoard as="section" aria-label="Poster plan" layout="free" height={420}>
    {notes.map(note => <CorkBoardItem key={note.id} label={note.text} x={note.x} y={note.y} z={note.z}
      onMove={position => onMove(note.id, position)}
      pin={<Pin as="button" label={`Unpin ${note.text}`} onClick={() => onUnpin(note.id)} />}>
      <StickyNote>{note.text}</StickyNote>
    </CorkBoardItem>)}
  </CorkBoard>;
}

<CorkBoard as="section" aria-label="Poster plan" layout="columns" maxHeight={480}>
  <CorkBoardColumn name="To do" count={2} countLabel="2 notes">
    <StickyNote>Order cream paper</StickyNote>
    <StickyNote tone="blue">Pick three photographs</StickyNote>
  </CorkBoardColumn>
  <CorkBoardColumn name="Done" count={1} countLabel="1 note" pinTone="green">
    <StickyNote tone="sage" status="done">Book the print studio</StickyNote>
  </CorkBoardColumn>
</CorkBoard>;
```

The package exports `CorkBoardProps`, `CorkBoardLayout`, `CorkBoardItemProps`, `CorkBoardPosition`, `CorkBoardColumnProps`, `PinProps`, and `PinTone`.

### AppShell and RailTile

`AppShell` lays out a full application page: a `rail` of navigation tiles, an optional `topBar`, an optional cardboard `board`, and one paper sheet. The shell fills the viewport (`block-size: 100dvh`; override it with `style` or `className`) with a 3px margin, and the rail, board, and sheet body each scroll on their own. `sheetHead` stays fixed above the scrolling sheet body, which is rendered in `main`. The rail is a `nav` named by `railLabel` (default “Main”), and `railFooter` sits at its foot. A `board` needs a `boardLabel`, which names its `aside`.

When the shell is 720px wide or less (a container query on the shell, not the viewport), the board becomes a dismissible overlay. A tile-shaped toggle at the top of the rail opens it and moves focus inside; its close button or Escape closes it and returns focus to the toggle. Control it with `boardOpen` and `onBoardOpenChange`, or start it open with `defaultBoardOpen`. `boardToggleLabel` and `boardCloseLabel` default to “Show {boardLabel}” and “Close {boardLabel}”.

`RailTile` is a 44px card tile in any `CardTone`. It renders an `a` by default; pass a router link through `as`, with the link component forwarding its ref so the tooltip can attach. `label` is the accessible name and the tooltip. `current` sets `aria-current="page"` and presses the tile flat; an `aria-current` set by your router wins. `count` adds a badge (shown as “99+” above 99), and the accessible name becomes “Inbox, 3 new” — change the suffix with `countLabel`. Put tiles in a list.

```tsx
import { AppShell, Icon, RailTile } from '@randalvance/kraft-ui';
import { Link } from '@tanstack/react-router';

<AppShell
  rail={<ul>
    <li><RailTile as={Link} to="/inbox" tone="blue" label="Inbox" current count={3}><Icon name="inbox" /></RailTile></li>
    <li><RailTile as={Link} to="/boards" tone="sage" label="Boards"><Icon name="kanban" /></RailTile></li>
  </ul>}
  railFooter={<RailTile href="/settings" label="Settings"><Icon name="settings" /></RailTile>}
  board={<SavedFilters />} boardLabel="Filters"
  sheetHead={<h1>Inbox</h1>} sheetLabel="Inbox">
  <Letters />
</AppShell>;
```

### Banner, Callout, EmptyState, and Toast

`Banner` is a full-width paper strip that pairs one control with a line of consequence. Pass the control, such as a `Toggle` or `Button`, in `control`, a short bold lead in `title`, and the line itself as `children`. `controlSide="start"` (default) or `"end"` places the control, and the reading order follows it. `tone` takes the five shared tones and washes the paper lightly; the strip is its own paper, so its ink reads on any material. It has no role: add `role="status"` or `role="alert"` when the line should be announced as it changes.

`Callout` is a bordered note with a thick tone edge at the start. It takes `children`, an optional `title`, a decorative `leading` icon, an `action` slot, and a `tone`. `tone="danger"` with an `action` is the danger form: the consequence in words beside the button that carries it out. The note has `role="note"`; pass `role="alert"` for one that appears after an error. Inside a Banner or Callout the muted, link, danger, and attention inks lean toward the plain ink to keep 4.5:1 on the tinted paper.

`EmptyState` is a dashed placeholder for a list or page with nothing in it. `title` says what is missing, `children` explain why, `action` offers the next step, and `leading` holds a decorative mark. `size` is `"md"` (default) or `"sm"`. It has no face and prints in the ink of the material that holds it. The title is a paragraph by default; set `titleAs` to the heading level that fits the page.

`Toast` is a brief kraft slip confirming an action. `onUndo` adds an Undo button and `onDismiss` adds a close button; rename them with `undoLabel` and `dismissLabel`. The application owns the list of toasts and removes one when `onDismiss` reports a `ToastDismissReason` of `"undo"`, `"close"`, or `"timeout"`. `duration` in milliseconds starts a countdown that restarts after the pointer or keyboard focus leaves the toast; leave it out to keep the toast until it is dismissed, which is the safer choice when Undo is the only way back. Escape dismisses a focused toast, and focus then returns to whatever had it when the toast appeared, if that element is still there. Each toast is a polite, atomic live status. Render toasts inside one mounted `ToastRegion`, a landmark named by `label` (default “Notifications”) and fixed to the viewport at `placement="bottom" | "bottom-end" | "top" | "top-end"`. The slip fades in only when theme motion is on and the system does not ask for reduced motion. All five components forward native props and the ref to their outer `div`.

```tsx
import { Banner, Button, Callout, EmptyState, Toast, ToastRegion, Toggle } from '@randalvance/kraft-ui';

<Banner tone="attention" title="Autopilot is on." role="status"
  control={<Toggle checked={autopilot} onChange={setAutopilot}>Autopilot</Toggle>}>
  Agents merge approved work without asking you first.
</Banner>;

<Callout tone="danger" title="Delete this workspace"
  action={<Button variant="danger" onClick={deleteWorkspace}>Delete workspace</Button>}>
  All boards, cards, and history are removed for everyone. This cannot be undone.
</Callout>;

<EmptyState title="No cards yet" action={<Button variant="dashed">Add a card</Button>}>
  Cards appear here when an agent picks up a task.
</EmptyState>;

<ToastRegion>
  {toasts.map(toast => <Toast key={toast.id} onUndo={() => restore(toast.card)}
    onDismiss={() => removeToast(toast.id)}>{toast.card.title} archived</Toast>)}
</ToastRegion>;
```

### Stat, Timeline, and Stepper

`Stat` prints a large handwritten `value` over a small `label`. `tone` inks the figure in one of the five shared tones, using an ink that keeps 4.5:1 on paper, kraft, and cardboard in both themes; the caption says what the figure means, so the tone is never the only signal. `size` sets the figure at 26 (`"sm"`), 38 (`"md"`, default), or 52px (`"lg"`), and `align` is `"start"`, `"center"`, or `"end"`.

`Timeline` is an ordered list of dated events from `items`. Each `TimelineItem` has an `id` and `title`, with optional `time`, machine-readable `dateTime` (which renders a native `<time>`), `description`, `trailing`, a marker `tone` from `StatusTone`, and `current`. The default `orientation="vertical"` draws ruled history rows: a time column, a marker on a thread, the event, and a dashed rule under each row. `orientation="horizontal"` draws a schedule lane of equal slots along one thread; when the lane is wider than its container it becomes a focusable scroll region named by `scrollLabel`. Set `--kraft-timeline-time-width` or `--kraft-timeline-slot` to resize the time column or the slots. The current item has `aria-current="time"`, a heavier marker-pen title, and a ringed marker. A tone only colours the marker, so say the state in the title. Native props and the ref reach the `ol`.

`Stepper` shows progress through `steps`. Each `StepperStep` has an `id`, a `label`, an optional `description` and `trailing` note, and a `status` (`StepStatus`): `done`, `current`, `upcoming` (default), or `blocked`. `variant="pipeline"` (default) stacks the steps on a vertical thread. `variant="track"` is one compact row of marks that prints only the current step's label. The marks differ in form as well as colour: a ticked disc, a ring with a dot, a dashed ring, and a crossed square. Every label is followed by its state in words for assistive technology; rename the words with `statusLabels`. The current step has `aria-current="step"`. The stepper is a static `ol` and is not interactive.

```tsx
import { Stat, Stepper, Timeline } from '@randalvance/kraft-ui';

<Stat value={12} label="Blocked cards" tone="danger" />;

<Timeline aria-label="Pull request history" items={[
  { id: 'opened', time: '09:14', dateTime: '2026-11-24T09:14', title: 'Pip opened the pull request', tone: 'done' },
  { id: 'checks', time: '10:02', title: 'Checks are running', tone: 'working', current: true },
]} />;

<Stepper variant="track" steps={[
  { id: 'plan', label: 'Plan', status: 'done' },
  { id: 'build', label: 'Build', status: 'current' },
  { id: 'ship', label: 'Ship' },
]} />;
```

### Meter, SlotMeter, Gauge, and Sparkline

Four ways to show how much of something is used. None of them is interactive. `Meter`, `SlotMeter`, and `Gauge` are each one `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and an `aria-valuetext` in words; each needs a name from `label` or from visible text through `aria-labelledby`. Their fills are status inks on the theme's light or dark backing, so they keep 3:1 on paper, kraft, and cardboard in both themes, and every state also differs in form.

`Meter` is a ruler. Pass one `value` with an optional `tone` (`StatusTone`), or `segments` laid end to end from `min`. Each `MeterSegment` has an `id`, a `label`, a `value`, a `tone`, and a `fill` (`MeterFill`): `solid` and `hatched` count toward the value, and `free` is dashed-outline room that does not. `min` and `max` default to 0 and 100. `ticks` takes the distance between ticks or a list of values, and `tickLabels` prints them under the ruler. `limit` draws a limit mark; any amount past it is drawn as a cross-hatched spill and added to the text alternative. A legend of the segments prints under the ruler unless `legend={false}`. `variant="bar"` (`MeterVariant`) is an 8px strip that keeps the fills, limit mark, and spill and drops the ticks and legend. `formatValue` formats every printed and spoken number, and `valueText` replaces the default text alternative, which reads each segment and the maximum.

`SlotMeter` draws one paper slot for each place under `cap`. `slots` lists the taken places in order, as a `StatusTone` or a `SlotMeterSlot` with an `id` and `tone`; the remaining places are empty dashed cuts, and slots past the cap are not drawn. Working is solid, waiting hatched, blocked crossed, done ticked, and idle hollow. `size` (`SlotMeterSize`) is `"sm"` or `"md"`, a long row wraps, `toneLabels` renames tones in the default text alternative (`4 of 6, 2 working, 1 waiting, 1 blocked`), and `valueText` replaces it.

`Gauge` is a half dial with a needle. `value` sits between `min` and `max`, the arc fills in a `tone`, and the figure prints in handwriting under the needle unless `showValue={false}`. By default the figure and the text alternative are a whole percentage of the range; `formatValue` and `valueText` change them. `limit` marks the dial and draws the arc past it as a danger zone, and a value past it is said in the text alternative. `size` (`GaugeSize`) is `"sm"` (72px), `"md"` (120px), or `"lg"` (168px); set `--kraft-gauge-size` for another width. The needle swings only when theme motion is on and the system allows motion, and the figure tilts only when theme tilt is on.

`Sparkline` draws a small bar for each `SparklinePoint` (`label` and `value`) in `data`, oldest first, in the ink of the surrounding material. A day with nothing keeps a 1px stub. `max` fixes the value of a full-height bar, and `limit` draws a dashed line and hatches the bars past it in danger ink. `size` (`SparklineSize`) is `"sm"` (16px tall) or `"md"` (24px). It is one named image: the text alternative is `label` followed by every point, or your own `summary` for a long series.

Native props and the ref reach the outer `div` of the three meters and the outer `span` of the sparkline.

```tsx
import { Gauge, Meter, SlotMeter, Sparkline } from '@randalvance/kraft-ui';

<Meter label="Seats" max={24} limit={20} ticks={4} tickLabels segments={[
  { id: 'used', label: 'Used', value: 12 },
  { id: 'held', label: 'Held', value: 4, fill: 'hatched', tone: 'waiting' },
  { id: 'free', label: 'Free', value: 8, fill: 'free', tone: 'idle' },
]} />;
<Meter variant="bar" label="Storage" value={45} />;

<SlotMeter label="Agents" cap={8} slots={['working', 'working', 'waiting', 'blocked']} />;
<Gauge label="Disk used" value={62} limit={80} />;
<Sparkline label="Messages per day" limit={8} data={[
  { label: 'Mon', value: 3 }, { label: 'Tue', value: 9 }, { label: 'Wed', value: 5 },
]} />;
```

### TagInput, Pager, Breadcrumb, Toolbar, and CollapsibleGroup

`TagInput` is a field of removable slips with an inline add field. Pass `value` and `onValueChange`, or `defaultValue`, as arrays of strings. Enter or a comma adds what was typed, a pasted comma-separated list adds each part, and a slip already present is not added twice. Enter in an empty field still submits the form. Backspace in the empty field moves focus to the last slip's remove button rather than deleting it, and removing a slip moves focus to the one that took its place or back to the field. Place it inside a `FormField` for the label, description, and error. The ref and native input props reach the add field; `className` and `style` size the whole field, and `inputClassName` and `inputStyle` reach the input. `name` submits each slip under one form name, `variant` picks the `paper` (default) or `kraft` Tag, `removeLabel` names each remove button (default “Remove {tag}”), and `tagsLabel` names the list. A disabled field shows its slips without remove buttons.

`Pager` puts previous and next buttons around an optional `range`, such as “21–40 of 87”, and optional page `dots`. Pages run from 1 to `pageCount`; control `page` with `onPageChange`, or set `defaultPage`. The buttons disable at the first and last page. The range is announced politely when it changes. Each dot is a 24px button named by `pageLabel` (default “Page 3”), and the current one has `aria-current="page"` and a larger filled mark. `label`, `previousLabel`, and `nextLabel` rename the landmark and buttons. Native props and the ref reach the `nav`.

`Breadcrumb` renders `items` as an ordered list in a `nav` named by `label`. A `BreadcrumbItem` has a `label`, an optional `href`, and optional `id` and `current`. Items with an `href` are links; the last item is the current page unless another sets `current`, and it has `aria-current="page"`. Separators are decorative and reverse in right-to-left text. `linkAs` renders links with a router component that accepts `href`.

`Toolbar` is a paper strip of actions with `role="toolbar"` and a required `label`. Wrap related controls in `ToolbarGroup`, which takes an optional `label` and `align`. Neighbouring groups are separated by a dashed rule, and `align="end"` pushes a group and those after it to the far end. The toolbar is one tab stop: the arrow keys, Home, and End move between its enabled controls, the arrows reverse in right-to-left text, and Tab returns to the control used last. Arrow keys inside a text field or select keep their native behaviour.

`CollapsibleGroup` is a native `details` disclosure with a tinted header and a paper body. `title` names it, `count` prints a count sticker, and `countLabel` says what the count is for assistive technology, such as “3 cards”. `tone` takes any `CardTone`. Use `defaultOpen`, or control `open` with `onOpenChange`; a controlled group keeps showing the application's state when a change is declined. Groups that share a `name` open one at a time. Enter and Space toggle the summary, and closed content stays findable with the browser's find-in-page. Native props and the ref reach the `details` element.

```tsx
import { Breadcrumb, Button, CollapsibleGroup, FormField, Pager, TagInput, Toolbar, ToolbarGroup } from '@randalvance/kraft-ui';

<FormField label="Labels"><TagInput value={labels} onValueChange={setLabels} name="label" /></FormField>;

<Pager pageCount={5} page={page} onPageChange={setPage} dots range={`${first}–${last} of ${total}`} />;

<Breadcrumb items={[{ label: 'Workspaces', href: '/workspaces' }, { label: 'Print Studio' }]} />;

<Toolbar label="Card actions">
  <ToolbarGroup label="Edit"><Button size="sm" variant="ghost">Rename</Button></ToolbarGroup>
  <ToolbarGroup align="end"><Button size="sm" variant="text" tone="danger">Delete</Button></ToolbarGroup>
</Toolbar>;

<CollapsibleGroup name="columns" title="Waiting on review" count={3} tone="attention" defaultOpen>…</CollapsibleGroup>;
```

### Composer

`Composer` is the prompt box: a red cardboard frame around ruled paper, with key hints, a mic disc, and a send disc inside the frame and a bar for the application's own controls. It wraps one native `<textarea>`. The ref and native textarea props reach it, including `name`, `value` or `defaultValue`, `onChange`, `placeholder`, `required`, `disabled`, and `form`. `className` and `style` size the whole frame, and `inputClassName` and `inputStyle` reach the textarea. Name it with `aria-label`, a `<label>`, or a `FormField`, which also supplies its description and error. The placeholder is written in the hand face.

The paper starts at `rows` lines (2 by default), grows with the text up to `maxRows` lines (7 by default), and then scrolls with its rules.

Enter sends and Shift+Enter adds a line. `sendKey="mod-enter"` (`ComposerSendKey`) sends on Ctrl+Enter or ⌘+Enter instead and leaves Enter to add a line. The send key calls `onSend` with the text. Inside a form, or with the `form` attribute, it also submits that form the way a single-line input does: it presses the form's first submit button, so validation, the button's `onClick`, and `onSubmit` all run, and a disabled submit button holds the form. Blank text is never sent, a held key sends once, and an Enter that confirms an input-method composition is left alone. Call `preventDefault()` in your own `onKeyDown` to take a key over. The composer does not clear the text: empty a controlled `value`, or reset the form.

The keys are shown as `Kbd` hints that follow `sendKey` and are the textarea's accessible description. `hints` replaces them with your own content, such as a translation, and `hints={null}` removes them.

`bar` holds the application's controls, such as a model `Select`, a `Gauge`, a `Stamp`, and folder and branch `Tag`s. `mic` and `send` hold the actions, and an `IconButton` in either is drawn as a disc. The tab order is the textarea, the bar, the mic, and then send. Pressing the frame or a hint moves focus to the textarea; the bar and the actions keep their own presses. The application owns what it puts in these slots: the names, a pressed mic, a send disc that turns blue once there is text, and the stop button that replaces it.

`busy` means the application is working on the last message. The send key is held, the textarea stays editable and is marked `aria-busy`, and a Pinwheel shows beside `busyLabel` (“Working…” by default) in a polite status region. The default hints give way to that status; your own `hints` stay. `disabled` disables the textarea and quiets the frame. Disable the controls in the slots yourself.

The frame rises by a pixel while focus is inside it. The rise follows the theme motion setting and the system preference for reduced motion. The frame, card, and discs stay upright when tilt is on. `ComposerProps` and `ComposerSendKey` are exported.

```tsx
import { useState } from 'react';
import { Composer, Icon, IconButton, Stamp, Tag } from '@randalvance/kraft-ui';

function Prompt({ busy, onSend, onStop }: { busy: boolean; onSend: (text: string) => void; onStop: () => void }) {
  const [draft, setDraft] = useState('');
  const [yolo, setYolo] = useState(false);
  const send = () => {
    if (busy || !draft.trim()) return;
    onSend(draft);
    setDraft('');
  };
  return <Composer aria-label="Message the agent" placeholder="Write to the agent…" busy={busy}
    value={draft} onChange={event => setDraft(event.currentTarget.value)} onSend={send}
    bar={<>
      <Stamp as="button" size="sm" tone="danger" pressed={yolo} onClick={() => setYolo(!yolo)}>Yolo</Stamp>
      <Tag variant="paper" leading={<Icon name="folder" />}>lighthouse</Tag>
      <Tag leading={<Icon name="branch" />}>main</Tag>
    </>}
    mic={<IconButton size="sm" aria-label="Dictate"><Icon name="microphone" /></IconButton>}
    send={busy
      ? <IconButton variant="danger" aria-label="Stop the agent" onClick={onStop}><Icon name="stop" /></IconButton>
      : <IconButton variant={draft.trim() ? 'blue' : 'neutral'} aria-label="Send message" onClick={send}><Icon name="send" /></IconButton>} />;
}
```

In a form, a submit button in `send` and the send key both submit it:

```tsx
<form onSubmit={event => {
  event.preventDefault();
  start(new FormData(event.currentTarget).get('job'));
  event.currentTarget.reset();
}}>
  <Composer aria-label="Describe the job" name="job" required sendKey="mod-enter" rows={3}
    send={<IconButton type="submit" variant="blue" aria-label="Start the session"><Icon name="send" /></IconButton>} />
</form>;
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

`Toggle` is drawn as a pull-tab: a thick card tab slides in a slot cut into the paper, and the open half of the slot shows a handwritten “on” or “off” and turns blue when on. The written state is decorative and hidden from assistive technology, because the switch already announces it. `ToggleProps` adds `labelSide` (`ToggleLabelSide`: `"end"` by default, or `"start"`). `labelSide="start"` puts the label and its `description` before the switch and stretches the label across its container, so a settings row reads name first and switch last. The whole row is still the label, so clicking the name or the note toggles the switch. The slide follows the theme motion setting and the system preference for reduced motion, the written word tilts with the theme tilt setting, and the tab travels the other way in right-to-left text.

```tsx
import { Stack, Toggle } from '@randalvance/kraft-ui';

function DeskSettings() {
  return <Stack gap={16}>
    <Toggle labelSide="start" name="autosave" defaultChecked description="Saves after each edit.">Autosave</Toggle>
    <Toggle labelSide="start" name="tilt" description="Rotates paper decorations slightly.">Tilt</Toggle>
  </Stack>;
}
```

`CheckboxProps` adds `leading` for a decorative portrait or swatch and `trailing` for a note announced with the description. Both slots take noninteractive content and toggle the checkbox when clicked. The box stays aligned to the first line as the label wraps. Set `strikeWhenChecked` to cross out the main label when checked. `CheckboxVariant` offers `"ink"` (default, filled box) and `"pen"` (a handwritten tick on paper).

`CheckboxGroup` and `CheckboxGroupProps` provide a native fieldset and ref, with a `label` as its legend and dashed rules between rows. Pass one checkbox child per cell. `orientation` defaults to `"vertical"`. Use `"horizontal"` for choices that wrap, or use `columns` to cap the number of equal-width columns. The grid drops columns in narrow containers. Supply `tally` as optional progress text, such as `"4 of 8"`. Calculate it from application state. Each checkbox keeps its own native state and form props, and setting `disabled` on the fieldset disables its choices.

`CheckboxStatus` and `CheckboxStatusProps` provide a 36px static mark with `checked`, `indeterminate`, and `variant`. Supply a `label` that describes the item and its state, such as `"Cover proof approved"`. Native span props and the ref reach the mark.

```tsx
import { Avatar, Checkbox, CheckboxGroup, CheckboxStatus } from '@randalvance/kraft-ui';

<CheckboxGroup label="Print jobs" columns={2} tally="1 of 2">
  <Checkbox variant="pen" strikeWhenChecked defaultChecked trailing="Tuesday">Trim covers</Checkbox>
  <Checkbox variant="pen" strikeWhenChecked leading={<Avatar decorative initial="MP" size={24} />}>
    Check the proofs
  </Checkbox>
</CheckboxGroup>;

<CheckboxStatus variant="pen" checked label="Cover proof approved" />;
```

`TextField`, `Textarea`, and `SearchField` keep native input behavior, including refs, controlled or initial values, validation, and form submission. Put one control inside `FormField` to connect a visible `label`, optional `description`, and `error` to that control automatically. An error draws a dashed red field edge, sets `aria-invalid`, and becomes part of its accessible description; application code decides when to show it. Set `controlId` on `FormField` when another element needs the input ID. Each control can also stand alone with an external `<label>` and `id`, or an `aria-label`. `className` and `style` on `TextField` and `Textarea` apply to the native input or textarea; on `SearchField` and `FormField` they apply to the outer element.

- `FormField` supports `labelStyle="uppercase"` for small printed labels. The default is `"default"`.
- `TextField` supports `variant="boxed" | "underline"` and `size="sm" | "md" | "lg" | "title"`. The default appearance is boxed and medium. Title size uses the handwritten face. Numeric `size` values still reach the native input.
- `Textarea` supports `variant="boxed" | "ruled"`, with `boxed` as the default. Set `mono` for monospaced text and `autoGrow` to fit the content, starting at the native `rows` height. With `autoGrow` off, the textarea keeps its vertical resize handle. Use `footer` for a character or token count below the textarea. Its text contributes to the accessible description.
- `SearchField` draws its paper frame around the native search input, so `className` and `style` size the whole field and it can share a flex row, such as a toolbar, without an extra wrapper. Use `inputClassName` and `inputStyle` to reach the input itself. `icon` replaces the leading search mark, for example with a funnel; it is decorative, and `icon={null}` removes it. `trailing` shows content after the text, such as a `Kbd` hint or a result count. It sits beside the input box, so the browser's clear button never covers it. Pressing the frame or a passive hint focuses the input; buttons and links in `trailing` keep their own behavior.
- `InlineEdit` renders a heading that opens an editor on click or focus. Supply a `label` for the editing action, `value` or `defaultValue`, and `onValueChange` to handle edits. `placeholder` defaults to “Untitled”, `titleAs` defaults to `h1`, and `disabled` shows a static heading. Enter commits, Escape cancels, and both return focus to the title button. Leaving the field commits and lets focus continue to its destination. The ref and native div props apply to the wrapper.

`FormFieldProps`, `TextFieldProps`, `TextareaProps`, `SearchFieldProps`, and `InlineEditProps` are exported.

```tsx
import { useState } from 'react';
import { FormField, InlineEdit, SearchField, Textarea, TextField } from '@randalvance/kraft-ui';

function AgentFields() {
  const [description, setDescription] = useState('');
  return <form>
    <InlineEdit label="Edit page title" defaultValue="Field notes" />
    <FormField label="Agent name" labelStyle="uppercase" description="Shown in sessions">
      <TextField name="name" variant="underline" required placeholder="Name this agent" />
    </FormField>
    <FormField label="Description">
      <Textarea name="description" variant="ruled" mono autoGrow rows={3} value={description}
        onChange={event => setDescription(event.currentTarget.value)} footer={`${description.length} characters`} />
    </FormField>
    <FormField label="Find notes"><SearchField name="query" placeholder="Search notes…" /></FormField>
  </form>;
}
```

`Kbd` draws a small paper keycap for a key hint. Pass one key as children, or a chord as `keys`; a chord renders nested `<kbd>` elements joined by a plus sign, as HTML recommends, so it reads as one combination. `size="sm"` fits inside a field or a menu row; the default is `"md"`. Keycaps stay upright when tilt is on. Native props and the ref reach the outer `<kbd>`.

```tsx
import { Inline, Kbd, SearchField } from '@randalvance/kraft-ui';

<Inline gap={8}>
  <SearchField aria-label="Search letters" style={{ width: 240 }} trailing={<Kbd size="sm">/</Kbd>} />
  <SearchField aria-label="Filter" icon={<FunnelIcon />} style={{ flex: 1 }} trailing="12 results" />
</Inline>;

<p>Press <Kbd keys={['Ctrl', 'K']} /> to open the command list.</p>;
```

`RadioGroup` renders native radio inputs on paper rows. Supply a group `label`, a shared form `name`, and options with unique `value` strings. Optional descriptions are announced separately from option names. Use `defaultValue` or controlled `value` with `onValueChange`. Native arrow keys, form submission, `required`, and disabled choices work without extra application code.

Choose a form with `variant`:

- `rows` (default): paper rows with a radio mark. `trailing` is not width-capped, so it can hold a count, a `Stamp`, or a handwritten `<Text as="span" variant="hand">` note. It sits at the end of the row while the mark, label, and description keep 9rem beside it. In a narrower row or card it moves to its own line under the description, so neither the label nor the trailing content is squeezed.
- `flat`: plain rows where only the picked row is highlighted, for sort or filter menus.
- `swatch`: a row of colour swatches. Each option's `swatch` takes any CSS colour, such as `var(--kraft-teal)`.
- `picture`: picture-only options, such as a portrait picker. Pass decorative content, for example `<Avatar decorative />`, as each option's `picture`.

Swatch and picture options draw no label; `label` becomes the radio's accessible name through `aria-label`, and `description` is still announced. The picked swatch or picture is ringed, keyboard focus outlines the whole 44px target, and a disabled swatch is struck through. Set `columns` to lay options out as equal-width cards (it overrides `orientation`, and the cards drop to fewer columns when each would be narrower than 10rem). With `orientation="horizontal"`, rows share the width equally even when options have descriptions.

```tsx
<RadioGroup label="Care plan" name="plan" columns={3} defaultValue="pack" options={[
  { value: 'pup', label: 'Pup', description: 'One pet, weekly walks' },
  { value: 'pack', label: 'Pack', description: 'Up to four pets, daily walks' },
  { value: 'shelter', label: 'Shelter', description: 'Unlimited pets and a care log' },
]} />
<RadioGroup label="Workspace colour" name="colour" variant="swatch" defaultValue="teal" options={[
  { value: 'teal', label: 'Teal', swatch: 'var(--kraft-teal)' },
  { value: 'plum', label: 'Plum', swatch: 'var(--kraft-plum)' },
]} />
```

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

Set `variant="compact"` on `Select` for a shorter trigger that fits the selected label. The trigger also displays that option’s `leading` icon and `statusDot` when supplied. `statusDot` takes a `Tone` of `neutral`, `blue`, `sage`, `danger`, or `attention`. Keep status meaning in the visible option label so the marks can stay decorative. `hideLabel` keeps the field name accessible in dense layouts. `SelectProps` and `SelectOption` are exported, and the ref reaches the trigger button.

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
import { Button, Icon, Menu, RadioGroup, Select } from '@randalvance/kraft-ui';

function WorkChoices() {
  return <>
    <RadioGroup label="Effort" name="effort" defaultValue="medium" options={[
      { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ]} />
    <Select label="Proof status" name="status" variant="compact" defaultValue="review" options={[
      { value: 'review', label: 'In review', leading: <Icon name="clock" />, statusDot: 'attention' },
      { value: 'approved', label: 'Approved', leading: <Icon name="check" />, statusDot: 'sage' },
    ]} />
    <Menu label="Note actions" trigger={<Button>Actions</Button>} items={[
      { id: 'copy', label: 'Copy note' }, { id: 'delete', label: 'Delete note', destructive: true },
    ]} onAction={id => { /* Handle the chosen action. */ }} />
  </>;
}
```

`ActionableList` and `ActionableListProps` name a flat collection. `ActionableListItem` and `ActionableListItemProps` use `href` for a native link, `onActivate` for a native button, or static content when both are omitted. Use `current` for the active destination and `disabled` for an unavailable row. The list and item refs point to the native `ul` and `li`.

`RowDensity` covers `"default"` and `"compact"`. Set `density="compact"` on a list or individual item for 28px single-line rows. An item's `density` overrides its list. Rows grow with multiline content or larger controls.

`RowContentOptions` is shared by list items and tree nodes. Use inline React content in `label` and `description`, `truncateLabel` for one-line ellipsis, and `clampDescription` for a maximum visible line count. Clipped copy stays available to assistive technology. `leading` is decorative and noninteractive `trailing` detail can use the space its content needs. `done` strikes the label and mutes row copy. Use `trailing` for a written status when completion needs to be announced explicitly.

Use `actions` for separately labelled controls. `RowActionsVisibility` covers `"always"` (default) and `"hover"`. Hover actions reserve space and appear on row hover or keyboard focus. They stay visible on touch. For example, a compact queue can put a short key before the title and show a pin beside it.

```tsx
import { ActionableList, ActionableListItem, Icon, IconButton } from '@randalvance/kraft-ui';

export function PrintQueue({ onPin }: { onPin: () => void }) {
  return <ActionableList aria-label="Print queue" density="compact">
    <ActionableListItem href="/proofs/12" label={<><code>KW-12</code> Final print proof</>}
      description={<>Check the <strong>cover margins</strong> before printing.</>}
      truncateLabel clampDescription={1} actionsVisibility="hover"
      actions={<IconButton size="sm" variant="bare" aria-label="Pin final print proof" onClick={onPin}>
        <Icon name="pin" />
      </IconButton>} />
    <ActionableListItem label="Initial proof" done trailing="Complete" />
  </ActionableList>;
}
```

`Drawer` and `DrawerProps` provide a native paper aside with a rich `title` and optional rich `description`. Put a tag or stamp above the title with `eyebrow`, place decorative content beside the title with `leading`, and use `actions` for labelled controls next to close. Supply `onClose` to show the close button and `closeLabel` to customize its accessible name. The `footer` stays below the scrolling body by default. Set `footerPlacement="scroll"` to scroll them together.

`ResizablePane` and `ResizablePaneProps` fill a container with a defined height. Both `main` and `pane` are independently scrolling flex columns. Pass multiple Drawers in a fragment to stack them in the side pane. The caller controls `open` and focus return. Use `defaultSize` for an uncontrolled width or `size` and `onSizeChange` for a controlled width, with optional `minSize` and `maxSize` in CSS pixels. The divider accepts pointer dragging, Left/Right arrows, Home, and End. Use `side="start"` for the leading edge and `resizeLabel` to name the divider. Use `mainLabel` and `paneLabel` to name the keyboard-focusable scroll regions when their content overflows. At container widths of 600px or less, the open side pane takes the full width.

`PaperPanel` standardizes a titled sheet with a blank paper body. It accepts `leading`, `controls`, `navigation`, and `footer` slots around `children`. The title labels the section, and `titleAs` selects its heading level. The body has a default minimum height of 220px; override `--kraft-panel-body-min-height` when a workspace needs more room. Override `--kraft-panel-frame` and `--kraft-panel-frame-edge` together for a tinted frame, checking header text contrast against the chosen color. Application controls and navigation keep their own behavior.

`Dialog` and `DialogProps` provide a controlled modal paper sheet. Pass `open`, `onOpenChange`, and a rich `title`, with optional `titleAs` and rich `description`. Use `eyebrow` for a stamp above the title, `leading` for a decorative mark, `actions` for labelled controls beside close, and `footer` for form actions. The exported `DialogSize` type covers `sm` (400px), `md` (560px, default), and `lg` (720px). The dialog fits the viewport and keeps its top edge in place when its height changes. Override the width with `--kraft-dialog-width` when needed.

Native `<dialog>` keeps focus inside while open and returns it to the opener on close. Escape, the close button, and a backdrop click request dismissal. Set `dismissible={false}` when the user must choose an action inside the dialog. Use `closeLabel` to customize the close button's accessible name. The title receives initial focus by default. Pass `initialFocusRef` to focus a task-specific element.

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

`TreeView` and `TreeViewProps` render a named hierarchy from `TreeNode` objects with unique, stable `id` values. Set `density="compact"` for 28px single-line rows and `branchStyle="plain"` for a file navigator with flat branches. `TreeBranchStyle` covers `"board"` (default) and `"plain"`. The ref points to the native `ul`.

Branches expand and collapse. Leaves select by default. Set `selectable: true` to select a branch or `selectable: false` for a read-only leaf. Use `selectionMode="none"` to turn off selection across the tree. Arrow keys navigate visible items, Home and End jump to the edges, and Enter or Space activates the focused item. Typeahead uses the rendered label text, or the node's `textValue` when supplied. Expansion and selection can be uncontrolled (`defaultExpandedIds`, `defaultSelectedId`) or controlled (`expandedIds`, `selectedId`) with change callbacks.

Nodes support the same rich copy, clipping, `done`, `actions`, and `actionsVisibility` options as list items. The row's name includes its label, description, and trailing detail. Actions have their own names and keyboard focus. Tab reaches the action controls, and activating one leaves tree selection and expansion alone. Disabled nodes have no action controls.

```tsx
import { TreeView, type TreeNode } from '@randalvance/kraft-ui';

const pages: TreeNode[] = [
  { id: 'ideas', label: 'Ideas', children: [
    { id: 'sketches', label: <code>sketches.md</code> },
    { id: 'notes', label: <code>notes.md</code>, description: 'Three pages', truncateLabel: true, clampDescription: 1 },
  ] },
];

export function Pages({ onOpen }: { onOpen: (id: string) => void }) {
  return <TreeView aria-label="Pages" items={pages} defaultExpandedIds={['ideas']} density="compact" branchStyle="plain"
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

`Icon` renders the 32 original single-ink design-system glyphs and 30 additional application glyphs. Its required `name` is an `IconName` union, so unknown names are compile errors. `size` accepts pixels or a CSS length; omitted, it follows the surrounding text (`1em`) or the existing IconButton, Tabs, and list slot sizing. An explicit size overrides slot sizing. SVGs inherit `currentColor`, stay upright and static, and accept native SVG attributes, `className`, `style`, and an `SVGSVGElement` ref. `IconProps`, `IconDefinition`, and generic `NamedIconProps` are exported types.

Icons are decorative (`aria-hidden`) and unfocusable by default. Use `label`, native `aria-label`, or `aria-labelledby` to expose a standalone image with `role="img"`; `label` takes precedence over `aria-label`. Empty labels stay decorative, and explicit `aria-hidden` can hide a named icon. Put actions inside a named Button or IconButton so keyboard operation and visible focus belong to the control.

```tsx
import { Button, Icon, IconButton } from '@randalvance/kraft-ui';

<Button><Icon name="microphone" />Record</Button>;
<IconButton aria-label="Close panel"><Icon name="close" /></IconButton>;
<Icon name="pin" size={24} label="Pinned" />;
```

The original names are `agent`, `agents`, `background`, `board` (nested squares, for tasks), `branch`, `bulb` (ideas), `check`, `chevron-down`, `clipboard` (artifacts), `code`, `copy`, `factory`, `home`, `inbox`, `kanban`, `knowledge`, `mark`, `mcps`, `memory`, `pinwheel`, `plus`, `pull-requests`, `search`, `send`, `sessions`, `settings`, `share`, `skills`, `stop`, `trash`, `workflows`, and `workspaces`. Additional names are `microphone`, `close`, `pin`, `pencil`, `sync`, `folder`, `file`, `new-file`, `new-folder`, `grip`, `three-dots`, `terminal`, `clock`, `bolt`, `eye`, `link`, `chevron-left` (back), `power`, `key`, `moon` (night mode), `chevron-right`, `sparkle`, `filter`, `graph`, `expand`, `sliders`, `activity`, `ban`, `question`, and `editor` (open in an editor). `iconNames` lists the full catalogue.

The ready-made `Icon` supports runtime name lookup and includes the full catalogue. To tree-shake unused glyphs, import individual definitions and create a local Icon once at module scope. Each definition is named by its camel-cased icon name plus `Icon`, such as `newFileIcon` or `chevronLeftIcon`. The resulting component has the same props and ref support, with `name` restricted to the supplied keys. This requires no registration, provider, network requests, or bundler plugin.

```tsx
import { createIcon, searchIcon, closeIcon } from '@randalvance/kraft-ui';

const AppIcon = createIcon({ search: searchIcon, close: closeIcon });

<AppIcon name="search" size={20} />;
// <AppIcon name="folder" /> is a compile error; its glyph is absent from the bundle.
```

## Themes and customization

Use `<ThemeProvider theme="night" texture={false} motion={false} tilt={false}>` for a quieter Night interface. The tilt setting controls paper decoration and opt-in Avatar rotation; Sticker marks stay upright. Providers are scoped, can nest, and do not mutate the document. Reduced-motion preferences always disable transitions. Theme selection is explicit: applications choose persistence and system-preference behavior.

CSS variables use the `--kraft-` prefix. Override them on an application scope, for example `style={{ '--kraft-font-sans': 'Your font, sans-serif' } as React.CSSProperties}`. Surfaces provide material-aware ink roles: `--kraft-content-ink`, `--kraft-content-muted`, `--kraft-content-link`, `--kraft-content-faint`, `--kraft-content-danger`, and `--kraft-content-attention`. Use `--kraft-content-danger` for danger text instead of a raw red: it stays readable on paper, kraft, and cardboard in both themes. Nested surfaces and providers reset those roles for their own material/theme. `--kraft-red-2` and `--kraft-blue-2` are readable text inks on paper in both themes; in Night they are light tints. Use `--kraft-blue-deep` for a deep blue edge or face. Icons inside a Badge or Sticker print in the mark's ink. Night kraft uses its readable primary ink for secondary copy. Raw foundation tokens are available from `@randalvance/kraft-ui/tokens.json`. The stylesheet has root token defaults; visual resets and typography are scoped to Kraft components and providers.

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
