import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Avatar, Button, Card, CollapsibleGroup, Dialog, Drawer, Heading, Icon, IconButton, Inline, Prose, RadioGroup, Stack,
  Stamp, Tabs, Tag, Text, Textarea, Timeline, Toolbar, ToolbarGroup,
} from '../../src';
import { SessionsBoard } from './boards';
import { PpIcon } from './icons';
import { AgentLine, Composer, night, PermissionSlip, PrimepawShell, UserNote } from './shell';

const meta = {
  title: 'Primepaw/Sessions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** `Diorama`: the app shell with nothing open: a greeting and the composer. */
function NewSession() {
  return <PrimepawShell current="sessions" board={<SessionsBoard />} boardLabel="Sessions" sheetLabel="New session" hideDock>
    <Stack gap={16} className="pp-thread" justify="center" style={{ maxInlineSize: 780 }}>
      <Heading as="h1" size="display">Good morning.</Heading>
      <Text variant="lead">What are we working on? One line is enough; the agent asks when it needs more.</Text>
      <Composer label="Describe the job" placeholder="Describe the job, or paste a ticket…" model="Sonnet 5.5" context={0} />
      <Text variant="hand" tone="muted" style={{ textAlign: 'center' }}>or pick up a session on the left</Text>
    </Stack>
  </PrimepawShell>;
}

/** The session's top strip: identity, ticket, editors, then a toolbar of session tools. */
function SessionHead({ title, ticket }: { title: string; ticket: string }) {
  return <Inline justify="between" align="center" gap={12} wrap>
    <Inline gap={10} align="center">
      <Avatar size={32} tone="sage" glyph={<Icon name="agent" />} alt="Implementer" status={{ tone: 'working', label: 'working' }} />
      <Heading as="h1" size="title-sm">{title}</Heading>
      <Tag variant="kraft" leading={<Icon name="kanban" />}>{ticket}</Tag>
      <IconButton variant="bare" size="sm" aria-label="Rewrite the title"><PpIcon name="sparkle" /></IconButton>
      <IconButton variant="bare" size="sm" aria-label="Open in VS Code"><PpIcon name="vscode" /></IconButton>
    </Inline>
    <Toolbar label="Session tools">
      <ToolbarGroup label="Panels">
        <IconButton variant="bare" size="sm" aria-label="Tasks, 1"><Icon name="three-dots" /></IconButton>
        <IconButton variant="bare" size="sm" aria-label="Terminal"><Icon name="terminal" /></IconButton>
        <IconButton variant="bare" size="sm" aria-label="Pull requests, 2"><Icon name="pull-requests" /></IconButton>
        <IconButton variant="bare" size="sm" aria-label="Artifacts, 3" aria-pressed><PpIcon name="clipboard" /></IconButton>
        <IconButton variant="bare" size="sm" aria-label="Files"><Icon name="folder" /></IconButton>
        <IconButton variant="bare" size="sm" aria-label="History"><Icon name="clock" /></IconButton>
        <IconButton variant="bare" size="sm" aria-label="Side chat" aria-pressed><Icon name="sessions" /></IconButton>
      </ToolbarGroup>
      <ToolbarGroup label="Session" align="end">
        <Button size="sm" leading={<Icon name="check" />}>Done</Button>
        <IconButton variant="bare" size="sm" aria-label="Delete session"><Icon name="trash" /></IconButton>
        <IconButton variant="bare" size="sm" aria-label="Close session"><Icon name="close" /></IconButton>
      </ToolbarGroup>
    </Toolbar>
  </Inline>;
}

/**
 * The capsule: one agent turn folded into a plate. Missing component: `Capsule`.
 * Closest replacement: a `CollapsibleGroup` whose header carries the time and the call counts, and a `Timeline` inside.
 */
function Capsule({ time, calls }: { time: string; calls: string }) {
  return <CollapsibleGroup tone="sage" title={<Inline gap={10} align="center"><Text as="span" variant="label">Done</Text><Text as="span" variant="hand">{time}</Text><Text as="span" variant="label-sm" tone="muted">{calls}</Text></Inline>}>
    <Timeline items={[
      { id: '1', title: 'Read the load balancer config', time: '0:04', tone: 'done' },
      { id: '2', title: 'Edited sticky_cookie.tf', time: '0:12', tone: 'done' },
      { id: '3', title: 'Ran terraform plan', time: '0:21', tone: 'done' },
    ]} />
  </CollapsibleGroup>;
}

function SessionOpen() {
  return <PrimepawShell current="sessions" board={<SessionsBoard selected="sticky" />} boardLabel="Sessions"
    sheetHead={<SessionHead title="Sticky checkout sessions" ticket="ORB-260" />} hideDock>
    <div className="pp-session">
      <div className="pp-thread">
        <div className="pp-thread-body">
          <UserNote>Pick this up from where the last session left off and summarise the state.</UserNote>
          <Capsule time="0:21" calls="3 LLM calls · 2 tool calls" />
          <Text measure={false}>Sticky checkout sessions are enabled on the load balancer with a 12h cookie. Verifying the health check still passes across both zones.</Text>
          <div className="pp-artifact-chips">
            <Card as="button" aria-label="Open Sticky checkout rollout plan" tone="attention" selected
              header={<Inline gap={8} align="center"><Icon name="file" /><Text as="span" variant="label">Sticky checkout rollout plan</Text></Inline>}>
              <Text as="span" className="pp-mono" tone="muted">Markdown · v2</Text>
            </Card>
            <Card as="button" aria-label="Open sticky_cookie.tf"
              header={<Inline gap={8} align="center"><Icon name="code" /><Text as="span" variant="label">sticky_cookie.tf</Text></Inline>}>
              <Text as="span" className="pp-mono" tone="muted">Terraform · 3 lines</Text>
            </Card>
            <Card as="button" aria-label="Open Checkout health page"
              header={<Inline gap={8} align="center"><Icon name="eye" /><Text as="span" variant="label">Checkout health page</Text></Inline>}>
              <Text as="span" className="pp-mono" tone="muted">Web page · preview</Text>
            </Card>
          </div>
        </div>
        <Composer label="Write to the agent" placeholder="Write to the agent · no permission prompts" yolo branch="feat/sticky-checkout" hints={false} />
      </div>
      <div className="pp-session-side">
        {/* Missing component: `Clipboard` (the artifacts sidebar). Closest: a Drawer with file Tabs. */}
        <Drawer title="Artifacts" onClose={() => {}} closeLabel="Close artifacts" footer={<Inline justify="between" gap={8}>
          <Inline gap={8}><Button size="sm">Copy</Button><Button size="sm">Download</Button></Inline>
          <Button size="sm" leading={<Icon name="sessions" />}>Ask on the side</Button>
        </Inline>}>
          <Tabs aria-label="Artifacts" panel="bare" items={[
            { id: 'plan', label: 'Rollout plan', leading: <Icon name="file" />, content: <Stack gap={10}>
              <Inline justify="between" align="center">
                <Heading as="h3" size="md">Sticky checkout rollout plan</Heading>
                <Inline gap={4} align="center"><Text as="span" className="pp-mono">v2 of 2</Text><Stamp size="sm" tone="danger">Pinned</Stamp></Inline>
              </Inline>
              <Prose>
                <h4>Goal</h4>
                <p>Keep a shopper on one checkout node for 12 hours so a half-finished cart survives a deploy.</p>
                <h4>Steps</h4>
                <ul><li>Turn on the cookie for 5% of traffic in zone A.</li><li>Watch cart errors for one hour, then go to 50%.</li><li>Copy the setting to zone B once zone A has run clean overnight.</li></ul>
              </Prose>
            </Stack> },
            { id: 'tf', label: 'sticky_cookie.tf', leading: <Icon name="code" />, content: <Text>3 lines of Terraform.</Text> },
            { id: 'health', label: 'Health page', leading: <Icon name="eye" />, content: <Text>Preview of the checkout health page.</Text> },
          ]} />
        </Drawer>
        {/* Missing component: `SideChat`. Closest: a Drawer with message slips and a field. */}
        <Drawer title="Side chat" onClose={() => {}} closeLabel="Close side chat"
          footer={<Stack gap={6}><Text variant="label-sm" tone="muted">The session keeps working while you ask.</Text><Textarea rows={1} aria-label="Ask on the side" placeholder="Ask on the side…" /></Stack>}>
          <Stack gap={12}>
            <UserNote>Will a 12 hour cookie survive a node drain?</UserNote>
            <Text>Yes. The load balancer moves a drained node's shoppers to a healthy node and writes them a new cookie, so their carts stay put.</Text>
            <Button size="sm" style={{ alignSelf: 'start' }}>Put in chat</Button>
          </Stack>
        </Drawer>
      </div>
    </div>
  </PrimepawShell>;
}

function Approval() {
  return <PrimepawShell current="sessions" board={<SessionsBoard selected="orb272" />} boardLabel="Sessions"
    sheetHead={<SessionHead title="ORB-272 - Browser telemetry" ticket="ORB-272" />} hideDock>
    <div className="pp-thread">
      <div className="pp-thread-body">
        <UserNote>Add browser telemetry for checkout errors, behind a flag. Ask me if anything is ambiguous.</UserNote>
        <Capsule time="0:22" calls="2 LLM calls · 3 tool calls" />
        <AgentLine who="Implementer" italic>The collector needs somewhere to write, so I drafted a migration for a browser_events table. It has to run before anything else works.</AgentLine>
        <PermissionSlip question="May I run this?" tool="bash" command="pnpm prisma migrate dev --name add_browser_events"
          effects={['writes to your local database', 'runs in packages/db']}>
          Creates the browser_events table in your local database. Your existing tables stay as they are.
        </PermissionSlip>
      </div>
      <Composer label="Write what to do instead" placeholder="Or write what to do instead…" workspace="Orbit Billing" branch="feat/ORB-272-telemetry" />
    </div>
  </PrimepawShell>;
}

/**
 * `DioramaQuestion`: the question sheet. Missing component: `QuestionSheet` (tabbed questions, Recommended ribbon,
 * "Question 1 of 3" pager). Closest: a Dialog with Tabs and a RadioGroup of option cards.
 */
function Question() {
  const [open, setOpen] = useState(true);
  const options = [
    { value: '7', label: '7 days', description: 'Enough to debug a bad release. The smallest table, around 280 MB.' },
    // Missing: a corner `Recommended` ribbon on an option. Closest: say it in the label.
    { value: '30', label: '30 days · Recommended', description: 'Covers a full billing cycle, so a disputed charge is still on record. Around 1.2 GB.' },
    { value: '90', label: '90 days', description: 'Matches the server logs, but the table grows to around 3.6 GB.' },
  ];
  return <PrimepawShell current="sessions" board={<SessionsBoard selected="orb272" />} boardLabel="Sessions"
    sheetHead={<SessionHead title="ORB-272 - Browser telemetry" ticket="ORB-272" />} hideDock>
    <div className="pp-thread">
      <div className="pp-thread-body">
        <UserNote>Add browser telemetry for checkout errors, behind a flag. Ask me if anything is ambiguous.</UserNote>
        <Capsule time="0:22" calls="2 LLM calls · 3 tool calls" />
        <Card header={<Inline gap={10} align="center"><Avatar size={32} tone="sage" glyph={<Icon name="agent" />} decorative /><Text as="span" variant="label">implementer-agent has 3 questions</Text></Inline>}
          footer={<Inline justify="between" align="center"><Text variant="hand" tone="muted">Retention · Events · Who is recorded</Text><Button variant="blue" onClick={() => setOpen(true)}>Answer</Button></Inline>} />
      </div>
      <Composer label="Write your answer" placeholder="Or write your answer…" workspace="Orbit Billing" branch="feat/ORB-272-telemetry" />
    </div>
    <Dialog open={open} onOpenChange={setOpen} size="lg" title="implementer-agent has 3 questions"
      leading={<Avatar size={40} tone="sage" glyph={<Icon name="agent" />} decorative />}
      eyebrow={<Text as="span" variant="hand" tone="muted">ORB-272 - Browser telemetry</Text>}
      footer={<Inline justify="between" align="center" style={{ inlineSize: '100%' }}>
        <Text as="span" variant="hand" tone="muted">Question 1 of 3</Text>
        <Inline gap={8}><Button>Next question</Button><Button variant="blue" disabled>Submit · 3 left</Button></Inline>
      </Inline>}>
      <Tabs aria-label="Questions" panel="bare" items={[
        { id: 'retention', label: 'Retention', content: <Stack gap={12}>
          <Text measure={false}>Every checkout writes a few rows to browser_events, about 40 MB a day at today's traffic. How long they stay sets both the storage bill and how far back you can look when something breaks.</Text>
          <RadioGroup name="retention" label="How long should browser events be kept?" description="Pick one" columns={3} defaultValue="30" options={options} />
        </Stack> },
        { id: 'events', label: 'Events', content: <Text>Which events should the collector record?</Text> },
        { id: 'who', label: 'Who is recorded', content: <Text>Should signed-out shoppers be recorded?</Text> },
      ]} />
    </Dialog>
  </PrimepawShell>;
}

export const Empty: Story = { name: 'New session', render: () => <NewSession /> };
export const EmptyNight: Story = { name: 'New session (night)', render: () => <NewSession />, ...night };
export const Open: Story = { name: 'Session with artifacts and side chat', render: () => <SessionOpen /> };
export const OpenNight: Story = { name: 'Session with artifacts and side chat (night)', render: () => <SessionOpen />, ...night };
export const WaitingOnApproval: Story = { name: 'Waiting on a permission slip', render: () => <Approval /> };
export const WaitingOnApprovalNight: Story = { name: 'Waiting on a permission slip (night)', render: () => <Approval />, ...night };
export const QuestionSheet: Story = { name: 'Question sheet', render: () => <Question /> };
export const QuestionSheetNight: Story = { name: 'Question sheet (night)', render: () => <Question />, ...night };
