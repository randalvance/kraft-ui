import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ActionableList, ActionableListItem, Box, Stack, Inline, Text, Heading, Surface, ThemeProvider, Button, Badge, Sticker, Link, Icon, IconButton, type ExtendedTone } from '../src';
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

const sharedTones = ['neutral', 'blue', 'sage', 'danger', 'attention'] as const satisfies readonly ExtendedTone[];
const paletteTones = ['ochre', 'teal', 'violet', 'plum', 'blush', 'navy'] as const satisfies readonly ExtendedTone[];
const tonePieces = (tone: ExtendedTone) => <Inline wrap gap={16}>
  <Button variant={tone}>{tone}</Button>
  <IconButton variant={tone} aria-label={`Pin ${tone}`}><Icon name="pin" /></IconButton>
  <Badge tone={tone}>Badge</Badge>
  <Sticker tone={tone} shape="pill">Sticker</Sticker>
</Inline>;
const toneGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: 24, margin: 0, padding: 0, listStyle: 'none' } as const;
/** The full tone set on the four pieces that take it: `Button`, `IconButton`, `Badge`, and `Sticker`. The five shared tones carry meaning across the library. The six palette tones give a piece its own colour, such as one per workspace, rail tile, or model. Each palette tone has a face, a cut edge, and an on-colour ink in both themes, named like `--kraft-teal-face`, `--kraft-teal-edge`, and `--kraft-on-teal`. Say what a colour means in words as well. */
export const Tones: Story = {
  render: () => <Stack gap={24}>
    <Heading size="title">Eleven tones</Heading>
    <Text>Buttons, icon buttons, badges, and stickers take every tone. Each keeps its ink readable in Paper and Night.</Text>
    <Heading as="h3">Shared tones</Heading>
    <ul aria-label="Shared tones" style={toneGrid}>
      {sharedTones.map(tone => <li key={tone}>{tonePieces(tone)}</li>)}
    </ul>
    <Heading as="h3">Palette tones</Heading>
    <ul aria-label="Palette tones" style={toneGrid}>
      {paletteTones.map(tone => <li key={tone}><Stack gap={12}>
        {tonePieces(tone)}
        <Inline wrap gap={12}>
          {[`${tone}-face`, `${tone}-edge`, `on-${tone}`].map(token => <Inline key={token} gap={6}>
            <span aria-hidden="true" style={{ inlineSize: 16, blockSize: 16, flex: 'none', background: `var(--kraft-${token})`, border: '1px solid var(--kraft-mute)', borderRadius: 3 }} />
            <Text as="span" variant="code">{token}</Text>
          </Inline>)}
        </Inline>
      </Stack></li>)}
    </ul>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tones = [...sharedTones, ...paletteTones];
    const faces = tones.map(tone => getComputedStyle(canvas.getByRole('button', { name: tone })).backgroundColor);
    await expect(new Set(faces).size).toBe(11);
    for (const tone of paletteTones) {
      const row = canvas.getByRole('button', { name: tone }).closest('li')!;
      const face = getComputedStyle(within(row).getByRole('button', { name: tone })).backgroundColor;
      await expect(getComputedStyle(within(row).getByRole('button', { name: `Pin ${tone}` })).backgroundColor).toBe(face);
      await expect(getComputedStyle(within(row).getByText('Badge')).backgroundColor).toBe(face);
      await expect(getComputedStyle(within(row).getByText('Sticker')).backgroundColor).toBe(face);
    }
  },
};
