import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionableList, ActionableListItem, Badge, Button, Card, Checkbox, CodeBlock, CorkBoard, CorkBoardItem, DescriptionList,
  Heading, Icon, IconButton, Inline, Kbd, Pin, Prose, SearchField, SegmentedControl, Select, Stack, StatusSticker,
  StickyNote, Surface, Tag, TagInput, Text, Toolbar, ToolbarGroup, TreeView, type StickyNoteTone, type TreeNode,
} from '../../src';
import { PpIcon } from './icons';
import { night, PageTitle, PrimepawShell } from './shell';

const meta = {
  title: 'Primepaw/Knowledge and boards',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const file = (id: string, label: string, mark?: string): TreeNode => ({
  id, label, leading: <Icon name="file" />,
  // Missing: a git-status mark for file trees (M, A, ?). Closest: a small Badge.
  trailing: mark ? <Badge tone="attention" size="sm">{mark}</Badge> : undefined,
});
const folder = (id: string, label: string, children: TreeNode[], changed?: boolean): TreeNode => ({
  id, label, leading: <Icon name="folder" />, children,
  trailing: changed ? <Badge tone="attention" size="sm">•</Badge> : undefined,
});
const kbTree: TreeNode[] = [
  folder('architecture', 'architecture', [file('sandbox', 'agent-sandbox.md'), file('levels', 'memory-levels.md'), file('lifecycle', 'session-lifecycle.md')]),
  folder('decisions', 'decisions', [file('adr12', 'adr-012-sticky-sessions.md'), file('adr13', 'adr-013-sqlite-per-workspace.md')]),
  folder('guides', 'guides', [file('g1', 'writing-a-skill.md')]),
  folder('meetings', 'meetings', [file('m1', '2026-11-20.md', 'M')], true),
  folder('runbooks', 'runbooks', [
    folder('billing', 'billing', [file('deploy', 'deploy-orbit-billing.md', 'M')], true),
    folder('fleet', 'fleet', [file('rotate', 'rotate-keys.md')]),
    file('oncall', 'on-call-handbook.md'), file('stuck', 'recover-stuck-job.md'),
  ], true),
  file('reading', 'reading-list.md'), file('start', 'start-here.md'),
];

function KnowledgeBoard() {
  return <Stack gap={12}>
    <SearchField aria-label="Search notes" placeholder="Search notes…" icon={<PpIcon name="filter" />} />
    <Inline justify="between" align="center">
      <Text variant="label-sm">TEAM-KB</Text>
      <Inline gap={2}>
        <IconButton size="sm" variant="bare" aria-label="New note"><Icon name="new-file" /></IconButton>
        <IconButton size="sm" variant="bare" aria-label="New folder"><Icon name="new-folder" /></IconButton>
      </Inline>
    </Inline>
    <TreeView aria-label="Notes" density="compact" branchStyle="plain" selectionMode="single" defaultSelectedId="deploy"
      defaultExpandedIds={['architecture', 'decisions', 'runbooks', 'billing']} items={kbTree} />
    <Inline gap={8} align="end"><Heading as="h2" size="title-sm">Tags</Heading><Text as="span" variant="label-sm" tone="muted">16 in use</Text></Inline>
    <Inline gap={6} wrap>
      {['agents 3', 'on-call 3', 'orbit-billing 2', 'security 2', 'deploy 1', 'fleet-infra 1', 'index 1'].map(tag =>
        <Tag key={tag} as="button" variant="paper">{`# ${tag}`}</Tag>)}
    </Inline>
    <Text variant="hand" tone="muted">Plain Markdown in git. Agents search it with search_kb.</Text>
  </Stack>;
}

/** A side-margin section of the note page: handwritten title, a count, then rows. Missing: `MarginSection`. */
function Margin({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return <Stack gap={6}>
    <Inline gap={8} align="center"><Pin tone="red" /><Heading as="h3" size="title-sm">{title}</Heading><Badge size="count">{count}</Badge></Inline>
    {children}
  </Stack>;
}

function Knowledge() {
  const toolbar = <Toolbar label="Note tools">
    <ToolbarGroup label="Repository">
      <Button size="sm" leading={<Icon name="sync" />}>Sync <Badge tone="danger" size="count">2</Badge></Button>
      <IconButton size="sm" aria-label="View options"><PpIcon name="sliders" /></IconButton>
    </ToolbarGroup>
    <ToolbarGroup label="Views">
      <Button size="sm" leading={<Icon name="file" />} aria-pressed>Note</Button>
      <Button size="sm" leading={<PpIcon name="graph" />}>Graph</Button>
      <Button size="sm" leading={<PpIcon name="sparkle" />}>Ask AI</Button>
      <IconButton size="sm" aria-label="Focus mode"><PpIcon name="expand" /></IconButton>
    </ToolbarGroup>
    <ToolbarGroup label="Create" align="end">
      <Button size="sm" variant="blue" leading={<Icon name="plus" />}>New note</Button>
    </ToolbarGroup>
  </Toolbar>;
  return <PrimepawShell current="knowledge" board={<KnowledgeBoard />} boardLabel="Notes" sheetHead={toolbar} sheetLabel="Deploy Orbit Billing">
    <div className="pp-split" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(240px, 300px)' }}>
      <Stack gap={16} style={{ maxInlineSize: 720 }}>
        <Heading as="h1" size="lg">Deploy Orbit Billing</Heading>
        <Inline justify="between" align="center" gap={12} wrap>
          <Text variant="label-sm" tone="muted">runbooks/billing/deploy-orbit-billing.md · edited 3 min ago · <Text as="span" variant="label-sm" tone="danger">changed, not committed yet</Text></Text>
          <SegmentedControl label="Mode" hideLabel name="mode" defaultValue="edit" options={[{ value: 'edit', label: 'Edit' }, { value: 'read', label: 'Read' }, { value: 'source', label: 'Source' }]} />
        </Inline>
        <DescriptionList layout="inline" items={[
          { id: 'type', label: 'Type', value: <Select label="Type" hideLabel variant="compact" defaultValue="runbook" options={[{ value: 'runbook', label: 'runbook' }, { value: 'decision', label: 'decision' }, { value: 'guide', label: 'guide' }]} /> },
          { id: 'desc', label: 'Description', value: 'Ship Orbit Billing to production without dropping a checkout.' },
          { id: 'tags', label: 'Tags', value: <TagInput aria-label="Tags" variant="paper" defaultValue={['deploy', 'orbit-billing', 'on-call']} placeholder="+ add a tag" /> },
        ]} />
        {/* Missing component: `BlockEditor` (drag handles, nesting, [[links]]). Closest: Prose around rendered Markdown. */}
        <Prose>
          <h2>Before you start</h2>
          <p>Deploys go out from the <code>release</code> branch. Check that <a href="#sticky">Sticky sessions on the load balancer</a> is on, so shoppers keep their carts while nodes drain.</p>
          <ul>
            <li>Green build on <code>release</code><ul><li>Unit and contract tests</li><li>Migration dry run on staging</li></ul></li>
            <li>Nobody else is deploying: check #deploys</li>
            <li>On-call knows the window</li>
          </ul>
          <h2>Ship it</h2>
        </Prose>
        <CodeBlock language="bash" copyable code={'git switch release && git pull\nmake migrate ENV=prod DRY_RUN=0\n./scripts/deploy.sh orbit-billing --canary 5'} />
        <Prose><p>Widen the rollout one stage at a time and watch checkout errors between stages.</p></Prose>
      </Stack>
      <Stack gap={24}>
        <Margin title="Outline" count={3}>
          <ActionableList aria-label="Outline" density="compact">
            {['Before you start', 'Ship it', 'Rolling back'].map(h => <ActionableListItem key={h} href={`#${h}`} label={h} />)}
          </ActionableList>
        </Margin>
        <Margin title="Tags" count={3}>
          <Inline gap={6} wrap>{['deploy 1', 'orbit-billing 2', 'on-call 3'].map(t => <Tag key={t} variant="paper">{`# ${t}`}</Tag>)}</Inline>
        </Margin>
        <Margin title="Parent" count={1}>
          <ActionableList aria-label="Parent" density="compact"><ActionableListItem href="#oncall" label="On-call handbook" description="runbooks · guide" /></ActionableList>
          <Button size="sm" style={{ alignSelf: 'start' }}>Change parent</Button>
        </Margin>
        <Margin title="Related" count={2}>
          <ActionableList aria-label="Related" density="compact">
            <ActionableListItem href="#sticky" leading={<Icon name="link" />} label="Sticky sessions on the load balancer" description="decisions" truncateLabel />
            <ActionableListItem href="#rotate" leading={<Icon name="link" />} label="Rotate the Fleet Infra keys" description="runbooks/fleet" truncateLabel />
          </ActionableList>
        </Margin>
        <Margin title="Backlinks" count={4}>
          <ActionableList aria-label="Backlinks" density="compact">
            <ActionableListItem href="#start" label="Start here" description="… are steps to follow at 2am, like Deploy Orbit Billing" />
            <ActionableListItem href="#oncall" label="On-call handbook" description="… see Deploy Orbit Billing before you page anyone" />
          </ActionableList>
        </Margin>
      </Stack>
    </div>
  </PrimepawShell>;
}

type Artifact = { title: string; kind: string; meta: string; from: string; tone: string; preview: 'lines' | 'chart' | 'none'; badge?: string; off?: boolean };
const artifacts: Artifact[] = [
  { title: 'Sticky checkout rollout plan', kind: 'Markdown', meta: 'v2 · 1.1 KB', from: 'Sticky checkout sessions · Orbit Billing', tone: 'var(--kraft-red)', preview: 'lines' },
  { title: 'Checkout health page', kind: 'HTML', meta: '14 KB', from: 'Sticky checkout sessions · Orbit Billing', tone: 'var(--kraft-red)', preview: 'chart' },
  { title: 'Cart errors, last 30 days', kind: 'PNG', meta: '1600 × 1000', from: 'Billing dashboard charts · Orbit Billing', tone: 'var(--kraft-red)', preview: 'chart' },
  { title: 'sticky_cookie.tf', kind: 'Terraform', meta: '16 lines', from: 'Sticky checkout sessions · Orbit Billing', tone: 'var(--kraft-red)', preview: 'none', badge: 'TF' },
  { title: 'Nightly digest, 30 October', kind: 'Markdown', meta: '0.6 KB', from: 'nightly digest · Lighthouse Web', tone: 'var(--kraft-green)', preview: 'lines' },
  { title: 'pipeline_runs.csv', kind: 'CSV', meta: '1,204 rows', from: 'Backfill audit · Kiln Data', tone: 'var(--kraft-teal)', preview: 'none', badge: 'CSV' },
  { title: 'Issue 218 draft', kind: 'Markdown', meta: '0.5 KB', from: 'Issue Creator · Lighthouse Web', tone: 'var(--kraft-green)', preview: 'lines' },
  { title: 'terraform-plan.pdf', kind: 'PDF', meta: '6 pages', from: 'Blast radius review · Fleet Infra', tone: 'var(--kraft-amber)', preview: 'none', badge: 'PDF', off: true },
];

function Preview({ artifact }: { artifact: Artifact }) {
  if (artifact.preview === 'lines') return <div className="pp-preview pp-preview-lines" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <span key={i} />)}</div>;
  if (artifact.preview === 'chart') return <div className="pp-preview" aria-hidden="true"><Icon name="kanban" size={48} /></div>;
  return <div className="pp-preview"><Stack gap={4} align="center"><StatusSticker tone="idle" variant="ghost">{artifact.badge ?? 'File'}</StatusSticker><Text as="span" variant="hand" tone="muted">no preview</Text></Stack></div>;
}

function Artifacts() {
  return <PrimepawShell current="artifacts" sheetHead={<Stack gap={10}>
    <PageTitle title="Artifacts" tally="12 pinned · from 9 sessions"
      actions={<SearchField aria-label="Find an artifact" placeholder="Find an artifact" trailing={<Kbd size="sm" keys={['⌘', 'K']} />} />} />
    <SegmentedControl label="Kind" hideLabel name="kind" variant="chips" defaultValue="all" options={[
      { value: 'all', label: 'All', count: 12 }, { value: 'md', label: 'Markdown', count: 3 }, { value: 'html', label: 'HTML', count: 2 },
      { value: 'img', label: 'Images', count: 4 }, { value: 'other', label: 'Other', count: 3 },
    ]} />
  </Stack>}>
    <CorkBoard layout="grid" minItemWidth={220} scrollLabel="Pinned artifacts">
      {artifacts.map(artifact => <CorkBoardItem key={artifact.title} pin={<Pin tone="red" />}>
        <Card off={artifact.off} media={<Preview artifact={artifact} />} header={<Text as="span" variant="label">{artifact.title}</Text>}>
          <Stack gap={4}>
            <Text as="span" className="pp-mono" tone="muted">{artifact.kind} · {artifact.meta}</Text>
            <Inline gap={6} align="center"><span className="pp-swatch" style={{ background: artifact.tone }} aria-hidden="true" /><Text as="span" variant="hand" tone="muted">{artifact.from}</Text></Inline>
          </Stack>
        </Card>
      </CorkBoardItem>)}
    </CorkBoard>
  </PrimepawShell>;
}

type Idea = { id: string; x: number; y: number; tone: StickyNoteTone; title: string; body: React.ReactNode; by: string; tilt: number };
const ideas: Idea[] = [
  { id: 'digest', x: 24, y: 24, tone: 'attention', tilt: -2, title: 'Friday digest', by: 'you · 2 h ago', body: <><Text variant="hand" size="md">Jarvis sends one note a week:</Text><ul><li>what merged</li><li>what got stuck</li><li>what is next</li></ul></> },
  { id: 'moods', x: 290, y: 16, tone: 'blush', tilt: 1, title: 'Pet moods', by: 'you · yesterday', body: <Stack gap={2}>
    <Checkbox variant="pen" defaultChecked strikeWhenChecked>dizzy on a failed run</Checkbox>
    <Checkbox variant="pen" defaultChecked strikeWhenChecked>cheer on send</Checkbox>
    <Checkbox variant="pen" strikeWhenChecked>sleepy after 6 pm</Checkbox>
    <Checkbox variant="pen" strikeWhenChecked>a wave when a PR merges</Checkbox>
  </Stack> },
  { id: 'sizing', x: 556, y: 34, tone: 'sage', tilt: -1, title: 'Ticket sizing', by: 'Jarvis · yesterday', body: <Text variant="hand" size="md">Split anything over 3 files before it reaches the factory. Ask the curator first.</Text> },
  { id: 'voice', x: 822, y: 20, tone: 'blue', tilt: 1.5, title: 'Voice notes', by: 'you · 2 d ago', body: <Text variant="hand" size="md">Hold ⌥ Space to talk to Jarvis from anywhere. And Jarvis answers out loud?</Text> },
  { id: 'who', x: 60, y: 300, tone: 'attention', tilt: 1, title: 'Who gets the digest?', by: 'you · yesterday', body: <Stack gap={2}>
    <Checkbox variant="pen" defaultChecked strikeWhenChecked>just me, first</Checkbox>
    <Checkbox variant="pen" strikeWhenChecked>the team, later</Checkbox>
  </Stack> },
  { id: 'cache', x: 570, y: 310, tone: 'sage', tilt: -1, title: 'From a session', by: 'Jarvis · 3 h ago', body: <Text variant="hand" size="md">Cache pnpm install across factory runs. Saves about 40 s a ticket.</Text> },
  { id: 'later', x: 120, y: 520, tone: 'ochre', tilt: -1, title: 'Later', by: 'you · last week', body: <Stack gap={2}>
    <Checkbox variant="pen" strikeWhenChecked>try the planner on the docs repo</Checkbox>
    <Checkbox variant="pen" strikeWhenChecked>ask Mara about the billing epic</Checkbox>
    <Checkbox variant="pen" defaultChecked strikeWhenChecked>pin the release checklist</Checkbox>
  </Stack> },
];

function IdeasBoard() {
  return <Stack gap={14}>
    <Inline justify="between" align="center"><Heading as="h2" size="md">Boards</Heading><Button size="sm" leading={<Icon name="plus" />}>New board</Button></Inline>
    <ActionableList aria-label="Idea boards" density="compact">
      <ActionableListItem href="#primepaw" current label="Primepaw" leading={<span className="pp-swatch" style={{ background: 'var(--kraft-ochre)' }} />} trailing={<Text as="span" variant="hand">10</Text>} />
      <ActionableListItem href="#launch" label="Launch week" leading={<span className="pp-swatch" style={{ background: 'var(--kraft-ochre)' }} />} trailing={<Text as="span" variant="hand">4</Text>} />
      <ActionableListItem href="#someday" label="Someday" leading={<span className="pp-swatch" style={{ background: 'var(--kraft-ochre)' }} />} trailing={<Text as="span" variant="hand">3</Text>} />
    </ActionableList>
    <Inline gap={8} align="end"><Heading as="h2" size="md">Notes</Heading><Text as="span" variant="hand" tone="muted">5 nested · drag one onto another</Text></Inline>
    <TreeView aria-label="Notes" density="compact" branchStyle="plain" defaultExpandedIds={['n1', 'n2', 'n3']} items={[
      { id: 'n1', label: 'Friday digest', children: [{ id: 'n1a', label: 'Who gets the digest?' }] },
      { id: 'n2', label: 'Pet moods', children: [{ id: 'n2a', label: 'Sleepy: eyes half shut' }] },
      { id: 'n3', label: 'Ticket sizing', children: [{ id: 'n3a', label: 'From a session: cache pnpm' }] },
      { id: 'n4', label: 'Voice notes' }, { id: 'n5', label: 'Later' },
    ]} />
  </Stack>;
}

function Ideas() {
  return <PrimepawShell current="ideas" board={<IdeasBoard />} boardLabel="Idea boards" sheetHead={<PageTitle title="Idea board / Primepaw"
    tally="10 notes · click one to write on it, drag it anywhere, double-click the cork for a new one"
    actions={<Button variant="blue" leading={<Icon name="plus" />}>New note</Button>} />}>
    {/* Missing: the string between a note and its child note. CorkBoard has no connectors yet. */}
    <CorkBoard layout="free" height={760} minItemWidth={230} scrollLabel="Idea board">
      {ideas.map(idea => <CorkBoardItem key={idea.id} x={idea.x} y={idea.y} label={idea.title} onMove={() => {}} pin={<Pin tone="red" />}>
        <StickyNote tone={idea.tone} tilt={idea.tilt} header={<Heading as="h2" size="title-sm">{idea.title}</Heading>} footer={<Text as="span" variant="hand" tone="muted">{idea.by}</Text>}>
          <Prose>{idea.body}</Prose>
        </StickyNote>
      </CorkBoardItem>)}
    </CorkBoard>
  </PrimepawShell>;
}

type Task = { id: string; label: string; state?: 'To do' | 'Doing' | 'Done'; waits?: string; children?: Task[]; note?: string };
const tasks: Task[] = [
  { id: 'move', label: 'Move to the new flat', note: 'Out of Calle Olmo by the 28th. Keys for the new place on the 1st.', children: [
    { id: 'packing', label: 'Packing', note: 'One room at a time, kitchen last.', children: [
      { id: 'kitchen', label: 'Kitchen', children: [{ id: 'wrap', label: 'Wrap the glasses in newspaper', state: 'To do' }, { id: 'pans', label: 'Box the pans', state: 'To do' }] },
      { id: 'books', label: 'Books into boxes', state: 'Done' }, { id: 'labels', label: 'Label every box', state: 'Doing' },
    ] },
    { id: 'paper', label: 'Paperwork', note: 'Everything that needs a signature or a form.', children: [
      { id: 'lease', label: 'Sign the lease', state: 'Done' }, { id: 'internet', label: 'Move the internet', state: 'Doing' }, { id: 'bank', label: 'Tell the bank the new address', state: 'To do', waits: '1/1' },
    ] },
  ] },
  { id: 'lisbon', label: 'Trip to Lisbon', note: 'Four days in March with Dad.', children: [
    { id: 'passport', label: 'Renew my passport', state: 'Doing' }, { id: 'flights', label: 'Book the flights', state: 'To do', waits: '1/2' },
    { id: 'alfama', label: 'Find a place in Alfama', state: 'To do', waits: '0/1' }, { id: 'cat', label: 'Ask Marta to feed the cat', state: 'Done' },
  ] },
];
const stateTone = { 'To do': 'attention', Doing: 'blue', Done: 'sage' } as const;
const done = (task: Task): number => task.children ? task.children.reduce((n, c) => n + done(c), 0) : task.state === 'Done' ? 1 : 0;
const total = (task: Task): number => task.children ? task.children.reduce((n, c) => n + total(c), 0) : 1;
const toTree = (task: Task): TreeNode => ({ id: task.id, label: task.label, done: task.state === 'Done', trailing: task.children ? <Text as="span" variant="hand">{done(task)}/{total(task)}</Text> : undefined, children: task.children?.map(toTree) });

/** Missing component: `TaskSquare` / nested task groups with dependency strings. Closest: nested Surfaces of StickyNotes. */
function TaskGroup({ task, depth = 0 }: { task: Task; depth?: number }) {
  const leaves = task.children?.filter(c => !c.children) ?? [];
  const groups = task.children?.filter(c => c.children) ?? [];
  return <Surface material={depth % 2 ? 'cardboard' : 'paper'} elevation={1} padding={12} className="pp-task-group">
    <Inline justify="between" align="center"><Heading as={depth ? 'h3' : 'h2'} size="sm">{task.label}</Heading><Text as="span" variant="hand">{done(task)}/{total(task)}</Text></Inline>
    {task.note && <Text variant="label-sm" tone="muted">{task.note}</Text>}
    {groups.length > 0 && <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>{groups.map(g => <TaskGroup key={g.id} task={g} depth={depth + 1} />)}</div>}
    {leaves.length > 0 && <div className="pp-task-notes">{leaves.map(leaf => <StickyNote key={leaf.id} tone={stateTone[leaf.state ?? 'To do']} tilt={0}
      status={leaf.waits ? 'waiting' : undefined} statusLabel={leaf.waits ? `Waits ${leaf.waits}` : undefined}
      footer={<StatusSticker size="sm" variant="ghost" tone={leaf.state === 'Done' ? 'done' : leaf.state === 'Doing' ? 'working' : 'idle'}>{leaf.state ?? 'To do'}</StatusSticker>}>
      <Text variant="hand" size="md" style={leaf.state === 'Done' ? { textDecoration: 'line-through' } : undefined}>{leaf.label}</Text>
    </StickyNote>)}</div>}
  </Surface>;
}

function Tasks() {
  return <PrimepawShell current="tasks" boardLabel="All tasks"
    board={<Stack gap={12}><Heading as="h2" size="md">All tasks</Heading><TreeView aria-label="All tasks" density="compact" branchStyle="plain" items={tasks.map(toTree)} defaultExpandedIds={['move', 'packing', 'kitchen', 'paper', 'lisbon']} /></Stack>}
    sheetHead={<PageTitle title="Tasks" tally="20 tasks · 6 done · 3 waiting" actions={<><Button>Fold all</Button><Button leading={<Icon name="plus" />}>New task</Button></>} />}>
    <CorkBoard layout="grid" minItemWidth={420} scrollLabel="Task board">
      {tasks.map(task => <CorkBoardItem key={task.id}><TaskGroup task={task} /></CorkBoardItem>)}
    </CorkBoard>
  </PrimepawShell>;
}

export const KnowledgeBase: Story = { name: 'Knowledge base', render: () => <Knowledge /> };
export const KnowledgeBaseNight: Story = { name: 'Knowledge base (night)', render: () => <Knowledge />, ...night };
export const ArtifactsBoard: Story = { name: 'Artifacts', render: () => <Artifacts /> };
export const ArtifactsBoardNight: Story = { name: 'Artifacts (night)', render: () => <Artifacts />, ...night };
export const IdeaBoard: Story = { name: 'Idea board', render: () => <Ideas /> };
export const IdeaBoardNight: Story = { name: 'Idea board (night)', render: () => <Ideas />, ...night };
export const TaskBoard: Story = { name: 'Tasks', render: () => <Tasks /> };
export const TaskBoardNight: Story = { name: 'Tasks (night)', render: () => <Tasks />, ...night };
