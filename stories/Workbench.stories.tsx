import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Box, Stack, Inline, Heading, Text, Surface, Button, Badge, Sticker, Separator, Link } from '../src';
function Workbench() {
 const [saved, setSaved] = useState(false);
 return <Box className="demo-workbench"><Stack gap={24}>
  <Inline justify="between" wrap gap={24}><Heading as="h1" className="demo-title">Good things,<br />made of paper.</Heading><Sticker shape="round" tone="attention">Kraft</Sticker></Inline>
  <Text className="demo-intro">A small collection of tactile primitives for interfaces with warmth, clarity, and a little room to play.</Text>
  <Inline wrap gap={16}><Badge tone="blue">React primitives</Badge><Text variant="code">@randalvance/kraft-ui</Text></Inline>
 </Stack><div className="demo-materials">
  <Surface as="section" material="cardboard" padding={16}><Stack gap={16}>
   <Inline justify="between" wrap><Text variant="label">THE IDEA BOARD</Text><Text variant="label-sm">3 notes</Text></Inline>
   <Surface as="article" elevation={2}><Stack gap={16}><Inline justify="between" wrap><Heading as="h2" size="lg">Make room for the next idea.</Heading><Badge tone="sage">Ready</Badge></Inline><Text>Start with a sheet. Give each thought a place, and keep the useful things close at hand.</Text><Separator /><Inline gap={16} wrap><Button variant="blue" onClick={() => setSaved(!saved)} aria-pressed={saved}>{saved ? 'Idea kept' : 'Keep this idea'}</Button><Text role="status" variant="hand">{saved ? 'Filed for a rainy day.' : 'One worth keeping.'}</Text></Inline></Stack></Surface>
   <Surface padding={16}><Inline justify="between" wrap><Text>A quiet place for the details.</Text><Badge>Draft</Badge></Inline></Surface>
   <Surface padding={16}><Inline justify="between" wrap><Text>Little marks, clear meaning.</Text><Badge tone="attention">Review</Badge></Inline></Surface>
  </Stack></Surface>
  <Stack gap={24}><Surface as="aside" material="kraft" className="demo-note"><Stack gap={16}><Heading as="h2" size="title">A note on materials</Heading><Text>Cardboard holds things.<br />Paper carries words.<br />Stickers mark things.</Text><Text variant="hand">The same desk after dark, too.</Text></Stack></Surface><Inline wrap gap={16}><Sticker shape="pill" tone="sage">Made to compose</Sticker><Sticker shape="square" tone="blue">Aa</Sticker></Inline><Link href="./?path=/docs/start-here-introduction--docs" target="_top">Open the field guide</Link></Stack>
 </div><Box className="demo-actions"><Text variant="code">Paper / cardboard / stickers — sample content for component exploration</Text></Box></Box>;
}
const meta = { title: 'Compositions/Workbench', component: Workbench, parameters: { controls: { disable: true } } } satisfies Meta<typeof Workbench>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Desk: Story = { play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: 'Keep this idea' })); await expect(canvas.getByRole('button', { name: 'Idea kept' })).toHaveAttribute('aria-pressed','true'); await expect(canvas.getByRole('status')).toHaveTextContent('Filed for a rainy day.'); } };
export const Night: Story = { globals: { theme: 'night' } };
