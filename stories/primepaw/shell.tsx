import type { ReactNode } from 'react';
import {
  AppShell, Avatar, Button, CodeBlock, Gauge, Heading, Icon, IconButton, Inline, Mat, RailTile, Stack, Stamp, Surface,
  Tag, Tape, Text, Textarea, type CardTone,
} from '../../src';
import { PpIcon } from './icons';
import './primepaw.css';

export type RailId =
  | 'home' | 'inbox' | 'sessions' | 'workspaces' | 'memory' | 'knowledge' | 'artifacts' | 'workflows' | 'ideas'
  | 'tasks' | 'kanban' | 'factory' | 'prs' | 'settings';

type RailEntry = { id: RailId; label: string; tone: CardTone; glyph: ReactNode; count?: number };

const railEntries: RailEntry[] = [
  { id: 'inbox', label: 'Action Center', tone: 'ochre', glyph: <Icon name="bolt" />, count: 6 },
  { id: 'sessions', label: 'Sessions', tone: 'navy', glyph: <Icon name="sessions" />, count: 1 },
  { id: 'workspaces', label: 'Workspaces', tone: 'ochre', glyph: <Icon name="workspaces" /> },
  { id: 'memory', label: 'Memory', tone: 'danger', glyph: <Icon name="memory" /> },
  { id: 'knowledge', label: 'Knowledge base', tone: 'plum', glyph: <Icon name="knowledge" /> },
  { id: 'artifacts', label: 'Artifacts', tone: 'navy', glyph: <PpIcon name="clipboard" /> },
  { id: 'workflows', label: 'Workflows', tone: 'teal', glyph: <Icon name="workflows" /> },
  { id: 'ideas', label: 'Idea board', tone: 'attention', glyph: <PpIcon name="bulb" /> },
  { id: 'tasks', label: 'Tasks', tone: 'blush', glyph: <PpIcon name="board" /> },
  { id: 'kanban', label: 'Kanban', tone: 'violet', glyph: <Icon name="kanban" /> },
  { id: 'factory', label: 'Factory', tone: 'sage', glyph: <Icon name="factory" /> },
  { id: 'prs', label: 'Pull requests', tone: 'danger', glyph: <Icon name="pull-requests" />, count: 7 },
];

export type PrimepawShellProps = {
  current: RailId;
  /** The cardboard board beside the sheet (sessions list, threads, file tree…). */
  board?: ReactNode;
  boardLabel?: string;
  sheetHead?: ReactNode;
  sheetLabel?: string;
  /** Hides the Jarvis plinth in the corner. */
  hideDock?: boolean;
  children?: ReactNode;
};

/** The Primepaw app frame: the icon rail, an optional board, and the paper sheet, built on `AppShell`. */
export function PrimepawShell({ current, board, boardLabel, sheetHead, sheetLabel, hideDock, children }: PrimepawShellProps) {
  const rail = <ul className="pp-rail-list">
    <li><RailTile href="#home" tone="neutral" label="Jarvis, home" current={current === 'home'} count={2}><Icon name="mark" /></RailTile></li>
    {railEntries.map(entry => <li key={entry.id}>
      <RailTile href={`#${entry.id}`} tone={entry.tone} label={entry.label} current={current === entry.id} count={entry.count}>{entry.glyph}</RailTile>
    </li>)}
  </ul>;
  const railFooter = <ul className="pp-rail-list">
    <li><RailTile as="button" type="button" tone="ochre" label="Night mode"><PpIcon name="moon" /></RailTile></li>
    <li><RailTile href="#settings" tone="ochre" label="Settings" current={current === 'settings'}><Icon name="settings" /></RailTile></li>
  </ul>;
  const shared = { rail, railFooter, sheetHead, sheetLabel, className: 'pp-app' };
  return <div className="pp-frame">
    {board
      ? <AppShell {...shared} board={board} boardLabel={boardLabel ?? 'Board'}>{children}</AppShell>
      : <AppShell {...shared}>{children}</AppShell>}
    {!hideDock && <JarvisDock />}
  </div>;
}

/**
 * Stand-in for the prototype's Jarvis plinth (the main agent's standee parked in the corner).
 * Missing component: see `CompanionDock` in docs/primepaw-rebuild.md.
 */
export function JarvisDock() {
  return <Surface as="aside" material="kraft" elevation={2} padding={6} className="pp-dock" aria-label="Jarvis">
    <Inline gap={6} align="center">
      <IconButton size="sm" variant="bare" aria-label="Previous pet"><Icon name="chevron-left" /></IconButton>
      <Text as="span" variant="hand" size="md">Jarvis</Text>
      <IconButton size="sm" variant="bare" aria-label="Next pet"><PpIcon name="chevron-right" /></IconButton>
    </Inline>
  </Surface>;
}

/** A page title in the sheet head: handwritten title, a handwritten tally, then actions at the far end. */
export function PageTitle({ title, tally, actions, leading }: { title: ReactNode; tally?: ReactNode; actions?: ReactNode; leading?: ReactNode }) {
  return <Inline justify="between" align="center" gap={16} wrap className="pp-page-title">
    <Inline gap={12} align="end" wrap>
      {leading}
      <Heading as="h1" size="title">{title}</Heading>
      {tally && <Text as="span" variant="hand" tone="muted">{tally}</Text>}
    </Inline>
    {actions && <Inline gap={8} align="center">{actions}</Inline>}
  </Inline>;
}

/** The person's own message: a kraft slip on the right of the thread. Missing component: `ChatMessage`. */
export function UserNote({ children }: { children: ReactNode }) {
  return <div className="pp-user-note">
    <Surface material="kraft" elevation={1} padding={16}><Text measure={false}>{children}</Text></Surface>
  </div>;
}

/** The agent's reply: serif lead text beside the agent's sticker. Missing component: `ChatMessage`. */
export function AgentLine({ children, who = 'Jarvis', italic }: { children: ReactNode; who?: string; italic?: boolean }) {
  return <Inline gap={12} align="start" className="pp-agent-line">
    <Avatar size={32} tone="neutral" glyph={<Icon name="mark" />} alt={who} />
    <Text variant={italic ? 'lead' : 'serif'} measure={false}>{children}</Text>
  </Inline>;
}

export type ComposerProps = {
  placeholder: string;
  label?: string;
  model?: string;
  context?: number;
  yolo?: boolean;
  workspace?: string;
  branch?: string;
  hints?: boolean;
};

/**
 * The composer: a red-matted card with a ruled writing field and a row of session settings.
 * Missing component: `Composer` (plus `ModelChip`, `YoloStamp`). Here it is assembled from Mat, Textarea, Tag,
 * Gauge, Stamp and IconButton; the red mat is approximated with the kraft mat and a class.
 */
export function Composer({ placeholder, label = 'Message', model = 'Sonnet 5.5', context = 31, yolo = false, workspace, branch, hints = true }: ComposerProps) {
  return <Mat tone="kraft" padding={12} className="pp-composer">
    <Stack gap={10}>
      <Textarea variant="ruled" rows={2} aria-label={label} placeholder={placeholder} />
      <Inline justify="between" align="center" gap={12} wrap>
        <Inline gap={10} align="center" wrap>
          <Tag variant="kraft" leading={<Icon name="agent" />}>{model}</Tag>
          <Gauge label="Context window used" value={context} size="sm" />
          <Stamp as="button" size="sm" tone="danger" pressed={yolo}>YOLO</Stamp>
          {workspace && <Tag variant="paper" leading={<Icon name="folder" />}>{workspace}</Tag>}
          {branch && <Tag variant="kraft" leading={<Icon name="branch" />}>{branch}</Tag>}
        </Inline>
        <Inline gap={8} align="center">
          {hints && <Text as="span" variant="hand" tone="muted">↵ send · ⇧↵ newline</Text>}
          <IconButton aria-label="Talk instead"><Icon name="microphone" /></IconButton>
          <IconButton variant="blue" aria-label="Send"><Icon name="send" /></IconButton>
        </Inline>
      </Inline>
    </Stack>
  </Mat>;
}

export type PermissionSlipProps = {
  question: string;
  tool: string;
  command: string;
  children: ReactNode;
  effects: string[];
  footnote?: string;
};

/**
 * A permission slip: a taped amber mat asking to run one command. Missing component: `PermissionSlip`.
 * Assembled from Mat, Tape, CodeBlock, Tag and Buttons.
 */
export function PermissionSlip({ question, tool, command, children, effects, footnote = 'or write what to do instead, below' }: PermissionSlipProps) {
  return <Mat tone="amber" padding={16} className="pp-slip">
    <Tape placement="top" />
    <Stack gap={12}>
      <Inline justify="between" align="center">
        <Heading as="h2" size="title-sm">{question}</Heading>
        <Inline gap={6} align="center"><span className="pp-dot pp-dot-blue" aria-hidden="true" /><Text as="span" variant="label-sm" tone="muted" className="pp-nowrap">{tool}</Text></Inline>
      </Inline>
      <CodeBlock code={`$ ${command}`} language={tool} />
      <Text measure={false}>{children}</Text>
      <Inline gap={8} wrap>{effects.map(effect => <Tag key={effect} variant="paper">{effect}</Tag>)}</Inline>
      <Inline justify="between" align="center" gap={12} wrap className="pp-slip-actions">
        <Inline gap={8} wrap>
          <Button variant="blue">Allow once</Button>
          <Button>Allow for this session</Button>
          <Button>Deny</Button>
        </Inline>
        <Text as="span" variant="hand" tone="muted">{footnote}</Text>
      </Inline>
    </Stack>
  </Mat>;
}

/** Shared night-board variant: every Primepaw screen ships light and dark. */
export const night = { globals: { theme: 'night' } } as const;
