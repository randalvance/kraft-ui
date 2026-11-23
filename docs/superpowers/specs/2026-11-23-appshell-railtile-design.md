# AppShell and RailTile — design

Issue: [#24](https://github.com/randalvance/kraft-ui/issues/24)

## Intent

An application should get Kraft UI's "diorama" page layout from the library instead of assembling it from stand-ins. The layout is a rail of coloured navigation tiles, an optional top bar, an optional cardboard board, and one paper sheet filling the viewport. The gaps were found while building the Primepaw prototype from Kraft UI components. That prototype isn't available locally, so issue #24 is the spec. Every acceptance criterion in #24 is covered below, and nothing in the issue was dropped.

## Goals

- `AppShell` lays out the rail, an optional top bar, an optional board, and the sheet with the 3px margin. Each region scrolls on its own.
- `RailTile` is a navigation link drawn as a 44px card tile in any card tone. It is pressed flat for the current page (`aria-current="page"`) and has an optional count badge and a tooltip.
- The sheet supports a fixed head over a scrolling body.
- The layout works down to a narrow width (320px), where the board becomes dismissible.
- Both components work in Paper and Night, with texture, motion and tilt on and off, and pass the contrast checks.
- They meet WCAG 2.2 AA (PRODUCT.md): keyboard operation, visible focus, accessible names.

## Non-goals

- No routing. `RailTile` renders whatever link component the app passes; the app decides which tile is current.
- No library-wide breakpoints. The narrow behaviour is local to `AppShell` (see Constraints).
- No resizable board. `ResizablePane` already covers resizing and can sit inside the sheet.
- No collapsible or expandable rail with text labels. Tiles are icon-only, and their names come from the tooltip and the accessible name.

## Anti-goals

- Measuring the viewport in JavaScript to choose a layout. That would break server rendering and cause a layout flash.
- A board overlay that traps focus or blocks the page like a modal. It is a disclosure, not a dialog.
- A rail tile whose only name is the tooltip. Screen-reader and touch users never see the tooltip.

## Constraints (from the codebase)

- **Tokens already exist:** `--kraft-rail`, `--kraft-board`/`board-2`, `--kraft-sheet`, `--kraft-lift-board-sm`, `--kraft-press-board`, `--kraft-pulp-board`, `--kraft-space-3`. Card tones come from `CardTone` in `src/card.tsx` (Tone plus ochre, teal, violet, plum, blush, navy), and their pigments are in `card.css`.
- **Polymorphism:** follow the existing `as` pattern (`PolymorphicProps` / `PolymorphicComponent` in `src/primitives.tsx`). Those types aren't exported yet, so export them internally or move them to a small shared module.
- **No breakpoints:** DESIGN.md says "There is no library-wide grid… or responsive breakpoint". The only precedent is `ResizablePane`'s container query (`@container kraft-resizable-pane (max-width: 600px)` in `interactive.css`). Narrow behaviour must use a container query on the shell, not `@media`.
- **Reuse:** `ScrollRegion` (named, focusable scroll stops), `Tooltip`/`TooltipProvider` (Radix, trigger via `asChild`, so the trigger must forward refs and props), and the focus outline convention `outline: 2px solid var(--kraft-ink)`.
- **Theme flags:** the `data-kraft-motion`/`texture`/`tilt` attributes on `ThemeProvider`, plus `prefers-reduced-motion` and `forced-colors`, as in `card.css` and `cork-board.css`.
- **Checks:** `npm run check` runs typecheck, unit (jsdom), buttons and contrast (browser), story tests in both themes, build, and build-storybook.

## Approaches

1. **(Picked) `RailTile` takes a polymorphic `as`, default `<a>`.** It works with TanStack `Link`, Next `Link` or any component that forwards its ref, and it matches `Box`, `Text`, `Surface` and `Card`. The trade-off is more complex generic typing, and router links must forward refs so the tooltip can attach.
2. **Plain `<a>` only**, like `Link` today. Simpler, but every routed app has to wrap or re-implement it. Rejected by Randal.
3. **`asChild`/Slot.** Not used anywhere else in the library's public API, so it would be a new idiom. Not pursued.

For the narrow board, a container query plus a CSS-driven disclosure was the only option that fits the SSR and no-breakpoint constraints. Measuring width in JavaScript is an anti-goal.

## The design

### Public API

```tsx
export type AppShellProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  /** RailTiles (or other rail content). Rendered in <nav>. */
  rail: ReactNode;
  /** Accessible name of the rail <nav>. Default "Main". */
  railLabel?: string;
  /** Optional content at the foot of the rail (e.g. account avatar, settings tile). */
  railFooter?: ReactNode;
  /** Optional top bar, rendered in <header>. */
  topBar?: ReactNode;
  /** Optional cardboard board, rendered in <aside>. */
  board?: ReactNode;
  /** Accessible name of the board <aside> and its scroll region. Required when `board` is set. */
  boardLabel?: string;
  /** Narrow layout only: whether the board is shown. Controlled/uncontrolled pair. */
  boardOpen?: boolean;
  defaultBoardOpen?: boolean; // default false
  onBoardOpenChange?: (open: boolean) => void;
  /** Labels for the narrow-layout show/close buttons. Defaults "Show {boardLabel}" / "Close {boardLabel}". */
  boardToggleLabel?: string;
  boardCloseLabel?: string;
  /** Fixed head of the sheet (title row, toolbar, tabs). Does not scroll. */
  sheetHead?: ReactNode;
  /** Accessible name of the sheet's scroll region. Default: none (labelled by `sheetLabel` if given). */
  sheetLabel?: string;
  /** Sheet body. Scrolls. Rendered in <main>. */
  children?: ReactNode;
};
export const AppShell: ForwardRefExoticComponent<AppShellProps & RefAttributes<HTMLDivElement>>;

export type RailTileProps = {
  /** Accessible name and tooltip text. Required. */
  label: string;
  /** Icon glyph (usually <Icon>). Decorative; hidden from AT. */
  children: ReactNode;
  tone?: CardTone;               // default 'neutral'
  /** Sets aria-current="page" and the pressed-flat look. */
  current?: boolean;
  /** Count badge. 0/undefined → no badge. Shows "99+" above 99. */
  count?: number;
  /** Appended to the accessible name when count is shown. Default `(n) => \`${n} new\``. */
  countLabel?: (count: number) => string;
  /** Tooltip side. Default 'right' ('left' in RTL is left to Radix collision handling). */
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
};
// Polymorphic: <RailTile as={RouterLink} to="/inbox" label="Inbox">…</RailTile>, default 'a'.
export const RailTile: PolymorphicComponent<RailTileProps, 'a'>;
```

A caller-supplied `aria-current` is passed through and wins over `current`. Either one produces the pressed look, because the CSS keys off `[aria-current]:not([aria-current="false"])`. That way, router links that set `aria-current` themselves (TanStack, Next with a helper) style correctly without `current`.

### DOM and landmarks

```
div.kraft-app-shell            (root: ref, className, style, data-board-open; container-type: inline-size; container-name: kraft-app-shell)
 └ div.kraft-app-shell-grid     (the grid; a container query can't restyle its own container, so the grid is an inner element)
 ├ nav.kraft-app-rail  aria-label=railLabel
 │   ├ [narrow only] button.kraft-app-board-toggle  aria-expanded aria-controls=board id
 │   ├ ul > li > RailTile …   (when `rail` is an array/fragment the app supplies its own list; see below)
 │   └ div.kraft-app-rail-footer
 ├ header.kraft-app-topbar     (optional)
 ├ aside.kraft-app-board  id  aria-label=boardLabel   (optional)
 │   ├ [narrow only] close button
 │   └ ScrollRegion (label=boardLabel)
 └ main.kraft-app-sheet
     ├ div.kraft-app-sheet-head   (optional, fixed)
     └ ScrollRegion.kraft-app-sheet-body (label=sheetLabel)
```

The rail content is rendered as given. The app should pass tiles inside a list (`<ul>`/`<li>`), and the stories and README show that. `AppShell` doesn't wrap children in a list, because apps may add separators or groups.

### Layout

- **Root and grid:** the root is the query container, and the inner grid element carries the layout below.
- **Root:** `block-size: 100dvh` by default, overridable by `style` or `className`. The root itself never scrolls. It shows the cardboard ground (`--kraft-board` with `--kraft-pulp-board` when texture is on), with `padding: var(--kraft-space-3)` and `gap: var(--kraft-space-3)`. That 3px is "the 3px margin" around the sheet and between regions.
- **Grid:**
  - columns `[rail] auto [board] auto [sheet] minmax(0, 1fr)`
  - rows `[top] auto [main] minmax(0, 1fr)`
  - The rail spans both rows. The top bar spans the board and sheet columns. The board and sheet sit in the main row.
  - When there's no top bar or no board, the grid collapses those tracks.
- **Rail:** on the `--kraft-rail` ground, tiles in a column. `overflow-y: auto` so long rails scroll on their own. The footer is pushed to the bottom.
- **Board:** a cardboard surface (`--kraft-board`, radius-10, lift-board as cardboard Surface does), with a default width of `clamp(220px, 24cqi, 320px)`. The body scrolls via `ScrollRegion`.
- **Sheet:** a paper face (`--kraft-sheet`, radius-4, lift-paper-1). The head is fixed (`flex: none`) above a `ScrollRegion` body that scrolls (`min-block-size: 0`). The paper sheet fills its cell, so it fills the viewport minus the 3px margin.

### Narrow behaviour (container query, ≤ 720px of shell width)

- The board leaves the grid. It is positioned over the sheet from the inline-start edge, next to the rail, with a lifted cardboard shadow. It is hidden (`display: none`) unless the shell has `data-board-open`.
- A board toggle button appears at the top of the rail. It is a 44px tile-styled button with `aria-expanded` and `aria-controls`, labelled `boardToggleLabel`. On wide layouts it is `display: none`, so it's out of the tab order and the accessibility tree.
- The open board shows a close button (the existing `kraft-overlay-close` look), labelled `boardCloseLabel`.
- **Behaviour:**
  - Opening moves focus to the board.
  - Escape inside the board, the close button, or the toggle closes it and returns focus to the toggle.
  - Activating a link inside the board doesn't auto-close it; the app can close it via the controlled prop.
  - There is no focus trap and no backdrop: the sheet stays interactive.
- Escape and the close button only act when the toggle is actually rendered. Check this at event time with `toggle.checkVisibility()`, falling back to `toggle.offsetParent !== null`. That reads the CSS result once per key press, doesn't choose a layout, and is SSR-safe. On wide layouts Escape in the board does nothing, and the close button is `display: none`.
- On wide layouts `boardOpen` has no visible effect. The board is always shown, and the state is kept so switching widths doesn't lose it.
- The whole thing is SSR-safe. The server renders all regions, CSS decides which are visible, and no width is measured in JavaScript.
- Down to 320px: the rail stays a vertical 56px column (44px tile + 6px gutters), and the sheet takes the rest.

### RailTile look

- A 44×44px card tile with radius-4 (matching paper tiles). The face is the tone pigment. `neutral` uses the paper face (`--kraft-paper`) rather than `--kraft-board`, because board is nearly the same colour as `--kraft-rail` and the tile would disappear. The board toggle uses the neutral tile. Every tile's boundary (face or edge) must reach 3:1 against `--kraft-rail` in both themes, and the contrast matrix checks it. It has the card edge treatment and rests on `--kraft-lift-board-sm`.
- **Hover:** `--kraft-lift-board-up` and a 1px lift.
- **Active and current:** `--kraft-press-board` and a 2px translate, "pressed flat". Current also gets an inset ink keyline, so the state isn't conveyed by shadow alone (WCAG 1.4.1).
- **Motion:** transitions only when `data-kraft-motion="on"` and `prefers-reduced-motion: no-preference`.
- **Tilt:** tiles stay upright, because they are controls, not decoration (DESIGN.md: decoration tilt). Tilt on or off must not change them.
- **Glyph:** the icon is inked in a colour that meets 3:1 against each tone face (non-text contrast) in both themes. Choose ink or sheet per tone as `card.css` does for its spines.
- **Count:** a small `Badge`-styled pill at the top-end corner, showing `99+` above 99. It is `aria-hidden`; the count reaches the accessible name through a visually hidden suffix (`Inbox, 3 new`). The badge text meets 4.5:1.
- **Focus:** `outline: 2px solid var(--kraft-ink); outline-offset: 3px`, on the rail ground in both themes.
- **Forced colours:** `LinkText`/`CanvasText` borders, with current marked by `Highlight`.
- **Tooltip:** `Tooltip` with `content=label`. `AppShell` wraps the rail in a `TooltipProvider` so moving between tiles skips the delay. A standalone `RailTile` still works because `Tooltip` provides its own provider.

### Files

- `src/app-shell.tsx` (both components) and `src/app-shell.css` (imported from `styles.css`). Export from `src/index.ts`.
- `stories/AppShell.stories.tsx` and `stories/RailTile.stories.tsx` (see Testing).
- `tests/app-shell.test.tsx` (unit) plus additions to `tests/contrast.browser.test.tsx`.
- README, PRODUCT.md (add `AppShell` and `RailTile` to the component list, with a sentence on props), DESIGN.md (a short "App shell and rail" component section), and a changeset (minor).

### Testing

- **Unit (jsdom):**
  - landmarks (nav, header, aside, main) and their names
  - ref forwarding on both components
  - native props pass-through
  - `as={CustomLink}` receives `to` and forwards the ref
  - `current` → `aria-current="page"`; caller `aria-current` wins
  - accessible name includes the count; badge shows `99+`; no badge when the count is 0
  - board toggle `aria-expanded` and `aria-controls`; controlled and uncontrolled open
  - Escape closes the board and returns focus
  - `renderToString` for both components, with and without the board
- **Stories:**
  - AppShell: Default; With top bar; Without board; Long content (independent scroll); Sheet head; Narrow (story wrapped in a 375px-wide container, which exercises the container query; play opens and closes the board via keyboard); Night; Texture/motion/tilt off.
  - RailTile: every tone; Current; Count (1, 12, 120); Router link via `as`; Focus.
  - Play functions assert roles, names and state. Story tests run in both themes via `test:stories`.
- **Contrast:** add tiles in each tone (glyph 3:1, badge text 4.5:1, tile boundary 3:1 against the rail) and the current state to the contrast matrix for both themes, texture on.

## Left to the builder

- The exact pixel values for tile edge, keyline and badge offset, within the look above. Match Card and IconButton.
- Whether `PolymorphicProps`/`PolymorphicComponent` move to a shared internal module or are exported from `primitives.tsx` (internal, not part of the public index).
- Default label strings beyond those named above.
- Story copy and the icons used in stories.

## Calls made by Claude (not explicitly decided by Randal)

- Top bar spans the board and sheet columns; the rail runs full height.
- Narrow threshold: 720px of shell width (container query, not viewport).
- The narrow board is a non-modal overlay with a toggle at the top of the rail, with no focus trap or backdrop.
- Tiles never tilt.
- The neutral tile is paper-faced, so it stands apart from the rail.
- Escape and close in the board act only when the narrow toggle is rendered (checked at event time).
- The root is the container and an inner element is the grid.
- Accessible name for the count is `"{label}, {n} new"` by default, customisable via `countLabel`.
- The root defaults to `100dvh`.
- The app supplies the `<ul>`/`<li>` around tiles.
