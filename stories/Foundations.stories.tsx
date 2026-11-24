import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ActionableList, ActionableListItem, Box, Stack, Inline, Text, Heading, Surface, ThemeProvider, Button, Badge, Sticker, Link } from '../src';
import tokens from '../src/tokens.json';
const meta = { title: 'Foundations/Materials', component: Surface } satisfies Meta<typeof Surface>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Materials: Story = { render: () => <Stack gap={24}><Heading size="title">Three materials. One desk.</Heading><Text>Cardboard supports. Paper carries words. Stickers mark things.</Text><Inline wrap gap={24}><Surface material="cardboard"><Text variant="label">Cardboard / structure</Text></Surface><Surface><Text>Paper / content</Text></Surface><Sticker shape="pill">Sticker / meaning</Sticker></Inline><Inline gap={24}><Surface elevation={1}><Text>Lift 1</Text></Surface><Surface elevation={2}><Text>Lift 2</Text></Surface><Surface elevation={3}><Text>Lift 3</Text></Surface></Inline></Stack> };
export const Colors: Story = { render: () => <Stack gap={24}><Heading size="title">The palette</Heading><Text>Material colors and text-safe semantic colors. Values follow the toolbar theme.</Text><Box className="demo-swatches">{tokens.color.tokens.map(token => <Box key={token.name}><div className="demo-swatch" style={{ background: `var(--kraft-${token.name})` }} /><Text variant="code">{token.name}</Text></Box>)}</Box></Stack> };
export const Typography: Story = { render: () => <Stack gap={24}><Heading size="title">Words on paper</Heading><Heading size="lg">Fraunces gives headings their character.</Heading><Heading>Section heading</Heading><Heading size="sm">Small heading</Heading><Text>Nunito keeps body copy clear and friendly. Set running text on paper, with a comfortable reading measure.</Text><Text variant="label">A dependable label</Text><Text variant="hand">A little note in the margin.</Text><Text variant="code">npm install @randalvance/kraft-ui</Text></Stack> };
export const Spacing: Story = { render: () => <Stack gap={16}><Heading>Spacing scale</Heading>{tokens.spacing.tokens.map(token => <Inline key={token.name} gap={16}><Text variant="code">{token.name}: {token.value}</Text><Box style={{ height: 16, width: token.value, background: 'var(--kraft-blue)' }} /></Inline>)}</Stack> };
export const ScopedThemes: Story = { render: () => <Stack gap={24}>{(['paper','night'] as const).map(theme => <ThemeProvider key={theme} theme={theme} style={{ padding: 24, borderRadius: 10 }}><Stack gap={16}><Heading>{theme === 'paper' ? 'Paper' : 'Night'}</Heading><Surface><Text>The same desk, under different light.</Text></Surface><Inline gap={16}><Button variant="blue">Continue</Button><Badge tone="sage">Ready</Badge></Inline></Stack></ThemeProvider>)}</Stack> };
export const Quiet: Story = { render: () => <ThemeProvider texture={false} motion={false} tilt={false} style={{ padding: 24 }}><Inline wrap gap={24}><Surface><Text>Texture off. Material hierarchy stays.</Text></Surface><Sticker>Kept</Sticker><Button>Continue</Button></Inline></ThemeProvider> };

export const ReadableInk: Story = { render: () => <Stack gap={24}><Heading size="title">Readable ink on every material</Heading><Text>Links and secondary text adapt to the material beneath them. The base paper and cardboard colors stay the same.</Text><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',gap:24}}>{(['paper','kraft','cardboard'] as const).map(material => <Surface key={material} material={material} padding={24}><Stack gap={16}><Heading>{material}</Heading><Text variant={material === 'cardboard' ? 'label' : 'body'}>A clear note.</Text><Text variant={material === 'cardboard' ? 'label' : 'body'} tone="muted">A secondary note.</Text><Link href="#notes">Read the notes</Link></Stack></Surface>)}</div><Inline wrap gap={24}><Badge tone="sage">Ready</Badge><Sticker shape="pill">A printed mark</Sticker></Inline></Stack> };
/** Accent text in both themes. Use `--kraft-content-danger` for danger text: it follows the material and theme beneath it. `--kraft-red-2` and `--kraft-blue-2` stay readable on paper in Night; `--kraft-blue-deep` carries the deep blue for edges and faces. */
export const AccentInk: Story = {
  render: () => <Stack gap={24}>{(['paper', 'night'] as const).map(theme => <ThemeProvider key={theme} theme={theme} style={{ padding: 24, borderRadius: 10 }} data-testid={theme}>
    <Stack gap={16}>
      <Heading>{theme === 'paper' ? 'Paper' : 'Night'}</Heading>
      <Surface padding={16}><Stack gap={8}>
        <span style={{ color: 'var(--kraft-content-danger)' }}>Semantic danger ink: overdue since Friday</span>
        <span style={{ color: 'var(--kraft-red-2)' }}>Raw red-2 text</span>
        <span style={{ color: 'var(--kraft-blue-2)' }}>Raw blue-2 text</span>
      </Stack></Surface>
      <ActionableList aria-label={`${theme} proofs`}>
        <ActionableListItem current label="Covers" trailing={<span style={{ color: 'var(--kraft-green)' }} role="img" aria-label="Online">●</span>} />
      </ActionableList>
    </Stack>
  </ThemeProvider>)}</Stack>,
  play: async ({ canvasElement }) => {
    const danger = (theme: string) => getComputedStyle(canvasElement.querySelector(`[data-testid="${theme}"] span`)!).color;
    await expect(danger('paper')).not.toBe(danger('night'));
  },
};
