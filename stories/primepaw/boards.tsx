import {
  ActionableList, ActionableListItem, Avatar, Badge, Button, Card, CollapsibleGroup, Heading, Icon, Inline, Kbd,
  Pinwheel, SearchField, Select, Stack, StatusDot, StatusSticker, Text, TreeView, type CardTone, type TreeNode,
} from '../../src';
import { PpIcon } from './icons';

type Session = { id: string; label: string; time: string; busy?: boolean; done?: boolean; attention?: number; children?: Session[] };
type Group = { id: string; name: string; tone: CardTone; attention?: boolean; sessions: Session[] };

const groups: Group[] = [
  { id: 'lighthouse', name: 'Lighthouse Web', tone: 'sage', sessions: [
    { id: 'digest', label: 'nightly digest: curator drafts the changelog', time: '22:21', busy: true, children: [
      { id: 'collect', label: 'Collect merged PRs', time: '3:12', done: true },
      { id: 'draft', label: 'Draft changelog entries', time: '6:40', busy: true },
    ] },
    { id: 'rebase', label: 'Rebase feature onto main and fix conflicts', time: '4:55', busy: true },
    { id: 'issue', label: 'Issue Creator', time: '6h 06m', attention: 2 },
  ] },
  { id: 'orbit', name: 'Orbit Billing', tone: 'blush', attention: true, sessions: [
    { id: 'sticky', label: 'Sticky checkout sessions', time: '2h 33m', busy: true, children: [
      { id: 'cookie', label: 'Pin the session cookie', time: '41:07', busy: true },
      { id: 'load', label: 'Checkout load test', time: '18:22' },
    ] },
    { id: 'orb272', label: 'ORB-272 - Browser telemetry', time: '1h 53m', attention: 1 },
    { id: 'triage', label: 'Ticket triage', time: '1:40' },
    { id: 'icon', label: 'Generate app icon', time: '2:50' },
    { id: 'invoices', label: 'Filter invoices by date and customer', time: '1:02' },
    { id: 'pool', label: 'Move worker pool to the new queue', time: '0:34', done: true },
    { id: 'roles', label: 'Fill in access-request roles', time: '2h 56m' },
    { id: 'onboarding', label: 'Onboarding form autofill', time: '45:40' },
  ] },
];

const toNode = (session: Session): TreeNode => ({
  id: session.id,
  label: session.label,
  truncateLabel: true,
  leading: session.busy ? <Pinwheel label="Working" /> : session.done ? <StatusDot tone="done" label="Done" /> : <StatusDot tone="idle" label="Idle" />,
  trailing: <Inline gap={6} align="center">
    {session.attention ? <Badge tone="danger" size="count">{session.attention}</Badge> : null}
    <Text as="span" variant="hand" tone="muted">{session.time}</Text>
  </Inline>,
  children: session.children?.map(toNode),
});

/**
 * The sessions board: search, filters, then sessions grouped by workspace.
 * Workspace header strips are `CollapsibleGroup`; the nested session strips are a `TreeView`.
 */
export function SessionsBoard({ selected }: { selected?: string }) {
  return <Stack gap={12}>
    <Inline gap={8} align="center">
      <SearchField aria-label="Search sessions" placeholder="Search sessions…" trailing={<Kbd size="sm" keys={['⌘', 'K']} />} style={{ flex: 1 }} />
      <Button variant="blue" size="sm">Select</Button>
    </Inline>
    <Inline gap={8} align="center">
      <Select label="Workspace" hideLabel variant="compact" defaultValue="all" options={[
        { value: 'all', label: 'All workspaces' }, ...groups.map(group => ({ value: group.id, label: group.name })),
      ]} />
      <Button size="sm" leading={<PpIcon name="activity" />} aria-pressed>Active</Button>
    </Inline>
    {groups.map(group => <CollapsibleGroup key={group.id} title={group.name} tone={group.tone} count={group.sessions.length + 2}
      countLabel={count => `${count} sessions${group.attention ? ', one needs you' : ''}`} defaultOpen>
      <TreeView aria-label={`${group.name} sessions`} density="compact" branchStyle="board" selectionMode="single"
        defaultSelectedId={selected ?? null} items={group.sessions.map(toNode)}
        defaultExpandedIds={group.sessions.filter(s => s.children).map(s => s.id)} />
    </CollapsibleGroup>)}
  </Stack>;
}

type Thread = { id: string; title: string; time: string; summary: string; count?: number; sessions: { name: string; tone: 'done' | 'waiting' | 'blocked' | 'working'; state: string }[] };
const threads: Thread[] = [
  { id: 'csv', title: 'Add CSV export', time: '9:41', summary: 'Add CSV export is done: PR #918 is open and its checks pass.', sessions: [{ name: 'Add CSV export', tone: 'done', state: 'Done' }] },
  { id: 'node', title: 'Bump Node to 22', time: '9:12', count: 1, summary: 'The api session stopped on 3 tests that mock node-fetch. I can start a fix.', sessions: [
    { name: 'Node 22 for web', tone: 'waiting', state: 'Waiting on you' }, { name: 'Node 22 for api', tone: 'blocked', state: 'Failed' },
  ] },
  { id: 'banner', title: 'Onboarding banner', time: '8:50', count: 1, summary: 'Jarvis has a question for you', sessions: [] },
  { id: 'token', title: 'Fix token refresh', time: 'Yesterday', summary: 'Approved git push in auth-fix: matches your request', sessions: [{ name: 'auth-fix', tone: 'working', state: 'Working' }] },
  { id: 'rounding', title: 'How billing rounds totals', time: 'Yesterday', summary: 'Each line. That is why some totals are a cent off the exact sum.', sessions: [] },
];

/** Jarvis's board on Home: the main agent, factories, then threads with the sessions they started. */
export function ThreadsBoard({ selected = 'csv' }: { selected?: string }) {
  return <Stack gap={14}>
    <Inline gap={10} align="center">
      <Avatar size={44} tone="neutral" glyph={<Icon name="mark" />} alt="Jarvis" tilt={-3} />
      <Stack gap={0}>
        <Heading as="h2" size="title-sm">Jarvis</Heading>
        <Text variant="label-sm" tone="muted">your main agent</Text>
      </Stack>
    </Inline>
    <Inline gap={8} align="center">
      <SearchField aria-label="Search threads" placeholder="Search threads…" style={{ flex: 1 }} />
      <Button variant="blue" size="sm">New thread</Button>
    </Inline>
    <Inline gap={8} align="end"><Heading as="h3" size="title-sm">Factories</Heading><Text as="span" variant="hand" tone="muted">2 on</Text></Inline>
    <Card as="a" href="#factory-primepaw" aria-label="PrimePaw factory, running"
      header={<Inline gap={8} align="center"><Icon name="factory" /><Text as="span" variant="label">PrimePaw</Text><StatusSticker tone="working" size="sm" indicator="dot">Running</StatusSticker></Inline>}
      corner={<Badge tone="danger" size="count">2</Badge>}>
      <Text variant="label-sm" tone="muted">PP-138 in Implementation · 3 of 6 in flight</Text>
    </Card>
    <Card as="a" href="#factory-cerebro" aria-label="Cerebro factory, idle"
      header={<Inline gap={8} align="center"><Icon name="factory" /><Text as="span" variant="label">Cerebro</Text><StatusSticker tone="idle" size="sm" indicator="dot" variant="paper">Idle</StatusSticker></Inline>}>
      <Text variant="label-sm" tone="muted">Nothing ready. The curator waits for a ticket.</Text>
    </Card>
    <Inline gap={8} align="end"><Heading as="h3" size="title-sm">Threads</Heading><Text as="span" variant="hand" tone="muted">6 with Jarvis</Text></Inline>
    {threads.map(thread => <Stack gap={4} key={thread.id}>
      <Card as="a" href={`#thread-${thread.id}`} aria-label={thread.title} selected={thread.id === selected}
        tone={thread.id === selected ? 'attention' : undefined}
        header={<Text as="span" variant="label">{thread.title}</Text>}
        corner={<Inline gap={6} align="center">
          {thread.count ? <Badge tone="danger" size="count">{thread.count}</Badge> : null}
          <Text as="span" variant="hand" tone="muted">{thread.time}</Text>
        </Inline>}>
        <Text variant="label-sm" tone="muted">{thread.summary}</Text>
      </Card>
      {thread.sessions.length > 0 && <ActionableList aria-label={`Sessions in ${thread.title}`} density="compact">
        {thread.sessions.map(session => <ActionableListItem key={session.name} href={`#${session.name}`} label={session.name}
          leading={<StatusDot tone={session.tone} label={session.state} />}
          trailing={<Text as="span" variant="hand" tone="muted">{session.state}</Text>} />)}
      </ActionableList>}
    </Stack>)}
  </Stack>;
}
