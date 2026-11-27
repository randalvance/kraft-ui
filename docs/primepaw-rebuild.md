# Primepaw rebuilt with Kraft UI

This is a rebuild of the Primepaw paper-diorama prototype (`randalvance/claude-design`, `mockups/primepaw/*.dc.html`) using only Kraft UI components. It records which components stand in for each part of the prototype, and which components Kraft UI should add.

The prototype was asked for at `mockups/prototype/primepaw`. That path does not exist: the boards are in `mockups/primepaw/`.

## Where it lives

| File | What |
| --- | --- |
| `stories/primepaw/shell.tsx` | `PrimepawShell` (`AppShell` + `RailTile` rail), plus the stand-ins built here for missing components: `Composer`, `PermissionSlip`, `UserNote`, `AgentLine`, `JarvisDock` and `PageTitle`. |
| `stories/primepaw/boards.tsx` | The two cardboard boards: `SessionsBoard` (sessions grouped by workspace) and `ThreadsBoard` (Jarvis, factories and threads). |
| `stories/primepaw/icons.tsx` | `PpIcon`, made with `createIcon`, for the glyphs the `Icon` set does not have yet. |
| `stories/primepaw/primepaw.css` | Layout glue only: grids, the thread column and the full-bleed frame. It sets no colours or materials of its own and uses only `--kraft-*` tokens. |
| `stories/primepaw/*.stories.tsx` | 24 screens in Storybook under **Primepaw/**, most of them with a `(night)` story as well. |

Run `npm run storybook` and open **Primepaw**.

### Screens rebuilt

| Storybook | Prototype board |
| --- | --- |
| Sessions › New session | `Diorama` |
| Sessions › Session with artifacts and side chat | `DioramaSession` |
| Sessions › Waiting on a permission slip | `DioramaApproval` |
| Sessions › Question sheet | `DioramaQuestion` |
| Home and Action Center › Home thread with Jarvis | `DioramaHome` / `DioramaHomeSession` |
| Home and Action Center › Meet your main agent | `DioramaHomeMeet` |
| Home and Action Center › Action Center (+ empty) | `DioramaActionCenter`, `DioramaActionCenterEmpty` |
| Settings › Agents, Agent edit page | `DioramaAgents`, `DioramaAgent` |
| Settings › Skills | `DioramaSkills` |
| Settings › MCP servers | `DioramaMCPs` |
| Settings › Memory | `DioramaMemory` |
| Settings › Workspaces | `DioramaWorkspaces` |
| Knowledge and boards › Knowledge base | `DioramaKnowledge` |
| Knowledge and boards › Artifacts | `DioramaArtifacts` |
| Knowledge and boards › Idea board | `DioramaIdeas` |
| Knowledge and boards › Tasks | `DioramaTasks` |
| Work › Workflows | `DioramaWorkflows` |
| Work › Kanban boards, Kanban one board | `DioramaKanban`, `DioramaBoard` |
| Work › Factory | `DioramaFactory` |
| Work › Setup checklist | `DioramaSetup` |

The Action Center empty state has no night story. Every other screen has both a paper and a night story.

I checked every Primepaw story with axe-core in both themes at 1440×900, and none had a violation. I could not run the repository's own `npm run test:stories` here, because its pinned Playwright browser is not installed in this environment.

### Not rebuilt as separate stories

These are mostly states of the screens above, or illustration and animation work that a component library does not cover:

- **States of screens above:** HomeAsk/Empty/Waiting/Yolo/MeetCreated, ActionCenter Answering/Busy/Many/Report/Unblock, FactoryBlocked/Empty/Paused, WorkflowsEmpty/Steps, SetupRestored, WorkspacesNew/Cloning/Local, KnowledgeAI/Focus/Read/Setup/Source.
- **New layouts that need missing components first:** FactoryFloor/Kanban/Overview/Page/Settings (the animated floor), KnowledgeGraph (force graph), WorkflowEdit/New/Run (flow canvas), Workspace and Skill edit pages (these follow the Agent edit page pattern), Compact, SessionTop.
- **Character and motion boards:** Jarvis, Pets, Loading.

## Prototype → Kraft UI mapping

| Prototype piece | Kraft UI used | Fit |
| --- | --- | --- |
| Icon rail, rail badges, night/settings at the foot | `AppShell` `rail`/`railFooter`, `RailTile` (`tone`, `count`, `current`) | Exact |
| Cardboard sessions board, chat sheet | `AppShell` `board`, `sheetHead`, sheet body | Exact |
| Workspace header strips with a count | `CollapsibleGroup` (`tone`, `count`) | Exact |
| Session strips, nested sessions, working pinwheel | `TreeView` (`branchStyle="board"`) + `Pinwheel`, `StatusDot` | Good |
| Search with ⌘K | `SearchField` `trailing={<Kbd keys=…/>}` | Exact |
| Workspace filter, Active filter | `Select variant="compact"`, `Button aria-pressed` | Good |
| Thread cards and factory cards on Home | `Card as="a"`, `StatusSticker`, `Badge size="count"` | Good |
| Capsule (agent turn plate) | `CollapsibleGroup` + `Timeline` | Approximate; see `Capsule` below |
| User message slip | `Surface material="kraft"` | Approximate; see `ChatMessage` below |
| Composer | `Mat` + `Textarea variant="ruled"` + `Tag` + `Gauge` + `Stamp as="button"` + `IconButton` | Approximate; see `Composer` below |
| Permission slip | `Mat tone="amber"` + `Tape` + `CodeBlock` + `Tag` + `Button`s | Approximate; see `PermissionSlip` below |
| Question sheet | `Dialog` + `Tabs` + `RadioGroup columns={3}` | Approximate; see `QuestionSheet` below |
| Artifact chips in the thread | `Card as="button"` | Good |
| Artifacts clipboard, side chat | `Drawer` + `Tabs` / `Textarea` | Approximate; see `Clipboard`, `SideChat` below |
| Session toolbar (tasks, terminal, PRs…) | `Toolbar` / `ToolbarGroup` + `IconButton variant="bare"` | Good, but no per-icon count badges are shown |
| Page titles with a handwritten tally | `Heading size="title"` + `Text variant="hand"` (`PageTitle`) | Good |
| Agent / workspace / skill / board cards | `Card` (`media`, `header`, `corner`, `footer`, `tone`, `off`), `CardAddTile` | Exact |
| Agent edit page | `PageHeader`, `FormSection`, `Textarea`, `RadioGroup variant="flat"`, `Toggle labelSide="start"`, `CheckboxGroup` | Exact |
| BUILT-IN / PLUGIN / STDIO / JIRA labels | `Stamp size="sm"` | Good |
| Filter chips ("Show: All · On · Off…") | `ToggleChips` / `SegmentedControl variant="chips"` with `count` | Exact |
| CONNECTED / RUNNING / NEEDS SIGN-IN | `StatusSticker` | Exact |
| MCP detail panel | `Drawer` + `DescriptionList` + `ActionableList` | Good |
| Memory facts, budget ruler | `ActionableList` (`actions`), `Meter` with segments (`solid`/`hatched`/`free`), `Stat` | Exact |
| Memory level tabs | `Tabs` with `description`, `trailing` | Exact |
| KB file tree, tags, note editor | `TreeView`, `Tag`, `TagInput`, `DescriptionList layout="inline"`, `Prose`, `CodeBlock`, `SegmentedControl` | Good, but there is no git mark (see below) |
| Artifacts cork board | `CorkBoard layout="grid"` + `CorkBoardItem pin` + `Card media` | Exact |
| Idea board | `CorkBoard layout="free"` + `StickyNote` + `Checkbox variant="pen" strikeWhenChecked` | Good, but there are no strings between notes |
| Kanban columns | `CorkBoard layout="columns"` + `CorkBoardColumn` + `StickyNote as="button"` | Good |
| Factory slots, counts | `SlotMeter`, `Stat` | Exact |
| Pause-all strip | `Banner` | Exact |
| Workflow run history, steps | `Timeline`, `Stepper`, `Callout tone="danger"` | Exact |
| Workflow timetable | `Table` with `groups` + `StatusDot` per run | Approximate; see `RunSwimlane` below |
| Setup checklist | `CheckboxStatus` + `Heading` + `Surface` | Approximate; see `ChecklistStep` below |
| Portrait picker | `AvatarPicker` | Exact |
| Agent portraits (illustrated stickers) | `Avatar glyph` | Placeholder until the pet art is an asset |

## Recommended new components

These are listed from most to least needed. Each says what the prototype does, what stands in for it now, and a suggested API.

### 1. `Composer` (with `ModelChip` and `YoloStamp`)

Used on every session and on Home. It is a red-matted card with a ruled field, a row of chips (model with effort bars, context gauge, YOLO stamp, workspace, branch), key hints, a mic disc that latches red while recording with a sound trace, and a send disc.

- **Stand-in now:** `Composer` in `shell.tsx`, built from `Mat tone="kraft"`, `Textarea`, `Tag`, `Gauge`, `Stamp` and `IconButton`.
- **Gaps:**
  - `Mat` has no red tone.
  - There is no model chip with effort bars.
  - There is no recording state.
  - The ruled placeholder isn't handwritten.
- **API:** `<Composer value onValueChange onSubmit placeholder settings={ReactNode} recording onRecordingChange submitLabel />`, plus `<ModelChip model effort={0..4} />` and `<YoloStamp pressed onPressedChange />`.
- **Also:** add `tone="red"` to `Mat`.

### 2. `PermissionSlip`

This is the approval card: "May I run this?", the tool, the command, the consequence, effect tags, then Allow once / Allow for this session / Deny and a handwritten footnote. It appears in sessions and in the Action Center.

- **Stand-in now:** `PermissionSlip` in `shell.tsx`.
- **API:** `<PermissionSlip question tool command effects={string[]} onAllowOnce onAllowSession onDeny footnote />`.

### 3. `QuestionSheet`

An agent's questions, one tab per question. Each option is a large card with a note under it, at most one carries a "Recommended" ribbon, and a "Question 1 of 3" pager sits beside Next and Submit.

- **Stand-in now:** `Dialog` + `Tabs` + `RadioGroup`, with "Recommended" put into the option label.
- **API:** `<QuestionSheet asker questions={[{ id, title, context, options: [{ value, label, description, recommended }] }]} onSubmit />`.
- **Smaller addition:** a `recommended` ribbon on `RadioOption` alone would close most of the gap.

### 4. `Capsule`

One agent turn folded into a plate: the elapsed-time disc, Done/Working, call counts, model dots and an expand caret.

- **Stand-in now:** `CollapsibleGroup` + `Timeline`.
- **API:** `<Capsule status time calls={{ llm, tools }} models={Tone[]}>{details}</Capsule>`.

### 5. `ChatMessage`

The person's kraft slip on the right and the agent's serif reply with its sticker. There is also an italic variant for the agent's margin voice.

- **Stand-in now:** `UserNote` and `AgentLine` in `shell.tsx`.
- **API:** `<ChatMessage from="user" | "agent" avatar voice="plain" | "margin">`.

### 6. `SessionCard` and `FinishReport`

Both are cards that Jarvis leaves on Home:

- **`SessionCard`:** a workspace-tinted strip with branch and model, then title, summary, status and Open.
- **`FinishReport`:** a green-matted DONE line with the PR tag, check count and Open PR. The full report in the inbox has a retro section.

- **Stand-in now:** a toned `Card`, and a `Mat tone="sage"` with `Stamp`.

### 7. `Clipboard` and `SideChat`

These are the two side panes of an open session:

- **`Clipboard`:** the artifacts sidebar, with a hanger clip, artifact tabs, versions (`v2 of 2 ‹ ›`) and Pinned, plus Copy / Download / Ask on the side.
- **`SideChat`:** a legal-pad chat that stays out of the session, with "Put in chat".

- **Stand-in now:** two `Drawer`s.
- **Also needed:** a version pager that works inside a header slot. `Pager` is close, but it is a navigation landmark.

### 8. `RunSwimlane`

The workflow timetable: days across the top, a red "now" line, one dot per run, a dashed tail for "waits for the next file", and the next run time at the end of each row.

- **Stand-in now:** a grouped `Table` with `StatusDot`s.
- **API:** `<RunSwimlane days rows={[{ id, label, runs: [{ at, tone }], next }]} now />`.
- **Alternative:** extend `Timeline orientation="horizontal"` to take several rows.

### 9. `StagePipeline`

The factory's horizontal chain of stage chips (Planning → Plan review → … → Merge). Skipped stages show as dashed icon-only chips.

- **Stand-in now:** `Tag`s joined by arrows, with "(skipped)" written out.
- **Smaller addition:** a horizontal `chips` variant of `Stepper` would cover it.

### 10. `ChecklistStep` / `SetupChecklist`

First-run steps: a large checkbox, a title and note, "skipped" by hand, and the current step's body opened under it.

- **Stand-in now:** `CheckboxStatus` + `Heading` + `Surface`.

### 11. `CompanionDock` (the Jarvis plinth)

The main agent parked in the corner of every page, with pet switchers, mood sprites and a speech bubble ("Got them!", "Fetching your workspaces…"). It also drives the shared loading state.

- **Stand-in now:** `JarvisDock`, a kraft `Surface` with prev/next buttons. It has no sprite and no bubble.
- **Recommendation:** add a `SpeechBubble` (paper, tail) as a library primitive. Keep the sprites as app assets.

### 12. Cork board connectors

The Idea board ties a note to its child with a string. Tasks draw dependency strings between squares and highlight them on click.

- **Stand-in now:** none, because `CorkBoard` has no connectors.
- **API:** `<CorkBoard connections={[{ from, to, tone }]} />`, drawn between `CorkBoardItem`s by id.

### 13. `TaskSquare` (nested task groups)

A task tree drawn as squares, where a parent's square holds its children's. It has a done/total tally, a "waits 1/2" dependency chip, and fold/unfold.

- **Stand-in now:** nested `Surface`s of `StickyNote`s.

### 14. `TicketNote`

The Kanban card: workspace dot, ticket key, handwritten title, agent sticker and age.

- **Stand-in now:** `StickyNote as="button"` with header/footer. This is close enough that the better fix may be a documented recipe rather than a new component.

### 15. Smaller pieces

- **`GitMark`:** M / A / ? / • marks for file trees. Stand-in now: `Badge`.
- **Workspace swatch:** the small coloured square used next to workspace names everywhere. `Tag swatch` exists, but a bare `Swatch` mark is needed in lists, cards and legends. Stand-in now: an inline `span`.
- **`MarginSection`:** the pinned handwritten section title with a count, used in the KB note margin and the Memory sections. Stand-in now: `Pin` + `Heading size="title-sm"` + `Badge`.
- **`ForceGraph`:** the KB graph view. This is out of scope for the library; wrap a charting library inside a Kraft `Surface`.
- **Flow canvas:** for WorkflowEdit/New/Run (step cards on a canvas with decision branches). It needs its own design pass.

## Library issues found while rebuilding

1. **`Card as="a"` cannot take `media`.** `LinkCardProps` keeps the native anchor `media` attribute (a string), so TypeScript rejects a `ReactNode` `media` slot. The likely fix is to omit `media` from the native anchor props in `card.tsx` (`Omit<ComponentPropsWithoutRef<'a'>, 'dangerouslySetInnerHTML' | 'media'>`). The Agents grid works around it by putting the link in the heading.
2. **`Mat` has no red tone.** The prototype's composer frame is red (`--kraft-mat-red` already exists as a token).
3. **`Card` has a 10rem minimum height** (`--kraft-card-min-height`). Cards on a board or in a compact list need `--kraft-card-min-height: 0`. A `size="compact"` prop would be clearer.
4. **`Icon` set gaps.** These are covered here with `createIcon` in `stories/primepaw/icons.tsx`, and should move into the shipped set:
   - `bulb` (Idea board), `clipboard` (Artifacts), `board` (Tasks), `moon` (night mode)
   - `chevron-right`, `sparkle`, `filter`, `graph`, `expand`, `sliders`, `activity`, `ban`, `question`
   - an editor glyph such as `vscode`
5. **`RadioGroup` option trailing content is squeezed.** A `Stamp` in `trailing` with `columns={3}` renders one letter per line. Option cards need either a corner slot or a `recommended` flag (see `QuestionSheet`).
6. **Heading levels inside slots.** `StickyNote` headers and `CorkBoardColumn` default to `h3`. Pages without an `h2` fail axe `heading-order`, so callers have to remember `headingLevel={2}` or `as="h2"`. Document this on both components.
