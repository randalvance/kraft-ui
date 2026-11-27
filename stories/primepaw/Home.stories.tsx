import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Avatar, AvatarPicker, Badge, Button, Card, Code, CollapsibleGroup, EmptyState, Heading, Icon, Inline, Mat, Select,
  SlotMeter, Stack, Stamp, Stat, StatusDot, StatusSticker, Surface, Tabs, Tag, Text, TextField, Toggle,
  type StatusTone,
} from '../../src';
import { ThreadsBoard } from './boards';
import { AgentLine, Composer, night, PageTitle, PermissionSlip, PrimepawShell, UserNote } from './shell';

const meta = {
  title: 'Primepaw/Home and Action Center',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A session card Jarvis leaves in the thread. Missing component: `SessionCard` (workspace strip, branch, model,
 * status, summary, Open). Closest replacement: a toned `Card`.
 */
function SessionCard() {
  return <Card tone="danger" style={{ maxInlineSize: 640 }}
    header={<Inline gap={10} align="center" wrap>
      <span className="pp-swatch" style={{ background: 'var(--kraft-red)' }} aria-hidden="true" />
      <Text as="span" variant="label">primepaw</Text>
      <Code>feat/csv-export</Code>
      <Text as="span" variant="label-sm" tone="muted">Sonnet 5.5</Text>
    </Inline>}
    corner={<StatusSticker tone="done" indicator="dot">Done</StatusSticker>}
    footer={<Inline justify="end"><Button>Open</Button></Inline>}>
    <Stack gap={4}>
      <Heading as="h2" size="sm">Add CSV export</Heading>
      <Text tone="muted">Added an Export CSV button that reuses the table filters, with tests for money and date formatting.</Text>
    </Stack>
  </Card>;
}

/**
 * The finish report line: a green-matted note with a DONE stamp, the PR and its checks.
 * Missing component: `FinishReport`. Closest: `Mat tone="sage"` with Stamp, Tag and Button.
 */
function FinishLine() {
  return <Mat tone="sage" padding={16} style={{ maxInlineSize: 660 }}>
    <Stack gap={10}>
      <Inline justify="between" align="center" gap={12}>
        <Heading as="h2" size="md">Add CSV export is done: PR #918 is open and its checks pass.</Heading>
        <Stamp size="sm" tone="sage">Done</Stamp>
      </Inline>
      <Inline justify="between" align="center" gap={12}>
        <Inline gap={10} align="center"><Tag variant="kraft">PR#918</Tag><Text as="span" variant="label" style={{ color: 'var(--kraft-st-green)' }}>✓ 14 checks pass</Text></Inline>
        <Button>Open PR</Button>
      </Inline>
    </Stack>
  </Mat>;
}

function HomeThread() {
  return <PrimepawShell current="home" board={<ThreadsBoard />} boardLabel="Threads" hideDock
    sheetHead={<Inline gap={12} align="end"><Heading as="h1" size="title-sm">Add CSV export</Heading><Text as="span" variant="label-sm" tone="muted">with Jarvis</Text><Text as="span" variant="hand">1 session started</Text></Inline>}>
    <div className="pp-thread">
      <div className="pp-thread-body">
        <UserNote>Add a CSV export to the invoices table in primepaw. Same columns as the screen, and it should respect the filters.</UserNote>
        <AgentLine>Before starting I checked how the table gets its rows, so the session knows where to look.</AgentLine>
        {/* Missing component: `HelperCard` (folded read-only research). Closest: CollapsibleGroup. */}
        <CollapsibleGroup title="Looked at how the invoices table loads its rows in primepaw" defaultOpen style={{ maxInlineSize: 640 }}>
          <Text variant="label-sm" tone="muted">read-only</Text>
          <Text>Rows come from useInvoices, which already takes the filters, so the export can reuse the same query.</Text>
        </CollapsibleGroup>
        <Text variant="lead">Started Add CSV export in primepaw on a new worktree</Text>
        <SessionCard />
        <FinishLine />
      </div>
      <Composer label="Write to Jarvis" placeholder="Write to Jarvis…" context={77} />
    </div>
  </PrimepawShell>;
}

/**
 * `DioramaHomeMeet`: Meet your Main Agent on an empty Home. Name, portrait, model.
 * Portrait stickers use AvatarPicker; the pet art itself is out of scope for the library.
 */
function MeetAgent() {
  return <PrimepawShell current="home" sheetLabel="Meet your main agent">
    <Stack gap={16} style={{ maxInlineSize: 620, marginInline: 'auto', paddingBlock: 40 }}>
      <Heading as="h1" size="display">Meet your main agent</Heading>
      <Text variant="lead">It is who you talk to. It starts sessions, answers for them when you allow it, and never edits code itself.</Text>
      <Surface padding={24}>
        <Stack gap={16}>
          <TextField aria-label="Name" variant="underline" size="title" defaultValue="Jarvis" />
          <AvatarPicker label="Portrait" name="portrait" defaultValue="robot" options={[
            { value: 'robot', label: 'Robot dog', glyph: <Icon name="agent" />, tone: 'blue' },
            { value: 'puppy', label: 'Puppy', glyph: <Icon name="mark" />, tone: 'attention' },
            { value: 'cat', label: 'Cat', initial: 'C', tone: 'sage' },
            { value: 'pug', label: 'Pug', initial: 'P', tone: 'danger' },
            { value: 'kitten', label: 'Kitten', initial: 'K', tone: 'neutral' },
          ]} />
          <Toggle defaultChecked description="Claude Sonnet 5.5 on Anthropic">Use the global default model</Toggle>
          <Inline gap={12}>
            <Select label="Provider" disabled defaultValue="anthropic" options={[{ value: 'anthropic', label: 'Anthropic' }]} />
            <Select label="Model" disabled defaultValue="sonnet" options={[{ value: 'sonnet', label: 'Claude Sonnet 5.5' }]} />
          </Inline>
          <Inline gap={12} align="center"><Button variant="blue">Create</Button><Text as="span" variant="hand" tone="muted">All of this can change later in Settings.</Text></Inline>
        </Stack>
      </Surface>
    </Stack>
  </PrimepawShell>;
}

type Factory = { name: string; state: string; tone: StatusTone; cap: number; slots: StatusTone[]; note: string };
const factories: Factory[] = [
  { name: 'Orbit Billing', state: 'Running', tone: 'working', cap: 6, slots: ['working', 'working', 'working', 'waiting'], note: '3 running · 4 queued' },
  { name: 'Lighthouse Web', state: '1 blocked', tone: 'blocked', cap: 4, slots: ['working', 'working', 'blocked'], note: '2 running · 2 queued' },
  { name: 'Gateway', state: '2 blocked', tone: 'blocked', cap: 4, slots: ['working', 'blocked', 'blocked'], note: '1 running · 1 queued' },
  { name: 'primepaw', state: 'Paused', tone: 'idle', cap: 3, slots: [], note: '3 queued, none started' },
];
const toneLabels = { working: 'working', waiting: 'waiting on you', blocked: 'blocked' };

/** Missing component: `QuestionChip` (an agent's pending questions as one card). Closest: a Mat around a Card body. */
function QuestionCard({ who, count, subject, from }: { who: string; count: number; subject: string; from: string }) {
  return <Mat tone="amber" padding={16}>
    <Inline gap={12} align="start">
      <Avatar size={44} tone="neutral" glyph={<Icon name="agent" />} decorative tilt={-3} />
      <Stack gap={4} style={{ flex: 1 }}>
        <Text variant="label"><Code>{who}</Code> has {count} question{count === 1 ? '' : 's'}</Text>
        <Text variant="hand" tone="muted">{subject}</Text>
        <Text variant="label-sm" tone="muted">{from}</Text>
      </Stack>
      <Button variant="blue">Answer</Button>
    </Inline>
  </Mat>;
}

function ActionCenter() {
  const needs = <Stack gap={16}>
    <Text variant="hand" tone="muted">Questions and permission slips. Answer here, and the card leaves once it is settled.</Text>
    <div className="pp-inbox-grid">
      <QuestionCard who="implementer-agent" count={3} subject="Event names, Batching, Pages" from="ORB-272 Browser events · Orbit Billing factory" />
      <QuestionCard who="Jarvis" count={1} subject="Which workspace should I start this in?" from="Onboarding banner · a thread on Home" />
      <Stack gap={6}>
        <PermissionSlip question="May I push this branch?" tool="bash" command="git push origin feat/csv-export"
          effects={['leaves the machine', 'a PR follows']} footnote="or open the session to say what to do instead">
          Pushes the export so the PR can open. Nothing on main changes.
        </PermissionSlip>
        <Text variant="hand" tone="muted">From the Add CSV export session · 9:41</Text>
      </Stack>
    </div>
  </Stack>;
  return <PrimepawShell current="inbox" sheetHead={<PageTitle leading={<Icon name="bolt" size={24} />} title="Action Center" tally="9 things need you, 2 reports to read" />}>
    <Stack gap={24}>
      <Inline justify="between" align="end">
        <Inline gap={8} align="end"><Heading as="h2" size="md">Factories</Heading><Text as="span" variant="hand" tone="muted">3 of 4 at work</Text></Inline>
        <Inline gap={12}>
          <StatusDot tone="working" shape="square">working</StatusDot>
          <StatusDot tone="waiting" shape="square">waiting on you</StatusDot>
          <StatusDot tone="blocked" shape="square">blocked</StatusDot>
        </Inline>
      </Inline>
      <div className="pp-grid pp-compact-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <Surface padding={16}>
          <Inline gap={16}><Stat value="6" label="running" size="sm" /><Stat value="10 of 17" label="slots used" size="sm" /><Stat value="3" label="blocked" tone="danger" size="sm" /></Inline>
        </Surface>
        {factories.map(f => <Card key={f.name} off={f.tone === 'idle'}
          header={<Inline gap={8} align="center"><Icon name="factory" /><Heading as="h3" size="title-sm">{f.name}</Heading></Inline>}
          corner={<StatusDot tone={f.tone}>{f.state}</StatusDot>}>
          <Stack gap={6}>
            <SlotMeter label={`${f.name} slots`} cap={f.cap} slots={f.slots} toneLabels={toneLabels} />
            <Text variant="hand" tone="muted">{f.slots.length} of {f.cap} slots · {f.note}</Text>
          </Stack>
        </Card>)}
      </div>
      <Tabs aria-label="What needs you" items={[
        { id: 'needs', label: 'Needs your answer', trailing: <Badge size="count">3</Badge>, content: needs },
        { id: 'blocked', label: 'Blocked', trailing: <Badge size="count">3</Badge>, content: <Text>Three sessions stopped on a failing step.</Text> },
        { id: 'prs', label: 'PRs to approve', leading: <Icon name="pull-requests" />, trailing: <Badge size="count">3</Badge>, content: <Text>Three pull requests wait for your review.</Text> },
        { id: 'finished', label: 'Finished', leading: <Icon name="check" />, trailing: <Badge size="count">2</Badge>, content: <Text>Two finish reports to read.</Text> },
      ]} />
    </Stack>
  </PrimepawShell>;
}

function ActionCenterEmpty() {
  return <PrimepawShell current="inbox" sheetHead={<PageTitle leading={<Icon name="bolt" size={24} />} title="Action Center" tally="nothing needs you" />}>
    <EmptyState title="Nothing needs you" titleAs="h2" leading={<Icon name="inbox" size={32} />} action={<Button variant="blue">Start a thread with Jarvis</Button>}
      style={{ maxInlineSize: 520, marginInline: 'auto', marginBlockStart: 80 }}>
      All clear. Questions, permission slips and finish reports land here when a session needs you.
    </EmptyState>
  </PrimepawShell>;
}

export const Thread: Story = { name: 'Home thread with Jarvis', render: () => <HomeThread /> };
export const ThreadNight: Story = { name: 'Home thread with Jarvis (night)', render: () => <HomeThread />, ...night };
export const Meet: Story = { name: 'Meet your main agent', render: () => <MeetAgent /> };
export const MeetNight: Story = { name: 'Meet your main agent (night)', render: () => <MeetAgent />, ...night };
export const Inbox: Story = { name: 'Action Center', render: () => <ActionCenter /> };
export const InboxNight: Story = { name: 'Action Center (night)', render: () => <ActionCenter />, ...night };
export const InboxEmpty: Story = { name: 'Action Center, empty', render: () => <ActionCenterEmpty /> };
