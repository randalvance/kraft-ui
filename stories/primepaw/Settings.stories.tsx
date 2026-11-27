import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionableList, ActionableListItem, Avatar, AvatarGroup, Badge, Button, Callout, Card, CardAddTile, Checkbox,
  CheckboxGroup, Code, DescriptionList, Drawer, FormSection, Heading, Icon, IconButton, Inline, Kbd, Link, Meter,
  PageHeader, Prose, RadioGroup, SearchField, Stack, Stamp, Stat, StatusDot, StatusSticker, Tabs, Text, Textarea,
  Toggle, ToggleChips, type AvatarProps, type CardTone, type StatusTone,
} from '../../src';
import { night, PageTitle, PrimepawShell } from './shell';

const meta = {
  title: 'Primepaw/Settings',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const search = (label: string, placeholder: string) =>
  <SearchField aria-label={label} placeholder={placeholder} trailing={<Kbd size="sm" keys={['⌘', 'K']} />} style={{ minInlineSize: 240 }} />;

/** Agent portraits. The prototype's illustrated stickers become glyph Avatars until the pet art ships. */
const agents: { name: string; tone: AvatarProps['tone']; text: string }[] = [
  { name: 'Curator', tone: 'neutral', text: 'Drafts the nightly changelog from merged PRs and release notes, then opens a draft PR for someone to read over coffee.' },
  { name: 'Implementer', tone: 'sage', text: 'Takes a scoped ticket, writes the change with tests, and leaves a PR with a plain summary of what moved and why.' },
  { name: 'Issue Creator', tone: 'danger', text: 'Turns a loose description into a well-formed issue: checks the code first, then files it with labels and a repro.' },
  { name: 'Reviewer', tone: 'blue', text: 'Reads a PR the way a careful colleague would: correctness first, then naming, then the nits it keeps to itself.' },
  { name: 'Triage', tone: 'attention', text: 'Sorts incoming tickets by area and urgency, links duplicates, and asks the reporter for whatever is missing.' },
  { name: 'Release Captain', tone: 'danger', text: 'Cuts release branches, rebases open work onto them, and watches the deploy until every health check is green.' },
  { name: 'Support Writer', tone: 'blue', text: 'Drafts answers to support threads from the docs and recent fixes, and flags anything it is not sure about.' },
  { name: 'Infra Planner', tone: 'neutral', text: 'Plans Terraform changes module by module and explains the blast radius before it touches anything.' },
];
const portrait = (tone: AvatarProps['tone'], name: string, size = 56) =>
  <Avatar size={size} tone={tone} glyph={<Icon name="agent" />} alt={name} tilt={-2} />;

function Agents() {
  return <PrimepawShell current="settings" sheetHead={<PageTitle title="Agents" tally="8 agents"
    actions={<>{search('Find an agent', 'Find an agent')}<Button variant="blue" leading={<Icon name="plus" />}>New agent</Button></>} />}>
    <div className="pp-grid">
      {/* `Card as="a"` cannot take `media` (it collides with the native <a media> attribute), so the link sits in the heading. */}
      {agents.map(agent => <Card key={agent.name}
        media={portrait(agent.tone, agent.name)}
        header={<Heading as="h2" size="md"><Link href={`#agent-${agent.name}`} tone="inherit" underline="hover">{agent.name}</Link></Heading>}
        footer={<Inline justify="end"><Button size="sm" leading={<Icon name="sessions" />}>Start a chat</Button></Inline>}>
        <Text tone="muted">{agent.text}</Text>
      </Card>)}
      <CardAddTile label="Make a new agent" />
    </div>
  </PrimepawShell>;
}

const models = [
  { value: 'fable', label: 'Fable 5.1', swatch: 'var(--kraft-red)', note: 'default High · the careful one' },
  { value: 'opus', label: 'Opus 5.5', swatch: 'var(--kraft-blue)', note: 'default Medium · deep work' },
  { value: 'sonnet', label: 'Sonnet 5.5', swatch: 'var(--kraft-green)', note: 'default High · everyday' },
  { value: 'haiku', label: 'Haiku 5.5', swatch: 'var(--kraft-amber)', note: 'default Medium · quick and cheap' },
];
const mcpRows = [
  { name: 'GitHub', note: 'PRs, issues, checks', tools: 14, on: true },
  { name: 'Filesystem', note: 'read and write inside the workspace', tools: 6, on: true },
  { name: 'Postgres (staging)', note: 'read-only queries', tools: 4, on: false },
  { name: 'Browser', note: 'open, read, screenshot', tools: 9, on: true },
  { name: 'Slack', note: 'post to #releases', tools: 5, on: false },
  { name: 'Sentry', note: 'issues and traces', tools: 3, on: false },
];

function AgentEdit() {
  return <PrimepawShell current="settings" sheetHead={<PageHeader title="Curator"
    back={<Link href="#agents" underline="hover">‹ Agents</Link>}
    leading={portrait('neutral', 'Curator', 64)}
    status={<Text as="span" role="status" variant="hand" tone="muted">all saved · edited 2 days ago</Text>}
    actions={<><Button variant="danger" leading={<Icon name="trash" />}>Delete agent</Button><Button leading={<Icon name="check" />}>Save agent</Button></>} />}>
    <div className="pp-two-col">
      <Stack gap={24}>
        <FormSection title="Description" hint="one line · shows on the agent card">
          <Textarea aria-label="Description" rows={2} defaultValue="Drafts the nightly changelog from merged PRs and release notes, then opens a draft PR for someone to read over coffee." />
        </FormSection>
        <FormSection title="System prompt" hint="read before every session">
          <Textarea aria-label="System prompt" variant="ruled" rows={10} autoGrow footer={<Text as="span" variant="hand" tone="muted">523 characters · ≈ 131 tokens</Text>}
            defaultValue={'You are Curator, the changelog agent for the Lighthouse Web workspace.\n\nEvery night at 02:00 read the PRs merged since the last release and write the changelog entry. Group by area (Editor, Sessions, Billing). Lead with what changed for the user, then link the PR. Skip refactors unless they change behaviour.\n\nOpen the result as a draft PR against docs/changelog.md and stop. Do not merge.'} />
        </FormSection>
      </Stack>
      <Stack gap={24}>
        <FormSection title="Preferred model" hint="for new sessions · switch any time">
          <RadioGroup name="model" label="Preferred model" hideLabel variant="flat" defaultValue="sonnet" options={models.map(model => ({
            value: model.value, label: model.label,
            leading: <span className="pp-swatch" style={{ background: model.swatch }} />,
            trailing: <Text as="span" variant="hand" tone="muted">{model.note}</Text>,
          }))} />
        </FormSection>
        <FormSection title="MCP servers" hint="3 of 6 on">
          <Stack gap={10}>
            {mcpRows.map(row => <Toggle key={row.name} labelSide="start" defaultChecked={row.on} description={`${row.note} · ${row.tools} tools`}>{row.name}</Toggle>)}
          </Stack>
        </FormSection>
        <FormSection title="Skills" hint="2 of 4 on">
          <CheckboxGroup label="Skills Curator may use" tally="2 of 4">
            <Checkbox defaultChecked description="/changelog">Changelog entry</Checkbox>
            <Checkbox defaultChecked description="/pr-description">PR description</Checkbox>
            <Checkbox description="/commit">Commit message</Checkbox>
            <Checkbox description="/code-review">Code review</Checkbox>
          </CheckboxGroup>
        </FormSection>
      </Stack>
    </div>
  </PrimepawShell>;
}

type Skill = { name: string; command: string; source: string; sourceTone: 'neutral' | 'blue' | 'sage' | 'danger'; version: string; text: string; files: string; used: string; on: boolean; users: AvatarProps['tone'][]; spaces: CardTone[] };
const skills: Skill[] = [
  { name: 'PR description', command: '/pr-description', source: 'Built-in', sourceTone: 'neutral', version: 'v2.1', text: 'Writes the pull request body from the diff and the ticket: what changed, why, and how to test it.', files: 'SKILL.md · 1 reference', used: 'used 2 h ago · 41 this month', on: true, users: ['sage', 'neutral'], spaces: ['sage', 'danger', 'violet'] },
  { name: 'Code review', command: '/code-review', source: 'Built-in', sourceTone: 'neutral', version: 'v3.0', text: 'Reads a diff the way a careful colleague would: correctness first, then naming, then the nits it keeps to itself.', files: 'SKILL.md · 2 references', used: 'used 40 min ago · 67 this month', on: true, users: ['blue'], spaces: ['sage', 'danger', 'ochre', 'violet'] },
  { name: 'Changelog entry', command: '/changelog', source: 'Yours', sourceTone: 'danger', version: 'v3', text: 'Drafts a changelog entry from the merged PRs since the last release, grouped by what changed for users.', files: 'SKILL.md · 1 script · 1 reference', used: 'used 2 h ago · 23 this month', on: true, users: ['neutral'], spaces: ['sage'] },
  { name: 'Deploy', command: '/deploy', source: 'Plugin · fleet-tools', sourceTone: 'blue', version: 'v0.9', text: 'Ships an environment with `fleet ship`, watches the health checks for ten minutes and rolls back if a budget is blown.', files: 'SKILL.md · 3 scripts', used: 'used yesterday · 9 this month', on: true, users: ['danger'], spaces: ['ochre'] },
  { name: 'Invoice PDF', command: '/invoice-pdf', source: 'Project · Orbit Billing', sourceTone: 'sage', version: 'v2', text: 'Reads an invoice PDF and pulls out the fields the ledger needs, then files a ticket with the gist.', files: 'SKILL.md · 1 script', used: 'used 32 min ago · 15 this month', on: true, users: ['danger'], spaces: ['danger'] },
  { name: 'Design tokens check', command: '/design-tokens', source: 'Project · Lighthouse Web', sourceTone: 'sage', version: 'v1', text: 'Checks a UI change against the Kraft tokens and flags any hard-coded colour, size or shadow.', files: 'SKILL.md · 1 script', used: 'off since 20 Oct', on: false, users: ['blue'], spaces: ['sage'] },
];
const tonePaint: Record<string, string> = { sage: 'var(--kraft-green)', danger: 'var(--kraft-red)', violet: 'var(--kraft-violet)', ochre: 'var(--kraft-amber)', blue: 'var(--kraft-blue)' };

function Skills() {
  return <PrimepawShell current="settings" sheetHead={<Stack gap={12}>
    <PageTitle title="Skills" tally="14 skills · 10 on · 4 from plugins · 3 yours"
      actions={<>{search('Find a skill', 'Find a skill…')}<Button variant="blue" leading={<Icon name="plus" />}>New skill</Button></>} />
    <Inline justify="between" align="center" wrap gap={12}>
      <ToggleChips label="Show" name="skill-filter" variant="chips" defaultValue={['all']} options={[
        { value: 'all', label: 'All' }, { value: 'on', label: 'On' }, { value: 'off', label: 'Off' }, { value: 'builtin', label: 'Built-in' },
        { value: 'plugins', label: 'From plugins' }, { value: 'project', label: 'From a project' }, { value: 'yours', label: 'Yours' },
      ]} />
      <Text as="span" variant="hand" tone="muted">a skill is a folder with a SKILL.md · the switch turns it off everywhere</Text>
    </Inline>
  </Stack>}>
    <div className="pp-grid">
      {skills.map(skill => <Card key={skill.name} off={!skill.on}
        header={<Inline gap={8} align="center"><Stamp size="sm" tone={skill.sourceTone}>{skill.source}</Stamp><Text as="span" variant="hand" tone="muted">{skill.version}</Text></Inline>}
        corner={<Toggle aria-label={`${skill.name} on`} defaultChecked={skill.on} />}
        footer={<Inline justify="between" align="center" gap={8} wrap>
          <Inline gap={6} align="center">
            <AvatarGroup label="Agents using it" size={24} avatars={skill.users.map((tone, i) => ({ glyph: <Icon name="agent" />, tone, alt: `Agent ${i + 1}` }))} />
            {skill.spaces.map((space, i) => <span key={i} className="pp-swatch" style={{ background: tonePaint[space] }} aria-hidden="true" />)}
          </Inline>
          <Text as="span" variant="hand" tone="muted">{skill.used}</Text>
        </Inline>}>
        <Stack gap={6}>
          <Inline gap={8} align="end" wrap><Heading as="h2" size="md">{skill.name}</Heading><Code>{skill.command}</Code></Inline>
          <Text tone="muted">{skill.text}</Text>
          <Text variant="hand" tone="muted">{skill.files}</Text>
        </Stack>
      </Card>)}
    </div>
  </PrimepawShell>;
}

type Server = { name: string; from: string; kind: 'STDIO' | 'HTTP'; text: string; cmd: string; state: string; tone: StatusTone; since: string; tools: string; extra: string; action: string };
const servers: Server[] = [
  { name: 'GitHub', from: 'from the GitHub plugin', kind: 'STDIO', text: 'Pull requests, issues, checks and code search on the lighthouse and orbit orgs.', cmd: 'npx -y @modelcontextprotocol/server-github', state: 'Connected', tone: 'done', since: 'since 08:12 · 212 calls today', tools: '14 tools', extra: 'tools only', action: 'Restart' },
  { name: 'Filesystem', from: 'built in', kind: 'STDIO', text: 'Reads and writes inside the linked folders of the current workspace and nowhere else.', cmd: 'mcp-server-filesystem ~/dev', state: 'Connected', tone: 'done', since: 'since 08:12 · 1,480 calls today', tools: '6 tools', extra: '2 resources', action: 'Restart' },
  { name: 'Browser', from: 'built in', kind: 'STDIO', text: 'Opens pages, reads them as text and takes screenshots in a headless profile of its own.', cmd: 'mcp-server-browser --headless', state: 'Connecting', tone: 'waiting', since: 'restarting after a crash · 3rd try', tools: '9 tools', extra: 'tools only', action: 'Connecting…' },
  { name: 'Sentry', from: 'from the Sentry plugin', kind: 'HTTP', text: 'Issues, traces and release health for the fleet projects.', cmd: 'https://mcp.sentry.example/sse', state: 'Needs sign-in', tone: 'blocked', since: 'token expired yesterday', tools: '3 tools', extra: 'tools only', action: 'Sign in' },
];

function McpServers() {
  return <PrimepawShell current="settings" sheetHead={<Stack gap={12}>
    <PageTitle title="MCP servers" tally="10 servers · 6 connected · 2 need attention · 1 off · 34 tools on the table"
      actions={<>{search('Find a server or a tool', 'Find a server or a tool…')}<Button variant="blue" leading={<Icon name="plus" />}>New server</Button></>} />
    <Inline justify="between" align="center" wrap gap={12}>
      <ToggleChips label="Show" name="mcp-filter" variant="chips" defaultValue={['all']} options={[
        { value: 'all', label: 'All' }, { value: 'connected', label: 'Connected' }, { value: 'attention', label: 'Needs attention' },
        { value: 'off', label: 'Off' }, { value: 'stdio', label: 'stdio' }, { value: 'http', label: 'HTTP' },
      ]} />
      <Callout tone="attention" title="Heads up">Sentry needs a sign-in · Jira can't connect</Callout>
    </Inline>
  </Stack>}>
    <div className="pp-split">
      {/* Missing component: `ServerRow` (the timetable row). Closest: ActionableList rows with a rich description. */}
      <ActionableList aria-label="MCP servers">
        {servers.map(server => <ActionableListItem key={server.name}
          leading={<Stamp size="sm" tone={server.kind === 'HTTP' ? 'blue' : 'neutral'}>{server.kind}</Stamp>}
          label={<Inline gap={8} align="end"><Text as="span" variant="label">{server.name}</Text><Text as="span" variant="hand" tone="muted">{server.from}</Text></Inline>}
          description={<Stack gap={4}>
            <Text as="span">{server.text}</Text>
            <Text as="span" className="pp-mono" tone="muted">{server.cmd}</Text>
            <Inline gap={12} align="center" wrap>
              <StatusSticker tone={server.tone} indicator={server.tone === 'waiting' ? 'spinner' : undefined}>{server.state}</StatusSticker>
              <Text as="span" variant="hand" tone="muted">{server.since}</Text>
              <Text as="span" variant="label">{server.tools}</Text>
              <Text as="span" variant="hand" tone="muted">{server.extra}</Text>
            </Inline>
          </Stack>}
          trailing={<Inline gap={8} align="center">
            <Button size="sm" variant={server.tone === 'blocked' ? 'danger' : 'neutral'} loading={server.tone === 'waiting'}>{server.action}</Button>
            <Toggle aria-label={`${server.name} enabled`} defaultChecked />
          </Inline>} />)}
      </ActionableList>
      <Drawer title="Jira" eyebrow={<Stamp size="sm" tone="blue">HTTP</Stamp>} onClose={() => {}} closeLabel="Close Jira"
        description="Tickets on the Billing migration board. The Kanban page syncs through this server too."
        actions={<Toggle aria-label="Jira enabled" defaultChecked />}>
        <Stack gap={16}>
          <Button variant="danger" leading={<Icon name="sync" />} style={{ alignSelf: 'start' }}>Reconnect</Button>
          <DescriptionList columns={2} items={[
            { id: 'talks', label: 'Talks to', value: <Code>https://mcp.atlassian.example/mcp</Code>, wide: true },
            { id: 'conn', label: 'Connection', value: <Stack gap={4}><StatusSticker tone="blocked">Error</StatusSticker><Text variant="hand" tone="danger">handshake failed · 502 from the server · retrying in 40 s</Text></Stack> },
            { id: 'from', label: 'Where from', value: 'from the Jira plugin · this project · Orbit Billing' },
            { id: 'auth', label: 'Signs in with', value: 'OAuth · signed in as you' },
            { id: 'ver', label: 'Version', value: 'remote · protocol 2025-06' },
            { id: 'today', label: 'Today', value: '12 calls · 3 failed', wide: true },
          ]} />
          <Inline justify="between" align="end"><Heading as="h3" size="md">Tools</Heading><Text as="span" variant="hand" tone="muted">5 · tools only</Text></Inline>
          <ActionableList aria-label="Jira tools" density="compact">
            {[['get_issue', 'A ticket with its fields and comments.', 'used 7× today'], ['create_issue', 'Files a ticket on a board.', 'used 1× today'],
              ['transition_issue', 'Moves a ticket to another column.', 'used 2× today'], ['add_comment', 'Comments on a ticket.', 'never used']]
              .map(([name, text, used]) => <ActionableListItem key={name} label={<Code>{name}</Code>} description={text}
                trailing={<Text as="span" variant="hand" tone="muted">{used}</Text>} />)}
          </ActionableList>
        </Stack>
      </Drawer>
    </div>
  </PrimepawShell>;
}

const facts = [
  { section: 'Conventions', items: [
    { text: 'Commit messages are imperative and under 72 characters. Add a body only when the why is not obvious from the diff.', meta: 'written by you · 2 Sep · in every session', size: '189 B', pinned: true },
    { text: 'Never force-push a shared branch. Anything that touches main goes through a pull request with one approving review.', meta: 'written by you · 2 Sep · in every session', size: '163 B', pinned: true },
    { text: 'Unit tests sit next to the code as *.test.ts. Anything that needs a database, a browser or the network lives under tests/.', meta: 'learned on Lighthouse Web · 14 Sep · via search', size: '190 B', pinned: false },
    { text: 'Branch names are <area>/<ticket>-<slug>, lower case. The ticket key is what links the PR to the board.', meta: 'written by you · 6 Sep · via search', size: '174 B', pinned: false },
  ] },
  { section: 'Tools & commands', items: [
    { text: 'pnpm is the package manager everywhere. A stray package-lock.json or yarn.lock is a mistake to delete, not a hint to honour.', meta: 'written by you · 2 Sep · in every session', size: '151 B', pinned: true },
  ] },
];

function Memory() {
  const globalPane = <div className="pp-two-col">
    <Stack gap={16}>
      <Inline justify="between" align="end"><Heading as="h2" size="md">Global memory</Heading><Text as="span" variant="hand" tone="muted">20 facts · 5 pinned · 4 sections</Text></Inline>
      {facts.map(group => <Stack gap={8} key={group.section}>
        <Inline gap={8} align="center"><Heading as="h3" size="title-sm">{group.section}</Heading><Badge size="count">{group.items.length}</Badge></Inline>
        <ActionableList aria-label={group.section}>
          {group.items.map(fact => <ActionableListItem key={fact.text} label={fact.text}
            leading={<Icon name="pin" label={fact.pinned ? 'Pinned' : 'Not pinned'} style={{ color: fact.pinned ? 'var(--kraft-red)' : undefined, opacity: fact.pinned ? 1 : 0.5 }} />}
            description={<Text as="span" variant="hand" tone="muted">{fact.meta}</Text>}
            trailing={<Text as="span" className="pp-mono" tone="muted">{fact.size}</Text>}
            actions={<><IconButton size="sm" variant="bare" aria-label="Edit fact"><Icon name="pencil" /></IconButton><IconButton size="sm" variant="bare" aria-label="Forget fact"><Icon name="close" /></IconButton></>} />)}
        </ActionableList>
      </Stack>)}
    </Stack>
    <FormSection title="Budget" hint="4 KB recommended at each level">
      <Stack gap={12}>
        <Inline gap={10} align="center"><Stat value="3.2 KB" label="of 4 KB" tone="attention" size="lg" /><StatusSticker tone="waiting">Nearly full</StatusSticker></Inline>
        <Meter label="Global memory budget" max={4} limit={4} ticks={1} tickLabels formatValue={v => `${v} KB`} segments={[
          { id: 'pinned', label: 'pinned 879 B', value: 0.86, fill: 'solid', tone: 'waiting' },
          { id: 'search', label: 'searchable 2.3 KB', value: 2.3, fill: 'hatched', tone: 'waiting' },
          { id: 'free', label: 'free 815 B', value: 0.8, fill: 'free' },
        ]} />
        <Text variant="hand" tone="muted">Room for about 4 more facts like these before it is full.</Text>
        <Heading as="h3" size="sm">How facts are used</Heading>
        <Prose>
          <p><strong>Pinned</strong> facts are pasted into every session at this level, so they cost context every time.</p>
          <p><strong>Unpinned</strong> facts wait for the agent's <code>search_memory</code> tool, which looks across global, the workspace and the agent.</p>
        </Prose>
      </Stack>
    </FormSection>
  </div>;
  return <PrimepawShell current="memory" sheetHead={<PageTitle title="Memory" tally="77 facts · 21 pinned · global, 6 workspaces, 8 agents"
    actions={<>{search('Search every fact', 'Search every fact…')}<Button variant="blue" leading={<Icon name="plus" />}>New fact</Button></>} />}>
    <Tabs aria-label="Memory levels" items={[
      { id: 'global', label: 'Global', description: '3.2 KB of 4 KB', content: <Stack gap={16}>
        <Callout>Global rides along in every session, whatever the workspace or agent. Keep it to the rules that are true everywhere.</Callout>
        {globalPane}
      </Stack> },
      { id: 'workspaces', label: 'Workspaces', description: '6 workspaces · 1 over', trailing: <Badge tone="danger" size="count">1</Badge>, content: <Text>One workspace is over its budget.</Text> },
      { id: 'agents', label: 'Agents', description: '8 agents', content: <Text>Each agent keeps its own memory.</Text> },
    ]} />
  </PrimepawShell>;
}

const workspaces: { name: string; tone: CardTone; folders: string[]; meta: string; working?: number }[] = [
  { name: 'Lighthouse Web', tone: 'sage', folders: ['~/dev/lighthouse/web', '~/dev/lighthouse/design-tokens'], meta: '4 agents · 5 memory facts · board: Lighthouse Q4', working: 2 },
  { name: 'Orbit Billing', tone: 'danger', folders: ['~/dev/orbit/api', '~/dev/orbit/dashboard'], meta: '3 agents · 9 memory facts · board: Billing migration', working: 1 },
  { name: 'Fleet Infra', tone: 'ochre', folders: ['~/dev/fleet/terraform'], meta: '2 agents · 4 memory facts · board: Platform chores' },
  { name: 'Atlas Docs', tone: 'navy', folders: ['~/dev/atlas-docs'], meta: '1 agent · 2 memory facts · no board yet' },
  { name: 'Harbor Mobile', tone: 'violet', folders: ['~/dev/harbor/ios', '~/dev/harbor/android'], meta: '2 agents · 7 memory facts · board: Harbor 1.0' },
  { name: 'Kiln Data', tone: 'teal', folders: ['~/dev/kiln/pipelines'], meta: '1 agent · 3 memory facts · no board yet' },
];

function Workspaces() {
  return <PrimepawShell current="workspaces" sheetHead={<PageTitle title="Workspaces" tally="6 workspaces · 9 folders · 3 sessions working"
    actions={<>{search('Find a workspace or folder', 'Find a workspace or folder')}<Button variant="blue" leading={<Icon name="plus" />}>New workspace</Button></>} />}>
    <div className="pp-grid">
      {workspaces.map(ws => <Card key={ws.name} tone={ws.tone}
        header={<Heading as="h2" size="md">{ws.name}</Heading>}
        corner={ws.working ? <StatusDot tone="working" shape="square">{`${ws.working} working`}</StatusDot> : undefined}
        footer={<Inline justify="end"><Button size="sm" leading={<Icon name="sessions" />}>New session</Button></Inline>}>
        <Stack gap={6}>
          {ws.folders.map(folder => <Inline key={folder} gap={6} align="center"><Icon name="folder" size={14} /><Text as="span" className="pp-mono">{folder}</Text></Inline>)}
          <Text variant="hand" tone="muted">{ws.meta}</Text>
        </Stack>
      </Card>)}
      <CardAddTile label="Make a new workspace" />
    </div>
  </PrimepawShell>;
}

export const AgentsList: Story = { name: 'Agents', render: () => <Agents /> };
export const AgentsListNight: Story = { name: 'Agents (night)', render: () => <Agents />, ...night };
export const Agent: Story = { name: 'Agent, edit page', render: () => <AgentEdit /> };
export const AgentNight: Story = { name: 'Agent, edit page (night)', render: () => <AgentEdit />, ...night };
export const SkillsList: Story = { name: 'Skills', render: () => <Skills /> };
export const SkillsListNight: Story = { name: 'Skills (night)', render: () => <Skills />, ...night };
export const Mcp: Story = { name: 'MCP servers', render: () => <McpServers /> };
export const McpNight: Story = { name: 'MCP servers (night)', render: () => <McpServers />, ...night };
export const MemoryPage: Story = { name: 'Memory', render: () => <Memory /> };
export const MemoryPageNight: Story = { name: 'Memory (night)', render: () => <Memory />, ...night };
export const WorkspacesList: Story = { name: 'Workspaces', render: () => <Workspaces /> };
export const WorkspacesListNight: Story = { name: 'Workspaces (night)', render: () => <Workspaces />, ...night };
