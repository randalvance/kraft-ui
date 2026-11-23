# AppShell and RailTile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `AppShell` (the diorama page layout: rail, optional top bar, optional board, paper sheet) and `RailTile` (a 44px navigation card tile) from Kraft UI, closing issue #24.

**Architecture:**
- Both components live in `src/app-shell.tsx`, with styles in `src/app-shell.css` imported by `src/styles.css`.
- Layout is CSS grid on an inner element. The root is an inline-size query container, and narrow behaviour is a `@container kraft-app-shell (max-width: 720px)` rule.
- The narrow board is a non-modal disclosure driven by `data-board-open` on the root.
- `RailTile` is polymorphic through the library's existing `as` pattern and wraps itself in the existing `Tooltip`.

**Tech Stack:** React 18/19 + TypeScript, plain CSS custom properties, Radix Tooltip (already a dependency), Vitest (jsdom unit + Playwright browser projects), Storybook 10 story tests.

**Spec:** `docs/superpowers/specs/2026-11-23-appshell-railtile-design.md`. Read it before starting any task; it holds the full API, DOM tree and look.

## Global Constraints

- No `@media` width breakpoints. Narrow behaviour only via `@container kraft-app-shell (max-width: 720px)`.
- No JavaScript width measurement and no `window` access during render. Everything must pass `renderToString`.
- The 3px margin and gap use `var(--kraft-space-3)`. The root defaults to `block-size: 100dvh`.
- `RailTile` is 44×44px, `as` defaults to `'a'`, `tone` is `CardTone` (default `'neutral'`), and the neutral face is `--kraft-paper`.
- Current state: `aria-current="page"` from `current`. A caller's `aria-current` wins. CSS keys off `[aria-current]:not([aria-current="false"])`.
- Count: no badge when the count is `undefined`, `<= 0` or not finite. Show `99+` above 99. The default accessible-name suffix is `` `${n} new` `` (name = `` `${label}, ${countLabel(n)}` ``).
- Focus: `outline: 2px solid var(--kraft-ink)`. Transitions only under `[data-kraft-motion="on"]` and `prefers-reduced-motion: no-preference`. Tiles never tilt.
- Contrast: glyph ≥ 3:1 on the tile face, badge text ≥ 4.5:1, tile boundary ≥ 3:1 against `--kraft-rail`, and focus outline ≥ 3:1. All in both themes.
- Every exported component forwards refs and native props. Class names are prefixed `kraft-app-` / `kraft-rail-tile`.
- Commits are made only when Randal asks. Each task's "Commit" step stages the files and **asks before committing**.

## Review Focus

1. **A router link passed via `as` that sets its own `className` or `aria-current`.** Expected: the `kraft-rail-tile` class is kept (merged), the caller's `aria-current` wins, and the router-only props (`to`) reach the component. Test in Task 1.
2. **Strange `count` values (`0`, `-3`, `NaN`, `4.7`).** Expected: no badge for the first three; `4.7` shows `4`, and the name uses the floored value. Test in Task 1.
3. **Escape inside the board on a wide layout,** where the toggle is `display: none`. Expected: nothing happens. State is unchanged and focus doesn't move to `<body>`. Test in Task 3.
4. **Controlled `boardOpen` with an `onBoardOpenChange` that ignores the request.** Expected: the board stays as the prop says, and focus doesn't move into a board that didn't open. Test in Task 3.
5. **`board` given without `boardLabel`.** Expected: it's a TypeScript error (a discriminated union), so the `<aside>` is never unnamed. Test in Task 2 with `@ts-expect-error`.

---

### Task 1: RailTile

**Files:**
- Modify: `src/primitives.tsx:8-9`. Export the `PolymorphicProps` and `PolymorphicComponent` types (add `export`, nothing else). Don't add them to the README; they are internal helpers that the index already re-exports via `export *`, which is acceptable.
- Create: `src/app-shell.tsx`
- Create: `src/app-shell.css`
- Modify: `src/styles.css`. Add `@import './app-shell.css';` after `./edit-page.css`.
- Modify: `src/index.ts`. Add `export * from './app-shell.js';`
- Test: `tests/app-shell.test.tsx`

**Interfaces:**
- Produces: `RailTile: PolymorphicComponent<RailTileProps, 'a'>`, and `RailTileProps = { label: string; children: ReactNode; tone?: CardTone; current?: boolean; count?: number; countLabel?: (count: number) => string; tooltipSide?: 'top'|'right'|'bottom'|'left' }`.
- DOM:
  - The element is `<Tag class="kraft-rail-tile" data-tone={tone}>`.
  - It contains `<span class="kraft-rail-tile-glyph" aria-hidden="true">{children}</span>` and a visually hidden `<span class="kraft-visually-hidden">{label}{count suffix}</span>`.
  - When a count is shown, it also contains `<span class="kraft-rail-tile-count" aria-hidden="true">{display}</span>`.
  - Check `styles.css` for an existing visually-hidden utility class and reuse it if present.
- The whole tile is passed as `trigger` to `Tooltip` (`content={label}`, `side={tooltipSide ?? 'right'}`).

- [ ] **Step 1: Write the failing tests** in `tests/app-shell.test.tsx` under `describe('RailTile')`:
  - `renders a named link and forwards ref and native props`
    - Render `<RailTile ref={ref} href="/inbox" id="t" className="mine" label="Inbox"><svg /></RailTile>`.
    - Expect `getByRole('link', { name: 'Inbox' })` to be `ref.current`.
    - It has `href="/inbox"`, `id="t"`, both classes `kraft-rail-tile` and `mine`, and `data-tone="neutral"`.
  - `marks the current page`
    - `current` gives `getByRole('link', { current: 'page' })`.
    - Without `current`, the `aria-current` attribute is absent.
    - With `current` and `aria-current="step"`, the attribute is `step`.
  - `renders through a router link via as and keeps its props`
    - Define `const RouterLink = forwardRef<HTMLAnchorElement, { to: string } & ComponentPropsWithoutRef<'a'>>(({ to, ...p }, r) => <a ref={r} href={to} data-router="" {...p} />)`.
    - Render `<RailTile as={RouterLink} to="/x" label="X" className="c">`.
    - Expect the `href` to be `/x`, `data-router` to be present, the classes `kraft-rail-tile c`, and the ref to reach the anchor.
  - `adds a count badge and names it`
    - `count={3}` gives the name `Inbox, 3 new` and `.kraft-rail-tile-count` with text `3` and `aria-hidden="true"`.
    - `count={120}` shows `99+` but the name is `Inbox, 120 new`.
    - `countLabel={n => \`${n} unread\`}` gives `Inbox, 3 unread`.
  - `ignores counts that are not positive` (Review Focus 2)
    - For each of `0`, `-3`, `NaN`: no `.kraft-rail-tile-count`, and the name is exactly `Inbox`.
    - `4.7` gives text `4` and the name `Inbox, 4 new`.
  - `shows its label as a tooltip on focus`: `userEvent.tab()` to the tile, then `await findByRole('tooltip')` has text `Inbox`.
  - `renders on the server`: `renderToString(<RailTile href="/a" label="A" current count={2}>…)` contains `aria-current="page"` and `kraft-rail-tile`.

- [ ] **Step 2: Run to verify they fail.** Run `npx vitest run --project unit tests/app-shell.test.tsx`. Expected: FAIL (`RailTile` is not exported).

- [ ] **Step 3: Implement `RailTile`** in `src/app-shell.tsx` with `forwardRef` cast to `PolymorphicComponent<RailTileProps, 'a'>`, following `Text` in `primitives.tsx`.
  - Compute `shown = Number.isFinite(count) && count > 0 ? Math.floor(count) : undefined`.
  - Set `aria-current={props['aria-current'] ?? (current ? 'page' : undefined)}`.
  - Then add the CSS in `src/app-shell.css`:
    - **Size and shape:** 44px square, radius-4, `--kraft-lift-board-sm` at rest.
    - **Face per tone:** a `--kraft-rail-tile-face` custom property set per `data-tone`, copying the pigments from `card.css:29-39`, except neutral, which uses `--kraft-paper`.
    - **Glyph ink:** `--kraft-ink` or `--kraft-sheet` per tone, whichever passes 3:1; Task 5 verifies.
    - **States:** hover uses lift-board-up, and active/current uses press-board plus `translate: 2px 2px`. Current adds `box-shadow: inset 0 0 0 2px var(--kraft-ink), var(--kraft-press-board)`.
    - **Badge:** a pill at the top-end corner (`inset-block-start: -4px; inset-inline-end: -4px`).
    - **Focus:** focus-visible outline with a 3px offset.
    - **Motion and forced colours:** the motion-gated transition, and a `forced-colors` block (border `LinkText`, current `Highlight`).

- [ ] **Step 4: Run to verify they pass.** Run the same command. Expected: PASS. Also run `npm run typecheck` (expect no errors).

- [ ] **Step 5: Stage and ask to commit.** Stage `src/app-shell.tsx src/app-shell.css src/styles.css src/index.ts src/primitives.tsx tests/app-shell.test.tsx`. Proposed message: `Add RailTile navigation tile`.

### Task 2: AppShell layout (wide)

**Files:**
- Modify: `src/app-shell.tsx`, `src/app-shell.css`
- Test: `tests/app-shell.test.tsx`

**Interfaces:**
- Consumes: `RailTile` (Task 1), `ScrollRegion` from `src/scroll-region.tsx`, and `TooltipProvider` from `src/tooltip.tsx`.
- Produces: `AppShell` (`forwardRef<HTMLDivElement>`) and `AppShellProps`.
  - `AppShellProps` = the spec's props, except that board props are a union: `{ board?: undefined; boardLabel?: never; boardOpen?: never; defaultBoardOpen?: never; onBoardOpenChange?: never; boardToggleLabel?: never; boardCloseLabel?: never } | { board: ReactNode; boardLabel: string; boardOpen?: boolean; defaultBoardOpen?: boolean; onBoardOpenChange?: (open: boolean) => void; boardToggleLabel?: string; boardCloseLabel?: string }`.
- DOM: as in the spec's "DOM and landmarks".
  - The root is `div.kraft-app-shell` with `data-board-open`, present only when the board exists and is open.
  - The child `div.kraft-app-shell-grid` has `data-has-topbar` / `data-has-board`.
  - The rail is wrapped in `TooltipProvider`.
  - The sheet body is `ScrollRegion className="kraft-app-sheet-body" label={sheetLabel}`, and the board body is `ScrollRegion className="kraft-app-board-body" label={boardLabel}`.

- [ ] **Step 1: Write the failing tests** under `describe('AppShell')`:
  - `lays out named landmarks and forwards ref and native props`
    - Render with `rail`, `railLabel="Primary"`, `topBar`, `board`, `boardLabel="Filters"`, `sheetHead={<h1>Inbox</h1>}`, children, `id`, `className`, `ref`.
    - Expect `getByRole('navigation', { name: 'Primary' })`, `getByRole('banner')`, `getByRole('complementary', { name: 'Filters' })` and `getByRole('main')`.
    - Expect the ref to be the root, with the `id` and both classes on it.
    - Expect the heading `Inbox` to be inside `main` but not inside `.kraft-app-sheet-body`.
  - `defaults the rail name and omits optional regions`
    - With only `rail` and children: navigation `Main`, `queryByRole('banner')` null, `queryByRole('complementary')` null.
    - The grid has no `data-has-board`.
  - `renders the rail footer after the tiles`: `.kraft-app-rail-footer` is the last child of `nav`.
  - `requires a board label` (Review Focus 5): a `// @ts-expect-error board needs boardLabel` line rendering `<AppShell rail={null} board={<p />} />`. Typecheck enforces this.
  - `renders on the server`: `renderToString` with and without `board` contains `kraft-app-shell` and `<main`, and doesn't throw.

- [ ] **Step 2: Run to verify they fail.** Run `npx vitest run --project unit tests/app-shell.test.tsx -t AppShell`. Expected: FAIL.

- [ ] **Step 3: Implement the `AppShell` markup and wide CSS.**
  - **Root:** `container: kraft-app-shell / inline-size; block-size: 100dvh; overflow: hidden; background: var(--kraft-board)`, with the `--kraft-pulp-board` layer under `[data-kraft-texture="on"]` (copy how cardboard Surface applies pulp in `styles.css`).
  - **Grid:** `display: grid; block-size: 100%; padding: var(--kraft-space-3); gap: var(--kraft-space-3); grid-template: "rail top top" auto "rail board sheet" minmax(0,1fr) / auto auto minmax(0,1fr)`.
    - With no top bar: rows `"rail board sheet" minmax(0,1fr)`.
    - With no board: columns `auto minmax(0,1fr)`, `"rail top" "rail sheet"`.
  - **Rail:** flex column, gap 8px, padding 6px, `background: var(--kraft-rail)`, `overflow-y: auto`; the footer has `margin-block-start: auto`.
  - **Board:** `inline-size: clamp(220px, 24cqi, 320px)`, cardboard look (radius-10, `--kraft-lift-board`), flex column; the body has `min-block-size: 0; overflow: auto`.
  - **Sheet:** `--kraft-sheet`, radius-4, `--kraft-lift-paper-1`, flex column; the head is `flex: none`, and the body is `flex: 1; min-block-size: 0; overflow: auto`.
  - **Scroll-region focus:** use the same focus-visible inset outline as `styles.css:131`.

- [ ] **Step 4: Run to verify they pass.** Run the same command plus `npm run typecheck`. Expected: PASS, no type errors (the `@ts-expect-error` is consumed).

- [ ] **Step 5: Stage and ask to commit.** Proposed message: `Add AppShell layout`.

### Task 3: Narrow board disclosure

**Files:**
- Modify: `src/app-shell.tsx`, `src/app-shell.css`
- Test: `tests/app-shell.test.tsx`

**Interfaces:**
- Consumes: `AppShell` from Task 2.
- Produces:
  - `button.kraft-app-board-toggle` (the first child of the rail `nav`, rendered only when `board` is set) with `aria-expanded={open}`, `aria-controls={boardId}`, `aria-label={boardToggleLabel ?? \`Show ${boardLabel}\`}`.
  - `button.kraft-app-board-close` inside the board, using the `kraft-overlay-close` class and glyph from `src/drawer.tsx`, with `aria-label={boardCloseLabel ?? \`Close ${boardLabel}\`}`.
  - The internal helper is `isRendered(el: HTMLElement): boolean`, which returns `el.checkVisibility ? el.checkVisibility() : el.getClientRects().length > 0`.

- [ ] **Step 1: Write the failing tests** under `describe('AppShell board')`.
  - jsdom has no layout, so a `beforeEach` stubs `HTMLElement.prototype.checkVisibility = function () { return !this.closest('[data-test-wide]'); }` and an `afterEach` deletes it.
  - `opens and closes the board from the rail toggle`
    - Uncontrolled. Clicking the `Show Filters` button sets `aria-expanded` to `true`, the root gets `data-board-open`, and focus is inside the complementary landmark.
    - Clicking `Close Filters` makes `aria-expanded` `false` and focuses the toggle.
  - `closes on Escape inside the board and returns focus`: open, press `{Escape}`, closed, and the toggle is focused.
  - `ignores Escape when the layout is wide` (Review Focus 3)
    - Render inside `<div data-test-wide>` with `defaultBoardOpen`, focus a button in the board, press `{Escape}`.
    - The root still has `data-board-open`, and `document.activeElement` is still that button.
  - `supports controlled open state` (Review Focus 4)
    - With `boardOpen={false}` and an `onBoardOpenChange` spy, clicking the toggle calls the spy with `true`.
    - `aria-expanded` stays `false`, and focus does not move into the board.
    - Rerendering with `boardOpen` gives `aria-expanded` `true`.
  - `starts closed by default and honours defaultBoardOpen`.

- [ ] **Step 2: Run to verify they fail.** Run `npx vitest run --project unit tests/app-shell.test.tsx -t board`. Expected: FAIL.

- [ ] **Step 3: Implement the disclosure.**
  - **State:** controlled/uncontrolled `open`, using the same pattern as `ResizablePane`'s size in `src/drawer.tsx`.
  - **Moving focus into the board:** use a `useEffect` on a "just opened by user" ref, so it doesn't run on mount, then focus the board's first focusable element or the close button.
  - **Escape:** an `onKeyDown` on the `aside` that acts only if `isRendered(toggleRef.current)`. The close and toggle handlers call `setOpen(false)` and then focus the toggle.
  - **CSS:**
    - The toggle and close button are `display: none` outside the container query.
    - Inside `@container kraft-app-shell (max-width: 720px)`:
      - The grid drops the board column (columns `auto minmax(0,1fr)`, areas `"rail top" "rail sheet"`).
      - The board gets `position: absolute; inset-block: var(--kraft-space-3); inset-inline-start: calc(56px + 2 * var(--kraft-space-3)); z-index: 2; box-shadow: var(--kraft-lift-board)` (the grid is `position: relative`). It is `display: none` unless `.kraft-app-shell[data-board-open]`.
      - The toggle is shown and styled as a neutral 44px tile (reuse the `.kraft-rail-tile` neutral rules via a shared selector); the close button is shown.

- [ ] **Step 4: Run to verify they pass.** Run `npx vitest run --project unit` (the whole unit project, to make sure nothing else regressed). Expected: PASS.

- [ ] **Step 5: Stage and ask to commit.** Proposed message: `Make the AppShell board dismissible on narrow layouts`.

### Task 4: Stories

**Files:**
- Create: `stories/AppShell.stories.tsx` (title `Components/AppShell`)
- Create: `stories/RailTile.stories.tsx` (title `Components/RailTile`)

**Interfaces:**
- Consumes: `AppShell`, `RailTile`, `Icon` (choose names from `iconNames` in `src/icon-glyphs.ts`), and `Badge`/`Heading`/`Text`/`Stack` for content.
- Stories render with `style={{ blockSize: 560 }}`, because the root's 100dvh would otherwise fill the story iframe. That's acceptable for Default, but the fixed height keeps play functions deterministic.

- [ ] **Step 1: Write the RailTile stories.**
  - `Tones`: every `CardTone` in a `<ul>` on a `--kraft-rail` strip.
  - `Current`: play asserts `getByRole('link', { name: 'Inbox', current: 'page' })`.
  - `Counts`: 1, 12 and 120; play asserts the name `Inbox, 120 new` and the visible text `99+`.
  - `RouterLink`: an `as` forwardRef component.
  - `Focus`: play tabs to the tile, expects `toHaveFocus()`, and finds a tooltip with the label.
- [ ] **Step 2: Write the AppShell stories.**
  - `Default` (rail, board, sheet head, body).
  - `WithTopBar`.
  - `WithoutBoard`.
  - `LongContent`: 60 paragraphs in the sheet and 40 board items. Play asserts `main`'s `.kraft-app-sheet-body` has `scrollHeight > clientHeight` and the root's `scrollHeight === clientHeight`.
  - `SheetHead`: play scrolls the body and asserts the head's `getBoundingClientRect().top` is unchanged.
  - `Narrow`: wrapped in `<div style={{ inlineSize: 375 }}>`. Play asserts the complementary landmark is not visible, tabs to `Show Filters`, presses Enter (board visible, focus inside), presses Escape (hidden, toggle focused).
  - `Night` (`globals: { theme: 'night' }`).
  - `Undecorated` (`globals: { texture: 'off', motion: 'off', tilt: 'off' }`).
- [ ] **Step 3: Run the story tests.** Run `npm run test:stories`. Expected: all stories pass in the paper and night runs, including the a11y addon (`a11y: { test: 'error' }`).
- [ ] **Step 4: Look at them.** Run `npm run storybook` and visually check Default, Narrow and Night in the browser (the `run` skill or Playwright MCP): no horizontal scroll at 375px, a visible 3px cardboard margin around the sheet, and current tiles visibly pressed. Fix the CSS if not.
- [ ] **Step 5: Stage and ask to commit.** Proposed message: `Add AppShell and RailTile stories`.

### Task 5: Contrast checks

**Files:**
- Modify: `tests/contrast.browser.test.tsx`. Add `AppShell, RailTile, type CardTone` to the imports, and add a new `it.each([true, false])` inside the existing `describe.each<Theme>(['paper','night'])` block, after the tag test.

- [ ] **Step 1: Write the test** `keeps rail tiles, counts, and focus readable with decoration=%s`.
  - Render a `ThemeProvider data-testid="contrast-matrix"` (same props pattern as the tag test) containing a `<div style={{ background: 'var(--kraft-rail)', padding: 16 }}>` with one `RailTile` per `CardTone`. The first tile is `current`, and every tile has `count={7}`.
  - Mark each `.kraft-rail-tile-count` with `data-contrast` and call `verifyPaintedContrast(matrix)`. The default 4.5 is for badge text.
  - For each tile:
    - `contrast(channels(getComputedStyle(glyph).color), face) >= 3`, where `glyph` is `.kraft-rail-tile-glyph` and `face` is the tile's computed `backgroundColor`.
    - `contrast(face or borderColor, rail) >= 3`. Use the higher of the face and border contrast, so a paper face *or* a dark edge satisfies it.
    - Focus the tile and assert `outlineStyle === 'solid'` and outline-vs-rail ≥ 3.
- [ ] **Step 2: Run it.** Run `npm run test:contrast`. Expected: on the first run any failing tone is listed. Adjust that tone's glyph ink or edge in `src/app-shell.css` until it passes. Expected end state: PASS for both themes and both decoration settings.
- [ ] **Step 3: Stage and ask to commit.** Proposed message: `Check rail tile contrast`.

### Task 6: Docs, changeset, full check

**Files:**
- Modify: `README.md`. Add a `### AppShell and RailTile` section before `### Interactive components and compositions` (line ~297), following the `### Tag` section's style.
  - It shows a usage example with a `<ul>` of tiles, a router `as` example, the board and narrow behaviour, and a props list.
- Modify: `PRODUCT.md`
  - Add `AppShell` and `RailTile` to the component list in "Capabilities and Constraints".
  - Add one sentence each describing the props, modelled on the `CorkBoard` sentences.
- Modify: `DESIGN.md`. Add `### App shell and rail` under `## Components`, covering the material use (cardboard ground, rail strip, paper sheet), the pressed-flat current tile and the narrow board.
- Create: `.changeset/diorama-app-shell.md` with the frontmatter `"@randalvance/kraft-ui": minor`, plus one paragraph in the style of `ruled-paper-fields.md`.

- [ ] **Step 1: Write the docs and changeset** as listed above.
- [ ] **Step 2: Run the full check.** Run `npm run check`. Expected: typecheck, unit, buttons, contrast, stories (both themes), build and build-storybook all succeed.
- [ ] **Step 3: Stage and ask to commit.** Proposed message: `Document AppShell and RailTile`.
