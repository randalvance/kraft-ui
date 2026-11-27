import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import {
  ActionableList, ActionableListItem, Avatar, Badge, Banner, Button, Callout, Card, CardAddTile, CheckboxStatus, Code, CorkBoard, CorkBoardColumn,
  DescriptionList, Drawer, Heading, Icon, Inline, Kbd, Link, PageHeader, Prose, SearchField,
  SegmentedControl, Select, Stack, Stamp, Stat, StatusDot, StatusSticker, Stepper, StickyNote, Surface, Table, Tag, Text,
  TextField, Timeline, Toggle, type StickyNoteTone, type StatusTone, type TableRow,
} from '../../src';
import { PpIcon } from './icons';
import { night, PageTitle, PrimepawShell } from './shell';

const meta = {
  title: 'Primepaw/Work',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

type Flow = { id: string; name: string; when: string; steps: number; runs: StatusTone[]; next?: string; current?: boolean; dimmed?: boolean };
const flowGroups: { id: string; caption: string; flows: Flow[] }[] = [
  { id: 'needs', caption: 'Needs you', flows: [{ id: 'pdf', name: 'Inbox PDF to tickets', when: 'when a file lands in Drive', steps: 1, runs: ['done', 'blocked'], next: 'waits for the next file', current: true }] },
  { id: 'running', caption: 'Running now', flows: [{ id: 'health', name: 'Release health watch', when: 'after each deploy to prod', steps: 1, runs: ['done', 'done', 'working'] }] },
  { id: 'schedule', caption: 'On a schedule', flows: [
    { id: 'changelog', name: 'Nightly changelog', when: 'weekdays at 06:00', steps: 4, runs: ['done'], next: '06:00' },
    { id: 'jira', name: 'Sync Jira boards', when: 'every 15 minutes', steps: 1, runs: ['done', 'done', 'done', 'done', 'idle'] },
    { id: 'deps', name: 'Weekly dependency bump', when: 'Mondays at 09:00', steps: 4, runs: [], next: 'Mon 09:00' },
    { id: 'stale', name: 'Stale PR nudge', when: 'weekdays at 10:00', steps: 1, runs: ['idle'], next: '10:00' },
  ] },
  { id: 'event', caption: 'On an event', flows: [{ id: 'triage', name: 'Triage new issues', when: 'when an issue opens on GitHub', steps: 4, runs: ['done', 'done', 'done'], next: 'waits for the next issue' }] },
  { id: 'paused', caption: 'Paused', flows: [{ id: 'tidy', name: 'Memory tidy-up', when: 'Sundays at 02:00 · paused', steps: 1, runs: [], dimmed: true }] },
];
const runWords: Record<StatusTone, string> = { done: 'done', blocked: 'failed', working: 'running', waiting: 'waiting', idle: 'skipped' };

/**
 * `DioramaWorkflows`: the run timetable. Missing component: `RunSwimlane` (a week of runs on a day grid with a
 * "now" line). Closest: a grouped `Table` with one `StatusDot` per run.
 */
function Workflows() {
  const row = (flow: Flow): TableRow => ({
    id: flow.id, current: flow.current, dimmed: flow.dimmed,
    cells: {
      name: <Stack gap={2}><Text as="span" variant="label">{flow.name}</Text><Inline gap={4} align="center"><Icon name={flow.when.startsWith('when') || flow.when.startsWith('after') ? 'bolt' : 'clock'} size={12} /><Text as="span" variant="hand" tone="muted">{flow.when}</Text></Inline></Stack>,
      steps: <Badge size="sm">{`${flow.steps} step${flow.steps > 1 ? 's' : ''}`}</Badge>,
      runs: <Inline gap={8} align="center"><span className="pp-runs">{flow.runs.map((tone, i) => <StatusDot key={i} tone={tone} label={`Run ${i + 1}, ${runWords[tone]}`} />)}</span>{flow.next && <Text as="span" variant="hand" tone="muted">{flow.next}</Text>}</Inline>,
    },
  });
  return <PrimepawShell current="workflows" sheetHead={<Stack gap={10}>
    <PageTitle title="Workflows" tally="9 workflows · 4 with several steps · 1 running · 1 failed · 1 paused"
      actions={<><SearchField aria-label="Find a workflow" placeholder="Find a workflow…" /><Button variant="blue">New workflow</Button></>} />
    <Inline justify="between" align="center" wrap gap={12}>
      <SegmentedControl label="Show" hideLabel name="flow-filter" variant="chips" defaultValue="all" options={[
        { value: 'all', label: 'All', count: 9 }, { value: 'needs', label: 'Needs you', count: 1 }, { value: 'schedule', label: 'On a schedule', count: 5 },
        { value: 'event', label: 'On an event', count: 3 }, { value: 'paused', label: 'Paused', count: 1 },
      ]} />
      <Inline gap={12}><StatusDot tone="done">done</StatusDot><StatusDot tone="blocked">failed</StatusDot><StatusDot tone="idle">skipped</StatusDot></Inline>
    </Inline>
  </Stack>}>
    <div className="pp-split">
      <Table caption="Workflows and their recent runs" columns={[
        { id: 'name', header: 'Workflow', rowHeader: true }, { id: 'steps', header: 'Steps' }, { id: 'runs', header: 'This week' },
      ]} groups={flowGroups.map(group => ({ id: group.id, caption: group.caption, rows: group.flows.map(row) }))} />
      <Drawer title="Inbox PDF to tickets" actions={<Toggle aria-label="Inbox PDF to tickets on" defaultChecked />}
        description="When a PDF lands in the shared inbox folder, reads it and files a Jira ticket on the Billing migration board with the gist.">
        <Stack gap={16}>
          <Inline gap={8} align="center" wrap><Button variant="blue">Run now</Button><Button>Edit the steps</Button><Text as="span" variant="hand" tone="muted">waits for the next file</Text></Inline>
          <Callout tone="danger" title="Failed" action={<Button size="sm">Run again</Button>}>Jira answered 502 creating ORB-153 · the PDF is still in inbox/</Callout>
          <Inline gap={8} align="end"><Heading as="h3" size="sm">How it runs</Heading><Text as="span" variant="hand" tone="muted">one step: a job</Text></Inline>
          <Stepper steps={[
            { id: 'trigger', label: 'When a file lands in Drive › inbox/', description: <><Code>cloud.file.created</Code> · PDFs only</>, status: 'done' },
            { id: 'read', label: 'Read the PDF and file a ticket', description: 'Issue Creator in Orbit Billing', status: 'blocked' },
          ]} />
          <Inline gap={8} align="end"><Heading as="h3" size="sm">Runs</Heading><Text as="span" variant="hand" tone="muted">4 runs kept</Text></Inline>
          <Timeline items={[
            { id: 'r1', title: 'Failed · Jira answered 502 creating ORB-153', time: 'today 10:10', tone: 'blocked', description: 'on an event · 41 s · inbox/invoice-oct.pdf', current: true },
            { id: 'r2', title: 'Done · ORB-151 created · 1 page', time: 'Thu 30 Oct 16:02', tone: 'done', description: 'on an event · 38 s · inbox/receipt-0431.pdf' },
            { id: 'r3', title: 'Done · ORB-148 created · 3 pages', time: 'Wed 29 Oct 11:40', tone: 'done', description: 'on an event · 52 s · inbox/statement-q3.pdf' },
          ]} />
        </Stack>
      </Drawer>
    </div>
  </PrimepawShell>;
}

type BoardSummary = { name: string; source: 'LOCAL' | 'JIRA' | 'GITHUB'; where: string; counts: [number, number, number]; spaces: { name: string; tone: string }[]; sync: string; syncable: boolean };
const boards: BoardSummary[] = [
  { name: 'Lighthouse Q4', source: 'LOCAL', where: 'local · lives on this machine', counts: [11, 4, 8], spaces: [{ name: 'Lighthouse Web', tone: 'var(--kraft-green)' }], sync: 'local · nothing to sync', syncable: false },
  { name: 'Billing migration', source: 'JIRA', where: 'ORB · jira.example.com', counts: [18, 6, 17], spaces: [{ name: 'Orbit Billing', tone: 'var(--kraft-red)' }, { name: 'Fleet Infra', tone: 'var(--kraft-amber)' }], sync: 'synced 4 min ago', syncable: true },
  { name: 'Platform chores', source: 'GITHUB', where: 'fleet/infra · issues', counts: [7, 2, 3], spaces: [{ name: 'Fleet Infra', tone: 'var(--kraft-amber)' }], sync: 'synced 12 min ago', syncable: true },
  { name: 'Harbor 1.0', source: 'JIRA', where: 'HRB · jira.example.com', counts: [14, 5, 11], spaces: [{ name: 'Harbor Mobile', tone: 'var(--kraft-violet)' }], sync: 'synced 1 h ago · 3 new since', syncable: true },
  { name: 'Docs backlog', source: 'LOCAL', where: 'local · lives on this machine', counts: [5, 1, 1], spaces: [{ name: 'Atlas Docs', tone: 'var(--kraft-blue)' }], sync: 'local · nothing to sync', syncable: false },
];
const sourceTone = { LOCAL: 'neutral', JIRA: 'blue', GITHUB: 'neutral' } as const;

function KanbanList() {
  return <PrimepawShell current="kanban" sheetHead={<PageTitle title="Kanban" tally="6 boards · 2 from Jira · 2 from GitHub · 2 local" actions={<>
    <SearchField aria-label="Find a board or workspace" placeholder="Find a board or workspace" trailing={<Kbd size="sm" keys={['⌘', 'K']} />} />
    <Button leading={<Icon name="sync" />}>Sync all</Button><Button variant="blue" leading={<Icon name="plus" />}>New board</Button>
  </>} />}>
    <div className="pp-grid">
      {boards.map(board => <Card key={board.name}
        header={<Stack gap={2}><Heading as="h2" size="md">{board.name}</Heading><Text as="span" className="pp-mono" tone="muted">{board.where}</Text></Stack>}
        corner={<Stamp size="sm" tone={sourceTone[board.source]}>{board.source}</Stamp>}
        footer={<Inline justify="between" align="center" gap={8} wrap>
          <Text as="span" variant="hand" tone="muted">{board.sync}</Text>
          <Inline gap={6}>{board.syncable && <Button size="sm" leading={<Icon name="sync" />}>Sync</Button>}<Button size="sm">Open board</Button></Inline>
        </Inline>}>
        <Stack gap={10}>
          <Inline gap={6}>
            <Badge>{`To do ${board.counts[0]}`}</Badge><Badge tone="attention">{`Doing ${board.counts[1]}`}</Badge><Badge>{`Done ${board.counts[2]}`}</Badge>
          </Inline>
          <Inline gap={6} wrap>{board.spaces.map(space => <Tag key={space.name} variant="paper" swatch={space.tone}>{space.name}</Tag>)}</Inline>
        </Stack>
      </Card>)}
      <CardAddTile label="Make a new board · local, from Jira or from GitHub issues" />
    </div>
  </PrimepawShell>;
}

type Ticket = { key: string; title: string; agent: string; when: string; tone: StickyNoteTone; selected?: boolean };
const columns: { name: string; tickets: Ticket[] }[] = [
  { name: 'Backlog', tickets: [
    { key: 'ORB-151', title: 'Dunning emails: retry schedule config', agent: 'Triage', when: '2 d ago', tone: 'ochre' },
    { key: 'ORB-149', title: 'Export ledger as CSV', agent: 'Implementer', when: '2 d ago', tone: 'sage' },
    { key: 'ORB-147', title: 'Rate-limit the invoice PDF endpoint', agent: 'Infra Planner', when: '3 d ago', tone: 'blue' },
  ] },
  { name: 'To do', tickets: [
    { key: 'ORB-146', title: 'Tax rounding differs from Jira totals', agent: 'Implementer', when: 'yesterday', tone: 'ochre' },
    { key: 'ORB-145', title: 'Migrate coupons table', agent: 'Implementer', when: 'yesterday', tone: 'ochre' },
    { key: 'ORB-144', title: 'Nightly reconciliation job', agent: 'Infra Planner', when: '3 d ago', tone: 'ochre' },
  ] },
  { name: 'Doing', tickets: [
    { key: 'ORB-142', title: 'Invoice PDF renders wrong currency symbol', agent: 'Implementer', when: '2 h ago', tone: 'attention', selected: true },
    { key: 'ORB-140', title: 'Webhook signature v2', agent: 'Implementer', when: '5 h ago', tone: 'ochre' },
    { key: 'ORB-138', title: 'Proration on plan downgrade', agent: 'Reviewer', when: 'yesterday', tone: 'sage' },
  ] },
  { name: 'Review', tickets: [
    { key: 'ORB-137', title: 'Ledger double-entry audit', agent: 'Reviewer', when: 'today', tone: 'ochre' },
  ] },
];

/** Missing component: `TicketNote` (key, title, agent, age on a sticky note). Closest: a selectable StickyNote. */
function TicketNote({ ticket }: { ticket: Ticket }) {
  return <StickyNote as="button" tone={ticket.tone} tilt={0} selected={ticket.selected}
    header={<Inline gap={6} align="center"><StatusDot tone="blocked" size={8} label="Orbit Billing" /><Text as="span" className="pp-mono">{ticket.key}</Text></Inline>}
    footer={<Inline justify="between" align="center" gap={6}><Inline gap={4} align="center"><Avatar size={20} glyph={<Icon name="agent" />} decorative /><Text as="span" variant="label-sm">{ticket.agent}</Text></Inline><Text as="span" variant="hand" tone="muted">{ticket.when}</Text></Inline>}>
    <Text variant="hand" size="md">{ticket.title}</Text>
  </StickyNote>;
}

function KanbanBoard() {
  return <PrimepawShell current="kanban" sheetHead={<PageHeader title="Billing migration"
    back={<Link href="#kanban" underline="hover">‹ Kanban</Link>}
    leading={<Stamp size="sm" tone="blue" signature="ORB">Jira</Stamp>}
    status={<Inline gap={8} align="center"><Text as="span" role="status" variant="hand" tone="muted">14 cards · synced 4 min ago</Text>
      <Tag variant="paper" swatch="var(--kraft-red)">Orbit Billing</Tag><Tag variant="paper" swatch="var(--kraft-amber)">Fleet Infra</Tag></Inline>}
    actions={<>
      <Button size="sm" leading={<Icon name="kanban" />} aria-pressed>Columns</Button>
      <Button size="sm" leading={<Icon name="share" />}>Dependencies</Button>
      <Button size="sm">Group by epic</Button>
      <Button leading={<Icon name="sync" />}>Sync with Jira</Button>
      <Button variant="blue" leading={<Icon name="plus" />}>New card</Button>
    </>} />}>
    <div className="pp-split" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 420px)' }}>
      <CorkBoard layout="columns" height={720} scrollLabel="Billing migration columns">
        {columns.map(column => <CorkBoardColumn key={column.name} headingLevel={2} name={column.name} count={column.tickets.length} countLabel={`${column.tickets.length} cards`}>
          {column.tickets.map(ticket => <TicketNote key={ticket.key} ticket={ticket} />)}
        </CorkBoardColumn>)}
      </CorkBoard>
      <Drawer title="Invoice PDF renders wrong currency symbol" eyebrow={<Inline gap={6}><Tag variant="kraft">ORB-142</Tag><Stamp size="sm" tone="blue">Jira</Stamp></Inline>}
        actions={<Link href="#jira">open in Jira ↗</Link>} onClose={() => {}} closeLabel="Close card">
        <Stack gap={16}>
          <SegmentedControl label="Column" name="column" defaultValue="doing" options={[
            { value: 'backlog', label: 'Backlog' }, { value: 'todo', label: 'To do' }, { value: 'doing', label: 'Doing' }, { value: 'review', label: 'Review' }, { value: 'done', label: 'Done' },
          ]} />
          <DescriptionList columns={2} items={[
            { id: 'ws', label: 'Workspace', value: <Tag variant="paper" swatch="var(--kraft-red)">Orbit Billing</Tag> },
            { id: 'agent', label: 'Agent', value: <Inline gap={6} align="center"><Avatar size={24} glyph={<Icon name="agent" />} decorative />Implementer</Inline>, action: <Button size="sm">change</Button> },
            { id: 'epic', label: 'Epic', value: <Inline gap={6} align="center"><Tag variant="kraft">ORB-120</Tag>Invoice PDF overhaul</Inline> },
            { id: 'created', label: 'Created', value: '12 Oct · by Mara' },
            { id: 'updated', label: 'Updated', value: '2 h ago · by Implementer' },
          ]} />
          <Heading as="h3" size="md">Links</Heading>
          <ActionableList aria-label="Linked tickets" density="compact">
            {[['parent', 'ORB-120', 'Invoice PDF overhaul', 'Epic'], ['relates to', 'ORB-146', 'Tax rounding differs from Jira totals', 'To do'],
              ['blocks', 'ORB-137', 'Ledger double-entry audit', 'Review'], ['blocks', 'ORB-147', 'Rate-limit the invoice PDF endpoint', 'Backlog']]
              .map(([rel, key, title, column]) => <ActionableListItem key={key} href={`#${key}`} truncateLabel label={title}
                leading={<Tag variant="kraft">{key}</Tag>} description={<Text as="span" variant="hand" tone="muted">{rel}</Text>}
                trailing={<Text as="span" variant="label-sm" tone="muted">{column}</Text>} />)}
          </ActionableList>
          <Heading as="h3" size="md">Description</Heading>
          <Prose><p>Invoices for customers billed in EUR render the € as a box in the PDF. The PDF service uses the Lato subset without the currency glyphs.</p><p>Expected: € and £ render. Actual: ☐.</p></Prose>
        </Stack>
      </Drawer>
    </div>
  </PrimepawShell>;
}

type Stage = { id: string; label: string; icon: ReactNode; on: boolean };
const stages = (on: boolean[]): Stage[] => [
  { id: 'plan', label: 'Planning', icon: <Icon name="file" /> }, { id: 'review', label: 'Plan review', icon: <Icon name="eye" /> },
  { id: 'impl', label: 'Implementation', icon: <Icon name="code" /> }, { id: 'test', label: 'Testing', icon: <PpIcon name="activity" /> },
  { id: 'cr', label: 'Code review', icon: <Icon name="search" /> }, { id: 'merge', label: 'Merge', icon: <Icon name="branch" /> },
].map((stage, i) => ({ ...stage, on: on[i] }));

/**
 * One factory: name, state, the numbers, and its stage chain. Missing component: `StagePipeline` (a horizontal chain
 * of stage chips where skipped stages show as dashed icons). Closest: a row of Tags joined by arrows.
 */
function FactoryCard({ name, link, state, tone, on, numbers, chain, highlight }: { name: string; link: string; state: string; tone: StatusTone; on: boolean; numbers: [string, string][]; chain: Stage[]; highlight?: boolean }) {
  return <Card off={!on} tone={highlight ? 'ochre' : undefined}
    header={<Stack gap={2}><Heading as="h2" size="title-sm">{name}</Heading><Link href={`#${link}`}>{link} →</Link></Stack>}
    corner={<Inline gap={8} align="center"><StatusSticker tone={tone} indicator="dot" variant={on ? 'solid' : 'ghost'}>{state}</StatusSticker><Toggle aria-label={`${name} on`} defaultChecked={on} /></Inline>}>
    <Stack gap={14}>
      <Inline gap={24} wrap>{numbers.map(([value, label]) => <Stat key={label} value={value} label={label} size="sm" tone={label === 'waiting on you' && value !== '0' ? 'attention' : 'neutral'} />)}</Inline>
      <Inline gap={4} align="center" wrap>{chain.map((stage, i) => <Inline key={stage.id} gap={4} align="center">
        {i > 0 && <Text as="span" tone="muted" aria-hidden="true">→</Text>}
        {stage.on ? <Tag variant="paper" leading={stage.icon}>{stage.label}</Tag> : <Tag variant="paper" leading={stage.icon} style={{ opacity: 0.5, borderStyle: 'dashed' }}>{`${stage.label} (skipped)`}</Tag>}
      </Inline>)}</Inline>
    </Stack>
  </Card>;
}

function Factory() {
  return <PrimepawShell current="factory" sheetHead={<PageTitle title="Factory" tally="3 factories · 1 running · 1 idle · 1 off" actions={<><Button variant="blue">New factory</Button><Button>Factory settings</Button></>} />}>
    <Stack gap={24}>
      <Banner control={<Toggle aria-label="Pause all factories" />} title="Pause all factories">Flip it and nothing new starts: the 2 tasks in flight finish their step, then wait.</Banner>
      <div className="pp-grid-wide pp-compact-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))' }}>
        <FactoryCard name="PrimePaw" link="primepaw issues" state="Running" tone="working" on highlight numbers={[['2', 'in flight'], ['1', 'waiting on you'], ['0', 'Blocked'], ['1', 'to plan'], ['4', 'queued']]} chain={stages([true, true, true, true, true, true])} />
        <FactoryCard name="Cerebro" link="cerebro issues" state="Idle" tone="idle" on numbers={[['0', 'in flight'], ['0', 'waiting on you'], ['0', 'Blocked'], ['0', 'to plan'], ['0', 'queued']]} chain={stages([true, false, true, true, false, true])} />
        <FactoryCard name="Docs" link="docs issues" state="Off" tone="idle" on={false} numbers={[['0', 'in flight'], ['0', 'waiting on you'], ['0', 'Blocked'], ['0', 'to plan'], ['3', 'queued']]} chain={stages([true, false, true, false, false, true])} />
      </div>
    </Stack>
  </PrimepawShell>;
}

type SetupStep = { id: string; title: string; text: string; done?: boolean; note?: string; body?: ReactNode };

/**
 * First run: the six-step setup checklist. Missing component: `ChecklistStep` (a big checkbox, a title and note,
 * an open body for the current step). Closest: CheckboxStatus beside a heading, with the body in a FormSection.
 */
function Setup() {
  const steps: SetupStep[] = [
    { id: 'restore', title: 'Restore a backup', text: 'Bring back your agents, workspaces and settings from another Mac.', note: 'skipped' },
    { id: 'meet', title: 'Meet your Main Agent', text: 'Name it, give it a face, and pick its model. It is who you talk to.', body: <Stack gap={16}>
      <TextField aria-label="Name" variant="underline" size="title" defaultValue="Jarvis" />
      <Toggle defaultChecked description="Claude Sonnet 5.5 on Anthropic">Global default</Toggle>
      <Inline gap={12}>
        <Select label="Provider" disabled defaultValue="anthropic" options={[{ value: 'anthropic', label: 'Anthropic' }]} />
        <Select label="Model" disabled defaultValue="sonnet" options={[{ value: 'sonnet', label: 'Claude Sonnet 5.5' }]} />
      </Inline>
      <Text variant="lead">Your main agent starts work for you and never edits code itself.</Text>
      <Inline gap={12} align="center"><Button variant="blue">Create</Button><Text as="span" variant="hand" tone="muted">All of this can change later in Settings.</Text></Inline>
    </Stack> },
    { id: 'github', title: 'Sign in to GitHub', text: 'So sessions can push branches and open pull requests.' },
    { id: 'notes', title: 'Bring your notes', text: 'Your notes, as Markdown in a git repo.' },
    { id: 'ona', title: 'Sign in to Ona', text: 'Run sessions in the cloud when your Mac is asleep.' },
    { id: 'mcps', title: 'Set up MCPs', text: 'Connect the tools your agents use: GitHub, Jira, Slack.' },
  ];
  return <PrimepawShell current="home" sheetHead={<PageTitle title="Setting up Primepaw" tally="0 of 6 done"
    actions={<><Text as="span" variant="hand" tone="muted">needs a main agent</Text><Button size="sm" disabled>Open Primepaw</Button></>} />}>
    <Stack gap={0} className="pp-setup">
      <Text variant="lead">Six things, one at a time. Only the main agent has to be done before you start; the rest can wait, and all of it is in Settings later.</Text>
      {steps.map(step => <section key={step.id} className="pp-setup-step" aria-labelledby={`step-${step.id}`}>
        <CheckboxStatus label={`${step.title}, ${step.done ? 'done' : 'not done'}`} checked={step.done} />
        <Stack gap={2}>
          <Heading as="h2" size="sm" id={`step-${step.id}`}>{step.title}</Heading>
          <Text variant="label-sm" tone="muted">{step.text}</Text>
        </Stack>
        {step.note ? <Text as="span" variant="hand" tone="muted">{step.note}</Text> : <span />}
        {step.body && <div className="pp-setup-step-body"><Surface padding={24}>{step.body}</Surface></div>}
      </section>)}
    </Stack>
  </PrimepawShell>;
}

export const WorkflowsPage: Story = { name: 'Workflows', render: () => <Workflows /> };
export const WorkflowsPageNight: Story = { name: 'Workflows (night)', render: () => <Workflows />, ...night };
export const Kanban: Story = { name: 'Kanban boards', render: () => <KanbanList /> };
export const KanbanNight: Story = { name: 'Kanban boards (night)', render: () => <KanbanList />, ...night };
export const Board: Story = { name: 'Kanban, one board', render: () => <KanbanBoard /> };
export const BoardNight: Story = { name: 'Kanban, one board (night)', render: () => <KanbanBoard />, ...night };
export const Factories: Story = { name: 'Factory', render: () => <Factory /> };
export const FactoriesNight: Story = { name: 'Factory (night)', render: () => <Factory />, ...night };
export const FirstRun: Story = { name: 'Setup checklist', render: () => <Setup /> };
export const FirstRunNight: Story = { name: 'Setup checklist (night)', render: () => <Setup />, ...night };
