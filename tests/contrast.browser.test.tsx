import { afterEach, describe, expect, it } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { act, cleanup, render } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { Avatar, AvatarGroup, AvatarPicker, Card, CardAddTile, CorkBoard, CorkBoardColumn, CorkBoardItem, Pin, Badge, Blockquote, Button, Code, CodeBlock, DescriptionList, Prose, Icon, iconNames, IconButton, Inline, Mat, Pinwheel, Tape, Stamp, Sticker, StickyNote, Link, Text, Stack, Surface, Table, TableRowAction, Tabs, ThemeProvider, type Theme, type AvatarStatus, type CardTone } from '../src';
import '@fontsource-variable/nunito';
import '@fontsource/caveat/500.css';
import '@fontsource/caveat/600.css';
import '../src/styles.css';
import { SegmentedControl, ToggleChips, type SegmentOption } from '../src';
import { Checkbox, CheckboxGroup, CheckboxStatus, FormSection, PageHeader, Toggle } from '../src';
import { Dialog, Drawer, Menu, ResizablePane } from '../src';
import { ActionableList, ActionableListItem, TreeView } from '../src';
import { Tag } from '../src';
import { StatusDot, StatusSticker, type StatusTone } from '../src';
import { RailTile, type CardTone as RailTone } from '../src';
import { FormField, InlineEdit, Kbd, SearchField, Select, Textarea, TextField } from '../src';
import { RadioGroup } from '../src';

afterEach(cleanup);
const tones = ['neutral', 'blue', 'sage', 'danger', 'attention'] as const;
const materials = ['paper', 'kraft', 'cardboard'] as const;
const statusTones = ['faint', 'danger', 'attention'] as const;
const font = { '--kraft-font-sans': '"Nunito Variable", system-ui, sans-serif' } as CSSProperties;

async function imagePixels(source: string) {
  const img = new Image();
  img.src = source;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(img, 0, 0);
  return context.getImageData(0, 0, img.width, img.height);
}
function pixels(base64: string) { return imagePixels(`data:image/png;base64,${base64}`); }
function channels(color: string) {
  const values = color.match(/[\d.]+/g)!.map(Number);
  return color.startsWith('color(srgb ') ? values.map((value, index) => index < 3 ? value * 255 : value) : values;
}
function luminance(rgb: number[]) {
  return rgb.reduce((sum, channel, i) => {
    const value = channel / 255;
    return sum + [0.2126, 0.7152, 0.0722][i] * (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  }, 0);
}
function contrast(a: number[], b: number[]) {
  const first = luminance(a), second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

// Actual screenshots locate glyphs, then compare their specified foreground with
// the composited background beneath them. Anti-aliased ink is not the foreground.
async function verifyPaintedContrast(matrix: HTMLElement, requiredContrast = 4.5) {
  await document.fonts.load('800 12px "Nunito Variable"');
  await document.fonts.load('400 14px "Nunito Variable"');
  await document.fonts.ready;
  const container = matrix.getBoundingClientRect();
  const samples = [...matrix.querySelectorAll<HTMLElement>('[data-contrast]')].map(el => ({
    el, name: el.dataset.contrast!, style: el.getAttribute('style'),
    rect: el.getBoundingClientRect(),
    foreground: channels(getComputedStyle(el).color).slice(0, 3),
  }));
  const original = await pixels((await page.getByTestId('contrast-matrix').screenshot({ base64: true })).base64);
  expect(original.width, 'Pixel probes require an unscaled browser viewport').toBe(Math.ceil(container.width));
  let background: ImageData;
  try {
    for (const { el } of samples) el.style.setProperty('color', 'transparent', 'important');
    background = await pixels((await page.getByTestId('contrast-matrix').screenshot({ base64: true })).base64);
  } finally {
    for (const { el, style } of samples) style === null ? el.removeAttribute('style') : el.setAttribute('style', style);
  }
  expect(background.width).toBe(original.width);
  expect(background.height).toBe(original.height);
  const failures: string[] = [];
  for (const { name, rect, foreground } of samples) {
    let minimum = Infinity, glyphs = 0;
    for (let y = Math.max(0, Math.floor(rect.top - container.top)); y < Math.min(original.height, Math.ceil(rect.bottom - container.top)); y++) {
      for (let x = Math.max(0, Math.floor(rect.left - container.left)); x < Math.min(original.width, Math.ceil(rect.right - container.left)); x++) {
        const index = (y * original.width + x) * 4;
        const ink = [...original.data.slice(index, index + 3)];
        const ground = [...background.data.slice(index, index + 3)];
        const direction = foreground.map((value, i) => value - ground[i]);
        const norm = direction.reduce((sum, value) => sum + value * value, 0);
        if (norm < 1) continue;
        const alpha = direction.reduce((sum, value, i) => sum + (ink[i] - ground[i]) * value, 0) / norm;
        if (alpha > 0.15 && alpha < 1.1 && Math.max(...ink.map((value, i) => Math.abs(value - ground[i]))) > 10) {
          glyphs++; minimum = Math.min(minimum, contrast(foreground, ground));
        }
      }
    }
    expect(glyphs, `${name}: glyph mask must contain rendered ink`).toBeGreaterThan(0);
    if (minimum < requiredContrast) failures.push(`${name}: ${minimum.toFixed(3)}:1`);
  }
  expect(failures, `Ink must reach ${requiredContrast}:1 on the actual painted material`).toEqual([]);
}

describe.each<Theme>(['paper', 'night'])('%s painted contrast', theme => {
  it.each([true, false])('keeps paper field variants and focus readable with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 490, padding: 24 }}>
      <Stack gap={24}>
        <InlineEdit label="Edit title" defaultValue="Letterpress proof" />
        <FormField label="Proofreader" labelStyle="uppercase" description="Cover and interior">
          <TextField variant="underline" defaultValue="Mina Park" data-contrast="underlined ink" />
        </FormField>
        <FormField label="Edition" error="Check the edition number">
          <TextField variant="underline" defaultValue="Second printing" size="title" data-contrast="handwritten ink" />
        </FormField>
        <FormField label="Margin notes" labelStyle="uppercase">
          <Textarea variant="ruled" mono autoGrow rows={3} defaultValue={'Check page numbers.\nRead the margins.'}
            footer={<span data-contrast="counter">36 characters</span>} data-contrast="ruled mono ink" />
        </FormField>
        <Select label="Status" variant="compact" defaultValue="review" options={[
          { value: 'review', label: 'In review', leading: <Icon name="clock" />, statusDot: 'attention' },
        ]} />
      </Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    matrix.querySelectorAll<HTMLElement>('.kraft-form-field-label, .kraft-form-field-description, .kraft-form-field-error, .kraft-inline-edit-trigger > span, .kraft-select-trigger-value')
      .forEach(sample => { sample.dataset.contrast = sample.textContent!; });
    await verifyPaintedContrast(matrix);

    const desk = channels(getComputedStyle(matrix).backgroundColor);
    const select = view.getByRole('combobox', { name: 'Status' });
    const selectCss = getComputedStyle(select);
    const selectFace = channels(selectCss.backgroundColor);
    const dot = select.querySelector('.kraft-select-status-dot')!;
    expect(contrast(channels(getComputedStyle(dot).borderTopColor), selectFace), 'status dot rim').toBeGreaterThanOrEqual(3);
    for (const [name, control, ground] of [
      ['Proofreader', view.getByRole('textbox', { name: 'Proofreader' }), desk],
      ['Edition', view.getByRole('textbox', { name: 'Edition' }), desk],
      ['Margin notes', view.getByRole('textbox', { name: 'Margin notes' }), desk],
      ['Status', select, desk],
    ] as const) {
      const style = getComputedStyle(control);
      expect(contrast(channels(style.borderBottomColor), ground), `${name}: boundary`).toBeGreaterThanOrEqual(3);
      if (control !== select) {
        const placeholderInk = channels(getComputedStyle(control, '::placeholder').color);
        const fieldFace = style.backgroundColor === 'rgba(0, 0, 0, 0)' ? ground : channels(style.backgroundColor);
        expect(contrast(placeholderInk, fieldFace), `${name}: placeholder`).toBeGreaterThanOrEqual(4.5);
      }
      act(() => control.focus());
      expect(style.outlineStyle, `${name}: focus`).toBe('solid');
      expect(contrast(channels(style.outlineColor), desk), `${name}: focus outline`).toBeGreaterThanOrEqual(3);
    }
    const followingField = view.getByRole('textbox', { name: 'Proofreader' });
    act(() => followingField.focus());
    await userEvent.tab({ shift: true });
    const editor = view.getByRole('textbox', { name: 'Edit title' });
    const editorStyle = getComputedStyle(editor);
    expect(editorStyle.outlineStyle).toBe('solid');
    expect(contrast(channels(editorStyle.outlineColor), desk), 'InlineEdit focus outline').toBeGreaterThanOrEqual(3);
    await userEvent.keyboard('{Escape}');
    const titleStyle = getComputedStyle(view.getByRole('button', { name: /Edit title/ }));
    expect(titleStyle.outlineStyle).toBe('solid');
    expect(contrast(channels(titleStyle.outlineColor), desk), 'restored title focus').toBeGreaterThanOrEqual(3);
    await userEvent.tab();
    expect(document.activeElement).toBe(followingField);
  });

  it.each([true, false])('keeps search slots, keycaps, and focus readable with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 490, padding: 24 }}>
      <Stack gap={24}>
        <SearchField aria-label="Search letters" defaultValue="studio" data-contrast="search ink"
          trailing={<><span data-contrast="search count">12 results</span><Kbd size="sm" keys={['Ctrl', 'K']} /></>} />
        <SearchField aria-label="Filter" placeholder="Filter senders" icon={<svg viewBox="0 0 24 24"><path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" /></svg>} trailing={<Kbd size="sm">/</Kbd>} />
        <Text>Press <Kbd>Esc</Kbd> on the desk.</Text>
        <Surface material="paper" padding={12}><Text>Press <Kbd keys={['Shift', '?']} /> on paper.</Text></Surface>
        <Surface material="kraft" padding={12}><Text>Press <Kbd>Enter</Kbd> on kraft.</Text></Surface>
      </Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    matrix.querySelectorAll<HTMLElement>('kbd.kraft-kbd, .kraft-kbd-join').forEach((key, index) => { key.dataset.contrast = `key ${index} ${key.textContent}`; });
    await verifyPaintedContrast(matrix);

    const desk = channels(getComputedStyle(matrix).backgroundColor);
    for (const name of ['Search letters', 'Filter']) {
      const input = view.getByRole('searchbox', { name });
      const field = input.parentElement!;
      const face = channels(getComputedStyle(field).backgroundColor);
      expect(contrast(channels(getComputedStyle(input, '::placeholder').color), face), `${name}: placeholder`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(channels(getComputedStyle(field.querySelector('.kraft-search-mark')!).color), face), `${name}: mark`).toBeGreaterThanOrEqual(3);
      act(() => input.focus());
      const style = getComputedStyle(field);
      expect(style.outlineStyle, `${name}: focus`).toBe('solid');
      expect(contrast(channels(style.outlineColor), desk), `${name}: focus outline`).toBeGreaterThanOrEqual(3);
    }
    for (const key of matrix.querySelectorAll('kbd.kraft-kbd')) {
      expect(getComputedStyle(key).rotate, 'keycaps stay upright').toBe('none');
    }
  });

  it.each([true, false])('keeps rail tiles, counts, and focus readable with decoration=%s', async decoration => {
    const railTones: RailTone[] = ['neutral', 'blue', 'sage', 'danger', 'attention', 'ochre', 'teal', 'violet', 'plum', 'blush', 'navy'];
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 490, padding: 24 }}>
      <ul data-testid="rail" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: 0, padding: 16, listStyle: 'none', background: 'var(--kraft-rail)' }}>
        {railTones.map((tone, i) => <li key={tone}><RailTile href={`#${tone}`} tone={tone} label={tone} current={i === 0} count={7}>
          <Icon name="inbox" /></RailTile></li>)}
      </ul>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    const counts = matrix.querySelectorAll<HTMLElement>('.kraft-rail-tile-count-label');
    counts.forEach((count, i) => { count.dataset.contrast = `${railTones[i]} count`; });
    await verifyPaintedContrast(matrix);
    counts.forEach(count => count.removeAttribute('data-contrast'));
    const glyphs = matrix.querySelectorAll<SVGElement>('.kraft-rail-tile-glyph svg');
    glyphs.forEach((glyph, i) => glyph.setAttribute('data-contrast', `${railTones[i]} glyph`));
    await verifyPaintedContrast(matrix, 3);
    glyphs.forEach(glyph => glyph.removeAttribute('data-contrast'));

    const rail = channels(getComputedStyle(view.getByTestId('rail')).backgroundColor);
    for (const tile of view.getAllByRole('link')) {
      const style = getComputedStyle(tile);
      const name = tile.getAttribute('href')!.slice(1);
      const boundary = Math.max(contrast(channels(style.backgroundColor), rail), contrast(channels(style.borderTopColor), rail));
      expect(boundary, `${name}: tile boundary against the rail`).toBeGreaterThanOrEqual(3);
      act(() => tile.focus());
      expect(style.outlineStyle, `${name}: focus`).toBe('solid');
      expect(contrast(channels(style.outlineColor), rail), `${name}: focus outline`).toBeGreaterThanOrEqual(3);
    }
  });

  it.each([true, false])('keeps status dots and stickers readable on every material with decoration=%s', async decoration => {
    const statusTones: StatusTone[] = ['working', 'waiting', 'blocked', 'done', 'idle'];
    const grounds = ['desk', 'paper', 'kraft', 'cardboard'] as const;
    const row = (ground: string) => <Stack gap={8}>
      <Inline gap={8}>{(['solid', 'hollow', 'dashed'] as const).flatMap(variant => (['round', 'square'] as const).flatMap(shape =>
        statusTones.map(tone => <StatusDot key={`${variant}-${shape}-${tone}`} tone={tone} variant={variant} shape={shape}
          size={variant === 'solid' ? 8 : 12} label={`${ground} ${tone} ${variant} ${shape}`} />)))}</Inline>
      <Inline gap={8}>{statusTones.map(tone => <StatusDot key={tone} tone={tone}>{tone}</StatusDot>)}</Inline>
      {(['solid', 'paper', 'ghost'] as const).map(variant => <Inline key={variant} gap={8}>
        {statusTones.map(tone => <StatusSticker key={tone} tone={tone} variant={variant}
          indicator={tone === 'working' ? 'spinner' : 'dot'}>{tone}</StatusSticker>)}
        <StatusSticker tone="blocked" variant={variant} size="sm" style={{ fontSize: 8 }}>tiny</StatusSticker>
      </Inline>)}
    </Stack>;
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 760, padding: 24 }}>
      <Stack gap={12}>{grounds.map(ground => ground === 'desk'
        ? <div key={ground}>{row(ground)}</div>
        : <Surface key={ground} material={ground} padding={12}>{row(ground)}</Surface>)}</Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    matrix.querySelectorAll<HTMLElement>('.kraft-status-dot-label, .kraft-status-sticker-label')
      .forEach((label, index) => { label.dataset.contrast = `status text ${index} ${label.textContent}`; });
    await verifyPaintedContrast(matrix);

    matrix.querySelectorAll('[data-contrast]').forEach(sample => sample.removeAttribute('data-contrast'));
    matrix.querySelectorAll<SVGElement>('.kraft-status-dot-mark, .kraft-status-sticker .kraft-pinwheel > svg').forEach((mark, index) => {
      mark.dataset.contrast = `status mark ${index} ${mark.closest('[data-tone]')?.getAttribute('data-tone')}`;
      for (const animation of mark.getAnimations()) { animation.pause(); animation.currentTime = 0; }
    });
    await verifyPaintedContrast(matrix, 3);

    for (const mark of matrix.querySelectorAll('.kraft-status-dot, .kraft-status-sticker')) {
      expect(getComputedStyle(mark).rotate, 'status marks stay upright').toBe('none');
      expect(mark.getAnimations()).toHaveLength(0);
    }
    for (const sticker of matrix.querySelectorAll<HTMLElement>('.kraft-status-sticker[data-variant="paper"], .kraft-status-sticker[data-variant="solid"]')) {
      const edge = channels(getComputedStyle(sticker).borderTopColor);
      expect(edge.length === 3 || edge[3] === 1, 'sticker edge is opaque').toBe(true);
    }
  });

  it.each([true, false])('keeps tag labels, glyphs, and focus readable with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 490, padding: 24 }}>
      <Stack align="start" gap={12}>
        <Inline gap={12}>
          <Tag tilt={-3}>KW-19</Tag>
          <Tag as="a" href="#pull" leading={<Icon name="branch" />}>PR #42</Tag>
          <Tag as="button" onRemove={() => {}} removeLabel="Remove main">main</Tag>
        </Inline>
        <Inline gap={12}>
          <Tag variant="paper" swatch="var(--kraft-teal)" tilt={2}>Print Studio</Tag>
          <Tag variant="paper" as="a" href="#editorial" swatch="var(--kraft-plum)">Editorial</Tag>
          <Tag variant="paper" as="button" onRemove={() => {}} removeLabel="Remove Proofs">Proofs</Tag>
        </Inline>
      </Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    const labels = matrix.querySelectorAll<HTMLElement>('.kraft-tag-label');
    for (const label of labels) label.dataset.contrast = label.textContent!;
    await verifyPaintedContrast(matrix);
    for (const label of labels) label.removeAttribute('data-contrast');

    const closes = [view.getByRole('button', { name: 'Remove main' }), view.getByRole('button', { name: 'Remove Proofs' })];
    const branch = matrix.querySelector('.kraft-tag-leading svg')!;
    branch.setAttribute('data-contrast', 'branch glyph');
    for (const close of closes) close.querySelector('svg')!.dataset.contrast = close.ariaLabel!;
    await verifyPaintedContrast(matrix, 3);
    const kraftClose = page.getByRole('button', { name: 'Remove main' });
    await kraftClose.hover();
    try {
      await Promise.all(closes[0].getAnimations().map(animation => animation.finished));
      await verifyPaintedContrast(matrix, 3);
    } finally {
      await kraftClose.unhover({ position: { x: 1, y: 1 } });
    }

    const desk = channels(getComputedStyle(matrix).backgroundColor);
    for (const action of [...view.getAllByRole('link'), ...view.getAllByRole('button')]) {
      const tag = action.closest('.kraft-tag')!;
      const face = channels(getComputedStyle(tag, '::after').backgroundColor);
      const edge = channels(getComputedStyle(tag, '::before').backgroundColor);
      expect(contrast(edge, desk), `${action.textContent || action.ariaLabel}: tag edge`).toBeGreaterThanOrEqual(3);
      act(() => action.focus());
      const focus = getComputedStyle(action);
      expect(focus.outlineStyle).toBe('solid');
      expect(contrast(channels(focus.outlineColor), desk)).toBeGreaterThanOrEqual(3);
      expect(contrast(channels(focus.outlineColor), face)).toBeGreaterThanOrEqual(3);
    }
  });

  it.each([true, false])('keeps collection row ink and focus readable with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration} motion={decoration} tilt={decoration}
      style={{ ...font, width: 480, padding: 24 }}>
      <Stack gap={8}>
        <ActionableList aria-label="Print queue" density="compact">
          <ActionableListItem label={<><code>KW-12</code> Print proof</>} description={<>Review the <strong>trim</strong></>} trailing="Today"
            href="#proof" current done actionsVisibility="hover"
            actions={<IconButton variant="bare" size="sm" aria-label="Pin print proof"><Icon name="pin" /></IconButton>} />
          <ActionableListItem label="Production notes" description="Draft notes" />
        </ActionableList>
        <TreeView aria-label="Files" branchStyle="plain" density="compact" defaultExpandedIds={['src']} defaultSelectedId="index"
          items={[{ id: 'src', label: <code>src</code>, description: 'Workspace files', children: [
            { id: 'index', label: <code>index.ts</code>, description: 'Review complete', trailing: 'Yesterday', done: true },
          ] }]} />
        <TreeView aria-label="Archive" items={[{ id: 'archive', label: 'Archive', description: 'Earlier proofs', done: true,
          children: [{ id: 'old', label: 'First proof' }] }]} />
      </Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    const samples = matrix.querySelectorAll<HTMLElement>(
      '.kraft-list-label, .kraft-list-description, .kraft-list-trailing, .kraft-tree-label, .kraft-tree-description, .kraft-tree-trailing',
    );
    for (const sample of samples) sample.dataset.contrast = sample.textContent!;
    await verifyPaintedContrast(matrix);
    for (const sample of samples) sample.removeAttribute('data-contrast');

    const branch = view.getByRole('treeitem', { name: /^src\b/ });
    const link = view.getByRole('link', { name: /^KW-12\b/ });
    const action = view.getByRole('button', { name: 'Pin print proof' });
    const slot = action.parentElement!;
    expect(getComputedStyle(slot).opacity).toBe('0');
    await page.getByRole('link', { name: /^KW-12\b/ }).hover();
    expect(getComputedStyle(slot).opacity).toBe('1');
    await page.getByRole('treeitem', { name: /^src\b/ }).hover();
    expect(getComputedStyle(slot).opacity).toBe('0');
    const linkGround = channels(getComputedStyle(link.closest('li')!).backgroundColor);
    const deskGround = channels(getComputedStyle(matrix).backgroundColor);
    for (const [target, outline, ground] of [[link, link, linkGround], [branch, branch.firstElementChild!, deskGround]] as const) {
      act(() => target.focus());
      const css = getComputedStyle(outline);
      expect(css.outlineStyle).toBe('solid');
      expect(contrast(channels(css.outlineColor), ground)).toBeGreaterThanOrEqual(3);
    }

    const chevron = branch.querySelector('svg')!;
    if (!decoration) expect(getComputedStyle(chevron).transitionDuration).toBe('0s');
    chevron.dataset.contrast = 'plain branch chevron';
    act(() => link.focus());
    action.querySelector('svg')!.dataset.contrast = 'hover action glyph';
    await verifyPaintedContrast(matrix, 3);
  });

  it.each([true, false])('keeps dialog and drawer headers and divider readable with decoration=%s', async decoration => {
    const themeProps = { theme, texture: decoration, motion: decoration, tilt: decoration, style: font };
    const header = {
      title: <span data-contrast="title">Print proof</span>,
      eyebrow: <Stamp size="sm" tone="blue" data-contrast="stamp">Draft</Stamp>,
      description: <p data-contrast="description">Review the <strong>trim and margins</strong> before sending the proof to print.</p>,
      actions: <Button size="sm" variant="text"><span data-contrast="action">Pin</span></Button>,
    };
    const view = render(<ThemeProvider {...themeProps}>
      <ResizablePane style={{ width: 800, height: 240 }} main={<Text>Session notes</Text>}
        pane={<Drawer {...header} data-testid="contrast-matrix" onClose={() => {}} />} />
    </ThemeProvider>);
    const separator = view.getByRole('separator');
    const desk = channels(getComputedStyle(separator.closest('.kraft-root')!).backgroundColor);
    expect(contrast(channels(getComputedStyle(separator, '::before').borderInlineStartColor), desk), 'divider line').toBeGreaterThanOrEqual(3);
    act(() => separator.focus());
    const focus = getComputedStyle(separator);
    expect(focus.outlineStyle).toBe('solid');
    expect(contrast(channels(focus.outlineColor), desk), 'divider focus').toBeGreaterThanOrEqual(3);

    async function verifyHeader(close: HTMLElement) {
      const matrix = view.getByTestId('contrast-matrix');
      await verifyPaintedContrast(matrix);
      matrix.querySelectorAll('[data-contrast]').forEach(sample => sample.removeAttribute('data-contrast'));
      close.querySelector('svg')!.setAttribute('data-contrast', 'close glyph');
      await verifyPaintedContrast(matrix, 3);
      act(() => close.focus());
      const css = getComputedStyle(close);
      expect(css.outlineStyle).toBe('solid');
      expect(contrast(channels(css.outlineColor), channels(getComputedStyle(matrix).backgroundColor)), 'close focus').toBeGreaterThanOrEqual(3);
    }

    await verifyHeader(view.getByRole('button', { name: 'Close panel' }));
    view.rerender(<ThemeProvider {...themeProps}>
      <Dialog {...header} data-testid="contrast-matrix" open onOpenChange={() => {}} />
    </ThemeProvider>);
    await verifyHeader(view.getByRole('button', { name: 'Close dialog' }));
  });

  it.each([true, false])('keeps button labels, glyphs, badges, and indicators readable with decoration=%s', async decoration => {
    const variants = [...tones, 'ghost', 'text', 'dashed', 'danger-text'] as const;
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 980, padding: 24 }}>
      <Stack gap={24}>
        {[false, true].map(pressed => <Inline key={String(pressed)} gap={16} wrap>
          {variants.map(variant => <Button key={variant} variant={variant === 'danger-text' ? 'text' : variant}
            tone={variant === 'danger-text' ? 'danger' : undefined} aria-pressed={pressed}>
            <span data-contrast={`${variant}-${pressed}`}>{variant}</span>
          </Button>)}
        </Inline>)}
        <Inline gap={24}>
          {([...tones, 'bare'] as const).flatMap(variant => [false, true].map(pressed =>
            <IconButton key={`${variant}-${pressed}`} variant={variant} size="sm" aria-label={`${variant} inbox`}
              aria-pressed={pressed} badge={<Sticker size="count" data-contrast={`${variant}-badge-${pressed}`}>12</Sticker>}>
              <Icon name="inbox" data-glyph={`${variant}-glyph-${pressed}`} />
            </IconButton>))}
        </Inline>
        <Inline gap={16}>
          {materials.map(material => <Surface key={material} material={material} padding={12}>
            <Button variant="text" tone="danger" leading={<Icon name="trash" data-glyph={`${material}-danger-icon`} />}>
              <span data-contrast={`${material}-danger-label`}>Remove board</span>
            </Button>
          </Surface>)}
        </Inline>
      </Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    await verifyPaintedContrast(matrix);
    matrix.querySelectorAll('[data-contrast]').forEach(sample => sample.removeAttribute('data-contrast'));
    matrix.querySelectorAll('[data-glyph]').forEach(glyph => glyph.setAttribute('data-contrast', glyph.getAttribute('data-glyph')!));
    await verifyPaintedContrast(matrix, 3);
    for (const button of view.getAllByRole('button')) {
      const ground = channels(getComputedStyle(button.closest('.kraft-surface') ?? matrix).backgroundColor);
      const name = button.ariaLabel ?? button.textContent;
      const css = getComputedStyle(button);
      if (button.matches('[data-variant="ghost"], [data-variant="dashed"]')) {
        expect(contrast(channels(css.borderTopColor), ground), `${name}: boundary`).toBeGreaterThanOrEqual(3);
      }
      if (button.getAttribute('aria-pressed') === 'true') {
        expect(css.boxShadow).toContain('inset');
        expect(contrast(channels(css.color), channels(css.backgroundColor)), `${name}: pressed ring`).toBeGreaterThanOrEqual(3);
      }
      act(() => button.focus());
      expect(css.outlineStyle).toBe('solid');
      expect(contrast(channels(css.outlineColor), ground), `${name}: keyboard focus`).toBeGreaterThanOrEqual(3);
    }
  });

  it.each([true, false])('keeps card copy, spines, selection and focus readable with decoration=%s', async decoration => {
    const cardTones = [...tones, 'ochre', 'teal', 'violet', 'plum', 'blush', 'navy'] satisfies CardTone[];
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 1050, padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 16 }}>
        {[false, true].flatMap(off => cardTones.map(tone => {
          const name = `${tone}-${off ? 'off' : 'on'}`;
          return <Card key={name} as="button" aria-label={name} tone={tone} off={off} selected={tone === 'teal'}
            header={<span data-contrast={`${name}-header`}>Print studio</span>}
            footer={<span data-contrast={`${name}-footer`}>Two boards</span>}>
            <span data-contrast={`${name}-body`}>Prepare proofs.</span>
          </Card>;
        }))}
        <CardAddTile label="Add workspace" />
      </div>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    const tile = view.getByRole('button', { name: 'Add workspace' });
    tile.querySelector('span')!.dataset.contrast = 'add-label';
    await verifyPaintedContrast(matrix);
    const desk = channels(getComputedStyle(matrix).backgroundColor);
    const tileStyle = getComputedStyle(tile);
    expect(contrast(channels(tileStyle.borderTopColor), desk), 'add tile boundary').toBeGreaterThanOrEqual(3);
    act(() => tile.focus());
    expect(tileStyle.outlineStyle).toBe('solid');
    expect(contrast(channels(tileStyle.outlineColor), desk), 'add tile focus').toBeGreaterThanOrEqual(3);

    for (const target of matrix.querySelectorAll<HTMLButtonElement>('.kraft-card-target')) {
      const frame = target.closest('article')!;
      const name = target.ariaLabel;
      const cardStyle = getComputedStyle(frame);
      const face = channels(cardStyle.backgroundColor);
      expect(contrast(channels(cardStyle.borderTopColor), desk), `${name}: card boundary`).toBeGreaterThanOrEqual(3);
      const spine = channels(getComputedStyle(frame, '::before').backgroundColor);
      expect(contrast(spine, face), `${name}: spine`).toBeGreaterThanOrEqual(3);
      act(() => target.focus());
      const outline = getComputedStyle(target);
      expect(outline.outlineStyle, `${name}: focus outline`).toBe('solid');
      expect(contrast(channels(outline.outlineColor), desk), `${name}: focus on desk`).toBeGreaterThanOrEqual(3);
      if (target.getAttribute('aria-pressed') === 'true') {
        expect(contrast(channels(cardStyle.borderTopColor), face), `${name}: selected edge`).toBeGreaterThanOrEqual(3);
        const mark = getComputedStyle(frame.querySelector('.kraft-card-corner svg')!);
        expect(contrast(channels(mark.color), face), `${name}: selected mark`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it.each([true, false])('keeps small stamp text, outlines and focus readable with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ width: 720, padding: 24 }}>
      <Surface data-testid="stamp-paper">
        <Stack gap={16}>
          {tones.map(tone => <Inline key={tone} gap={24} wrap>
            <Stamp size="sm" tone={tone} signature="Mara">Done</Stamp>
            <Stamp as="button" size="sm" tone={tone} pressed signature="Mara">Done</Stamp>
            <Stamp as="button" size="sm" tone={tone} signature="Mara">Done</Stamp>
          </Inline>)}
        </Stack>
      </Surface>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    matrix.querySelectorAll<HTMLElement>('.kraft-stamp-cell').forEach((cell, index) => {
      const stamp = cell.closest<HTMLElement>('.kraft-stamp')!;
      cell.dataset.contrast = `${stamp.dataset.tone}/${stamp.getAttribute('aria-pressed') ?? 'static'}/${index}`;
    });
    await verifyPaintedContrast(matrix);
    const paper = channels(getComputedStyle(view.getByTestId('stamp-paper')).backgroundColor).slice(0, 3);
    for (const button of view.getAllByRole('button')) {
      const box = button.getBoundingClientRect();
      expect(box.width).toBeGreaterThanOrEqual(24);
      expect(box.height).toBeGreaterThanOrEqual(24);
      const [r, g, b, alpha = 1] = channels(getComputedStyle(button.firstElementChild!).borderTopColor);
      const outline = [r, g, b].map((value, index) => value * alpha + paper[index] * (1 - alpha));
      expect(contrast(outline, paper)).toBeGreaterThanOrEqual(3);
      act(() => button.focus());
      const focus = getComputedStyle(button);
      expect(focus.outlineStyle).toBe('solid');
      expect(contrast(channels(focus.outlineColor).slice(0, 3), paper)).toBeGreaterThanOrEqual(3);
      expect(focus.rotate).toBe('none');
    }
  });

  it.each([true, false])('keeps edit-page headings, hints, save states, and focus readable with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 620, padding: 24 }}>
      <Stack gap={16}>
        <PageHeader title="Edit profile"
          back={<Link href="#profiles" data-contrast="back">All profiles</Link>}
          leading={<Avatar decorative initial="M" size={48} tilt={-4} />}
          status={<span data-contrast="clean">All saved</span>}
          actions={<Button variant="blue" data-contrast="save-action">Save changes</Button>} />
        <PageHeader title="Edit adoption listing" titleAs="h2" status={<span data-contrast="dirty">Unsaved changes</span>} />
        <PageHeader title="Edit shelter contact" titleAs="h2" status={<span data-contrast="saved">Saved</span>} />
        <FormSection title="Notifications" hint="For the shelter team">
          <Inline align="center" justify="between" wrap gap={16}>
            <Stack gap={4}>
              <Text id="inquiries-name" variant="label" data-contrast="setting">Adoption inquiries</Text>
              <Text id="inquiries-note" tone="muted" data-contrast="setting-note">Receive messages about this profile.</Text>
            </Stack>
            <Inline gap={8}>
              <Text as="span" variant="label-sm" tone="muted" data-contrast="setting-meta">Email</Text>
              <Toggle aria-labelledby="inquiries-name" aria-describedby="inquiries-note" defaultChecked />
            </Inline>
          </Inline>
        </FormSection>
      </Stack>
    </ThemeProvider>);

    for (const heading of view.getAllByRole('heading')) heading.dataset.contrast = heading.textContent!;
    view.getByText('For the shelter team').dataset.contrast = 'hint';
    await verifyPaintedContrast(view.getByTestId('contrast-matrix'));

    for (const control of [view.getByRole('link'), view.getByRole('button'), view.getByRole('switch')]) {
      act(() => control.focus());
      const visible = control.getAttribute('role') === 'switch' ? control.nextElementSibling! : control;
      const css = getComputedStyle(visible);
      const surface = getComputedStyle(control.closest('header, section')!);
      expect(visible.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
      expect(css.outlineStyle).toBe('solid');
      expect(contrast(channels(css.outlineColor), channels(surface.backgroundColor))).toBeGreaterThanOrEqual(3);
    }
  });

  it.each([true, false])('keeps checkbox labels, status marks, and focus readable with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 520, padding: 24 }}>
      <Surface padding={16}>
        <Stack gap={12}>
          <CheckboxGroup label="Print jobs" columns={2} tally="2 of 4">
            <Checkbox defaultChecked trailing="Today">Covers</Checkbox>
            <Checkbox variant="pen" defaultChecked strikeWhenChecked description="Finished proof">Inserts</Checkbox>
            <Checkbox variant="pen" indeterminate>Booklets</Checkbox>
            <Checkbox>Labels</Checkbox>
          </CheckboxGroup>
          <Inline gap={12}>
            <CheckboxStatus label="Covers approved" checked />
            <CheckboxStatus label="Some booklets approved" variant="pen" indeterminate />
          </Inline>
        </Stack>
      </Surface>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    const text = matrix.querySelectorAll<HTMLElement>(
      '.kraft-checkbox-group-legend [id], .kraft-choice-label, .kraft-choice-description, .kraft-checkbox-trailing',
    );
    text.forEach((sample, index) => { sample.dataset.contrast = `checkbox-text-${index}`; });
    await verifyPaintedContrast(matrix);
    text.forEach(sample => { delete sample.dataset.contrast; });

    const marks = matrix.querySelectorAll<SVGElement>([
      '.kraft-choice-input:checked + .kraft-checkbox-box .kraft-checkbox-check',
      '.kraft-choice-input:indeterminate + .kraft-checkbox-box .kraft-checkbox-mixed',
      '.kraft-checkbox-status[data-state="checked"] .kraft-checkbox-check',
      '.kraft-checkbox-status[data-state="mixed"] .kraft-checkbox-mixed',
    ].join(', '));
    expect(marks).toHaveLength(5);
    marks.forEach((mark, index) => { mark.dataset.contrast = `checkbox-mark-${index}`; });
    await verifyPaintedContrast(matrix, 3);

    const paper = channels(getComputedStyle(matrix.querySelector('.kraft-surface')!).backgroundColor);
    for (const input of view.getAllByRole('checkbox')) {
      const row = input.closest('label')!;
      const mark = input.nextElementSibling!;
      act(() => input.focus());
      const css = getComputedStyle(mark);
      expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
      expect(row.getBoundingClientRect().width).toBeGreaterThanOrEqual(24);
      expect(css.outlineStyle).toBe('solid');
      expect(contrast(channels(css.outlineColor), paper)).toBeGreaterThanOrEqual(3);
    }
    const pen = view.getByRole('checkbox', { name: 'Inserts' }).nextElementSibling!.querySelector('.kraft-checkbox-check')!;
    expect(getComputedStyle(pen).rotate).toBe(decoration ? '-5deg' : '0deg');
    if (!decoration) expect(getComputedStyle(pen).transitionDuration).toBe('0s, 0s');

    const group = view.getByRole('group', { name: 'Print jobs' });
    const items = group.querySelectorAll('.kraft-checkbox-group-item');
    const rule = channels(getComputedStyle(items[2], '::before').borderBlockStartColor);
    const screenshot = await pixels((await page.getByRole('group', { name: 'Print jobs' }).screenshot({ base64: true })).base64);
    const groupTop = group.getBoundingClientRect().top;
    const countRulePixels = (y: number) => {
      let count = 0;
      for (let x = 60; x < 100; x++) {
        const offset = (y * screenshot.width + x) * 4;
        if (rule.slice(0, 3).every((channel, i) => screenshot.data[offset + i] === channel)) count++;
      }
      return count;
    };
    const ruleRow = Math.round(items[2].getBoundingClientRect().top - groupTop) - 1;
    const dashes = countRulePixels(ruleRow);
    expect(dashes).toBeGreaterThan(0);
    expect(dashes).toBeLessThan(40);
    expect(countRulePixels(Math.round(items[0].getBoundingClientRect().top - groupTop))).toBe(0);
  });

  it.each([true, false])('keeps segment labels, counts, selection marks, and focus readable with decoration=%s', async decoration => {
    const options: SegmentOption[] = [
      { value: 'all', label: 'All', description: 'Every item', count: 12 },
      { value: 'on', label: 'On', description: 'Running now', count: 8 },
      { value: 'off', label: 'Off', count: 0, disabled: true },
    ];
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 620, padding: 24 }}>
      <Stack gap={16}>
        {(['highlighter', 'ink'] as const).map(tone => <Inline key={tone} gap={16}>
          <SegmentedControl label="Show" name={`show-${tone}`} options={options} defaultValue="all" tone={tone} />
          <ToggleChips label="Tools" name={`tools-${tone}`} options={options} defaultValue={['on', 'off']} tone={tone} />
        </Inline>)}
        <Inline gap={16}>{tones.map(tone => <Sticker key={tone} tone={tone} size="count" data-contrast={`sticker-${tone}`}>12</Sticker>)}</Inline>
      </Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    matrix.querySelectorAll<HTMLElement>('.kraft-segment-label, .kraft-segment-description, .kraft-segment .kraft-badge')
      .forEach((sample, index) => { sample.dataset.contrast = `segment-ink-${index}`; });
    await verifyPaintedContrast(matrix);
    for (const input of [...view.getAllByRole('radio'), ...view.getAllByRole('checkbox')]) {
      const target = input.closest('label')!;
      const mark = target.querySelector('.kraft-segment-mark')!;
      const css = getComputedStyle(target);
      const face = channels(css.backgroundColor);
      expect(target.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      expect(target.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
      if ((input as HTMLInputElement).checked) {
        expect(getComputedStyle(mark).visibility).toBe('visible');
        expect(contrast(channels(getComputedStyle(mark).color), face)).toBeGreaterThanOrEqual(3);
      }
      if (!(input as HTMLInputElement).disabled) {
        act(() => input.focus());
        expect(css.outlineStyle).toBe('solid');
        expect(contrast(channels(css.outlineColor), face)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it.each([true, false])('keeps radio rows, cards, swatches, pictures, selection, and focus readable with decoration=%s', async decoration => {
    const rows = [
      { value: 'a', label: 'Pup', description: 'One pet', trailing: <Text as="span" variant="hand" size="md">our pick</Text> },
      { value: 'b', label: 'Pack', description: 'Four pets', trailing: 'Medium' },
      { value: 'c', label: 'Retired', description: 'No longer sold', disabled: true },
    ];
    const swatches = ['ochre', 'teal', 'violet', 'plum', 'blush'].map((tone, index) => ({
      value: tone, label: tone, swatch: `var(--kraft-${tone})`, disabled: index === 4,
    }));
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 760, padding: 24 }}>
      <Surface padding={16}>
        <Stack gap={16}>
          <RadioGroup label="Plan" name="plan" options={rows} defaultValue="a" description="Pick one" />
          <RadioGroup label="Cards" name="cards" options={rows} defaultValue="b" columns={3} />
          <RadioGroup label="Sort" name="sort" variant="flat" options={rows} defaultValue="a" />
          <RadioGroup label="Colour" name="colour" variant="swatch" options={swatches} defaultValue="teal" />
          <RadioGroup label="Portrait" name="portrait" variant="picture" defaultValue="pip" options={[
            { value: 'pip', label: 'Pip', picture: <Avatar initial="P" size={28} decorative /> },
            { value: 'kit', label: 'Kit', picture: <Avatar initial="K" size={28} tone="sage" tilt={-4} decorative /> },
          ]} />
        </Stack>
      </Surface>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    const text = matrix.querySelectorAll<HTMLElement>(
      '.kraft-radio-group-label, .kraft-radio-group-description, .kraft-radio-option:has(input:enabled) :is(.kraft-radio-label, .kraft-radio-description, .kraft-radio-trailing > *, .kraft-radio-trailing:not(:has(*)))',
    );
    text.forEach((sample, index) => { sample.dataset.contrast = `radio-text-${index}`; });
    await verifyPaintedContrast(matrix);
    text.forEach(sample => { delete sample.dataset.contrast; });

    const paper = channels(getComputedStyle(matrix.querySelector('.kraft-surface')!).backgroundColor);
    for (const input of view.getAllByRole('radio') as HTMLInputElement[]) {
      const target = input.closest('label')!;
      const name = input.getAttribute('aria-label') ?? input.value;
      const rect = target.getBoundingClientRect();
      const visual = target.closest('[data-variant="swatch"], [data-variant="picture"]');
      expect(rect.width, `${name}: target width`).toBeGreaterThanOrEqual(visual ? 44 : 24);
      expect(rect.height, `${name}: target height`).toBeGreaterThanOrEqual(visual ? 44 : 24);
      if (visual && input.checked) {
        const ring = channels(getComputedStyle(target.querySelector('.kraft-radio-swatch, .kraft-radio-picture')!).boxShadow.match(/(?:rgba?|oklab|color)\([^)]+\)/g)!.at(-1)!);
        expect(contrast(ring, paper), `${name}: selection ring`).toBeGreaterThanOrEqual(3);
      }
      if (!visual && input.checked) {
        const dot = channels(getComputedStyle(target.querySelector('.kraft-radio-mark')!, '::after').backgroundColor);
        expect(contrast(dot, channels(getComputedStyle(target).backgroundColor)), `${name}: selection dot`).toBeGreaterThanOrEqual(3);
      }
      if (input.disabled) continue;
      act(() => input.focus());
      const css = getComputedStyle(target);
      expect(css.outlineStyle, `${name}: focus outline`).toBe('solid');
      expect(contrast(channels(css.outlineColor), paper), `${name}: focus contrast`).toBeGreaterThanOrEqual(3);
    }
    const tilted = matrix.querySelectorAll('.kraft-radio-picture .kraft-avatar')[1];
    expect(getComputedStyle(tilted).rotate).toBe(decoration ? '-4deg' : '0deg');
    const swatch = matrix.querySelector('.kraft-radio-swatch')!;
    expect(getComputedStyle(swatch).transitionDuration).toBe(decoration ? '0.15s' : '0s');
  });

  it.each([true, false])('keeps cork board headers, pins, and focus rings readable with decoration=%s', async decoration => {
    const pinTones = ['red', 'blue', 'green', 'amber'] as const;
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 920, padding: 24 }}>
      <CorkBoard layout="columns" style={{ '--kraft-cork-board-column-width': '11rem' } as CSSProperties}>
        {pinTones.map(tone => <CorkBoardColumn key={tone} pinTone={tone} count={12}
          name={<span data-contrast={`${tone}-column-name`}>Waiting for review</span>}>
          <CorkBoardItem label={`${tone} note`} onMove={() => {}} pin={<Pin as="button" tone={tone} label={`Unpin ${tone}`} />}>
            <StickyNote>Check the paper samples.</StickyNote>
          </CorkBoardItem>
        </CorkBoardColumn>)}
      </CorkBoard>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    matrix.querySelectorAll<HTMLElement>('.kraft-cork-board-column-count')
      .forEach((count, index) => { count.dataset.contrast = `${pinTones[index]}-column-count`; });
    await verifyPaintedContrast(matrix);

    const body = matrix.querySelector<HTMLElement>('.kraft-cork-board-body')!;
    const cork = channels(getComputedStyle(body).backgroundColor).slice(0, 3);
    const note = channels(getComputedStyle(matrix.querySelector('.kraft-sticky-note')!).backgroundColor).slice(0, 3);
    body.tabIndex = 0;
    act(() => body.focus());
    expect(getComputedStyle(body).outlineStyle, 'board focus outline').toBe('solid');
    expect(contrast(channels(getComputedStyle(body).outlineColor), cork), 'board focus contrast').toBeGreaterThanOrEqual(3);
    for (const item of view.getAllByRole('group')) {
      act(() => item.focus());
      const css = getComputedStyle(item);
      expect(css.outlineStyle, `${item.ariaLabel}: focus outline`).toBe('solid');
      expect(contrast(channels(css.outlineColor), cork), `${item.ariaLabel}: focus contrast`).toBeGreaterThanOrEqual(3);
    }
    for (const pin of view.getAllByRole('button')) {
      act(() => pin.focus());
      const rim = channels(getComputedStyle(pin.firstElementChild!).borderTopColor);
      const ring = channels(getComputedStyle(pin).outlineColor);
      expect(getComputedStyle(pin).outlineStyle, `${pin.ariaLabel}: focus outline`).toBe('solid');
      for (const [ground, face] of [['cork', cork], ['note', note]] as const) {
        expect(contrast(rim, face), `${pin.ariaLabel}: rim on ${ground}`).toBeGreaterThanOrEqual(3);
        expect(contrast(ring, face), `${pin.ariaLabel}: focus ring on ${ground}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it.each([true, false])('keeps avatar ink, corner marks, selection, and focus readable with decoration=%s', async decoration => {
    const statuses: AvatarStatus[] = ['working', 'waiting', 'blocked', 'done', 'idle'].map(tone => ({
      tone: tone as AvatarStatus['tone'], label: tone,
    }));
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 760, padding: 24 }}>
      <Stack gap={24}>
        {[18, 36, 84].map(size => <Inline key={size} gap={24}>
          {tones.map((tone, index) => <Avatar key={tone} initial="M" alt={`${tone}-${size}`} tone={tone}
            size={size} tilt={-4} status={statuses[index]} />)}
        </Inline>)}
        <Inline gap={24}>{tones.map(tone => <Avatar key={tone} glyph={<Icon name="agent" />}
          alt={`${tone} helper`} tone={tone} size={36} />)}</Inline>
        <AvatarGroup label="Team" max={1} avatars={[
          { initial: 'P', alt: 'Pip' }, { initial: 'K', alt: 'Kit' }, { initial: 'M', alt: 'Mochi' },
        ]} />
        <AvatarPicker label="Choose a helper" name="helper" size={18} description="One helper per desk"
          defaultValue="pip" options={[{ value: 'pip', label: 'Pip', initial: 'P' }, { value: 'kit', label: 'Kit', initial: 'K', disabled: true }]} />
      </Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    matrix.querySelectorAll<HTMLElement>('.kraft-avatar-initial, .kraft-avatar-glyph, .kraft-avatar-more, .kraft-avatar-picker-label, .kraft-avatar-picker-description')
      .forEach((el, index) => { el.dataset.contrast = `avatar-ink-${index}`; });
    await verifyPaintedContrast(matrix);
    for (const dot of matrix.querySelectorAll('.kraft-avatar-status')) {
      const css = getComputedStyle(dot);
      expect(contrast(channels(css.borderTopColor), [255, 255, 255]), `status ${dot.getAttribute('data-tone')}`).toBeGreaterThanOrEqual(3);
      expect(dot.getBoundingClientRect().width).toBeGreaterThanOrEqual(8);
    }
    const radio = view.getByRole('radio', { name: 'Pip' });
    act(() => radio.focus());
    const target = radio.closest('label')!;
    const focus = getComputedStyle(target);
    expect(focus.outlineStyle).toBe('solid');
    expect(contrast(channels(focus.outlineColor), channels(getComputedStyle(matrix).backgroundColor))).toBeGreaterThanOrEqual(3);
    expect(target.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    expect(target.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    const selected = target.querySelector('.kraft-avatar')!;
    const ring = getComputedStyle(selected).boxShadow.match(/rgba?\([^)]+\)/)![0];
    expect(contrast(channels(ring), [255, 255, 255])).toBeGreaterThanOrEqual(3);
    const portrait = matrix.querySelector('.kraft-avatar')!;
    expect(getComputedStyle(portrait).rotate).toBe(decoration ? '-4deg' : '0deg');
    expect(getComputedStyle(portrait.querySelector('.kraft-avatar-face')!).backgroundImage.includes('url(')).toBe(decoration);
    expect(portrait.getAnimations()).toHaveLength(0);
  });

  it.each([true, false])('keeps every sticky note tone and state readable with decoration=%s', async decoration => {
    const noteTones = ['attention', 'blush', 'blue', 'sage', 'ochre'] as const;
    const statuses = [undefined, 'waiting', 'done'] as const;
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 920, padding: 24 }}>
      <Surface material="cardboard" padding={16}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16 }}>
          {statuses.flatMap(status => noteTones.map((tone, index) => {
            const name = `${tone}-${status ?? 'open'}`;
            return <StickyNote key={name} as="button" aria-label={name} tone={tone} status={status}
              selected={status === 'waiting'} tilt={index - 2}
              header={<span data-contrast={`${name}-header`}>Print proof</span>}
              footer={<span data-contrast={`${name}-footer`}>Tuesday</span>}>
              Check the paper samples.
            </StickyNote>;
          }))}
        </div>
      </Surface>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    for (const button of view.getAllByRole('button')) {
      const name = button.getAttribute('aria-label');
      // The body owns the strike-through, so hiding its ink removes both text and strike.
      button.querySelector<HTMLElement>('.kraft-sticky-note-body')!.dataset.contrast = `${name}-body`;
      const status = button.querySelector<HTMLElement>('.kraft-sticky-note-status');
      if (status) status.dataset.contrast = `${name}-status`;
    }
    await verifyPaintedContrast(matrix);
    for (const button of view.getAllByRole('button')) {
      act(() => button.focus());
      const css = getComputedStyle(button);
      const ink = channels(css.outlineColor);
      const face = channels(css.backgroundColor).slice(0, 3);
      const name = button.getAttribute('aria-label');
      expect(css.outlineStyle, `${name}: focus outline`).toBe('solid');
      expect(contrast(ink, face), `${name}: focus contrast`).toBeGreaterThanOrEqual(3);
      if (button.getAttribute('aria-pressed') === 'true') {
        expect(contrast(channels(css.borderTopColor), face), `${name}: selected edge`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it.each([true, false])('keeps prose, code, quotes, and ticked todos readable with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration} motion={decoration} tilt={decoration} style={{ ...font, width: 640, padding: 24 }}>
      <Surface padding={24}>
        <Prose>
          <h2 data-contrast="heading">Release notes</h2>
          <p><span data-contrast="body">Run</span> <Code data-contrast="inline-code">npm run check</Code> <span>and read the</span> <a href="#guide" data-contrast="link">guide</a>.</p>
          <p>Bare <code data-contrast="bare-code">code</code> too.</p>
          <ul>
            <li><span data-contrast="list">Pinned notes stay on top.</span></li>
            <li><label><input type="checkbox" defaultChecked /> <span data-contrast="todo-done">Write the changeset</span></label></li>
            <li><label><input type="checkbox" /> <span data-contrast="todo-open">Publish</span></label></li>
          </ul>
          <table>
            <thead><tr><th data-contrast="table-head">Theme</th></tr></thead>
            <tbody><tr><td data-contrast="table-cell">Paper</td></tr></tbody>
          </table>
          <Blockquote><p data-contrast="quote">Paper carries words.</p></Blockquote>
          <blockquote><p data-contrast="bare-quote">Stickers mark things.</p></blockquote>
          <pre><code data-contrast="bare-pre">npm test</code></pre>
          <CodeBlock language="tsx" lineNumbers copyable added={[2]} removed={[3]} code={'const a = 1;\nconst b = 2;\nconst c = 3;'} />
        </Prose>
      </Surface>
    </ThemeProvider>);
    const block = view.container.querySelector('.kraft-code-block')!;
    block.querySelector('.kraft-code-block-language')!.setAttribute('data-contrast', 'language');
    block.querySelectorAll('.kraft-code-line-text').forEach((line, index) => line.setAttribute('data-contrast', ['line', 'line-added', 'line-removed'][index]));
    block.querySelector('.kraft-code-line-number')!.setAttribute('data-contrast', 'line-number');
    await verifyPaintedContrast(view.getByTestId('contrast-matrix'));
    const ground = (el: Element) => {
      for (let node: Element | null = el; node; node = node.parentElement) {
        const color = getComputedStyle(node).backgroundColor;
        if (color !== 'rgba(0, 0, 0, 0)') return channels(color);
      }
      throw new Error('No painted ground');
    };
    for (const control of [...view.getAllByRole('checkbox'), view.getByRole('link'), view.getByRole('button', { name: 'Copy code' })]) {
      act(() => control.focus());
      const css = getComputedStyle(control);
      expect(css.outlineStyle).toBe('solid');
      expect(contrast(channels(css.outlineColor), ground(control.parentElement!))).toBeGreaterThanOrEqual(3);
    }
    const quote = getComputedStyle(view.container.querySelector('.kraft-blockquote')!);
    expect(parseFloat(quote.borderInlineStartWidth)).toBeGreaterThanOrEqual(6);
    const added = getComputedStyle(block.querySelector('ins')!, '::before');
    const removed = getComputedStyle(block.querySelector('del')!, '::before');
    expect(added.content).toContain('+');
    expect(removed.content).toContain('−');
    expect(getComputedStyle(view.getByText('Write the changeset').closest('li')!).textDecorationLine).toBe('line-through');
    expect(getComputedStyle(view.getByText('Publish').closest('li')!).textDecorationLine).toBe('none');
  });

  it.each([true, false])('keeps table and description list states readable with decoration=%s', async decoration => {
    const columns = [
      { id: 'name', header: <span data-contrast="column-heading">Server</span>, rowHeader: true },
      { id: 'status', header: 'Status' },
    ];
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration} motion={decoration} tilt={decoration} style={{ ...font, width: 540, padding: 24 }}>
      <Stack gap={12}>
        <Table caption={<span data-contrast="caption">Server inventory</span>} columns={columns} groups={[
          { id: 'local', caption: <span data-contrast="group">Local</span>, rows: [
            { id: 'online', cells: { name: <TableRowAction data-contrast="online">Documentation</TableRowAction> } },
            { id: 'off', dimmed: true, cells: { name: <TableRowAction data-contrast="dimmed">Archive</TableRowAction> } },
            { id: 'current', current: true, cells: {
              name: <TableRowAction data-contrast="current">Build logs</TableRowAction>,
              status: <Link href="#activity" data-contrast="current-link">View activity</Link>,
            } },
            { id: 'off-current', dimmed: true, current: true, cells: {
              name: <TableRowAction data-contrast="dimmed-current">Calendar</TableRowAction>,
              status: <Text tone="muted" data-contrast="current-muted">Turned off</Text>,
            } },
          ] },
        ]} />
        <Table aria-label="Filtered servers" columns={[{ id: 'name', header: 'Server' }]} rows={[]}
          empty={<span data-contrast="empty">No matching servers</span>} />
        <Surface padding={12}><DescriptionList columns={2} layout="inline" items={[
          { id: 'workspace', label: <span data-contrast="term">Workspace</span>, value: <span data-contrast="value">Product</span>,
            action: <Link href="#workspace" data-contrast="action">Change workspace</Link> },
        ]} /></Surface>
      </Stack>
    </ThemeProvider>);
    await verifyPaintedContrast(view.getByTestId('contrast-matrix'));
    for (const button of view.getAllByRole('button')) {
      act(() => button.focus());
      const css = getComputedStyle(button);
      const row = getComputedStyle(button.closest('tr')!);
      const ground = row.backgroundColor === 'rgba(0, 0, 0, 0)'
        ? getComputedStyle(button.closest('.kraft-table-scroll')!).backgroundColor : row.backgroundColor;
      expect(css.outlineStyle).toBe('solid');
      expect(contrast(channels(css.outlineColor), channels(ground))).toBeGreaterThanOrEqual(3);
      if (button.closest('tr')?.hasAttribute('aria-current')) {
        const marker = getComputedStyle(button.closest('th')!).borderInlineStartColor;
        expect(contrast(channels(marker), channels(ground))).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it.each([true, false])('keeps inset sheets and loading indicators legible with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration} motion={decoration} tilt={decoration} style={{ ...font, width: 780, padding: 28 }}>
      <Stack gap={24}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {(['kraft', 'amber', 'sage'] as const).map(tone => <Mat key={tone} tone={tone}>
            <Tape placement="top-right" />
            <Stack gap={8}>
              <Text data-contrast={`${tone}-body`}>Review the proof.</Text>
              <Text tone="muted" data-contrast={`${tone}-muted`}>Ready for print.</Text>
              <Link href="#proof" data-contrast={`${tone}-link`}>Open the proof</Link>
              <Pinwheel label="Preparing the proof" />
            </Stack>
          </Mat>)}
        </div>
        <Inline gap={16}>{tones.map(tone => <Button key={tone} variant={tone} loading>Save {tone}</Button>)}</Inline>
        <Inline gap={16}>{tones.map(tone => <IconButton key={tone} variant={tone} size="sm" aria-label={`Refresh ${tone}`} loading>
          <Icon name="sync" />
        </IconButton>)}</Inline>
      </Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    await verifyPaintedContrast(matrix);
    matrix.querySelectorAll('[data-contrast]').forEach(sample => sample.removeAttribute('data-contrast'));
    matrix.querySelectorAll<SVGElement>('.kraft-pinwheel > svg').forEach((glyph, index) => {
      glyph.dataset.contrast = `pinwheel-${index}`;
      for (const animation of glyph.getAnimations()) {
        animation.pause();
        animation.currentTime = 0;
      }
    });
    await verifyPaintedContrast(matrix, 3);
  });

  it.each([true, false])('keeps every icon readable on materials and controls with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration} motion={decoration} tilt={decoration} style={{ ...font, width: 880, padding: 24 }}>
      <Stack gap={24}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>{materials.map(material => <Surface key={material} material={material} padding={16}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 24px)', gap: 12 }}>
            {iconNames.map(name => <Icon key={name} name={name} size={24} label={name} data-contrast={`${material}-${name}`} />)}
          </div>
        </Surface>)}</div>
        <div style={{ display: 'flex', gap: 16 }}>{tones.map(tone => <Button key={tone} variant={tone}><Icon name="microphone" data-contrast={`button-${tone}`} />Record</Button>)}</div>
        <div style={{ display: 'flex', gap: 16 }}>{tones.map(tone => <Badge key={tone} tone={tone}><Icon name="pin" data-contrast={`badge-icon-${tone}`} />Pinned</Badge>)}</div>
      </Stack>
    </ThemeProvider>);
    await verifyPaintedContrast(view.getByTestId('contrast-matrix'), 3);
  });
  it.each([true, false])('keeps red and blue text, danger ink, picked-row dots, and sticker glyphs readable with decoration=%s', async decoration => {
    const accents = { 'red-2': 'var(--kraft-red-2)', 'blue-2': 'var(--kraft-blue-2)', 'content-danger': 'var(--kraft-content-danger)' };
    const lines = (ground: string) => Object.entries(accents).map(([name, color]) =>
      <span key={name} style={{ color }} data-contrast={`${ground}-${name}`}>{name} on {ground}</span>);
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 520, padding: 24 }}>
      <Stack gap={16}>
        <Inline wrap gap={12}>{lines('desk')}</Inline>
        <Surface padding={12}><Inline wrap gap={12}>{lines('paper')}</Inline></Surface>
        <Card title="Proofs"><Inline wrap gap={12}>{lines('card')}</Inline></Card>
        <FormField label="Edition" error="Check the edition number"><TextField defaultValue="Second" /></FormField>
        <ActionableList aria-label="Proofs">
          <ActionableListItem current label="Covers" trailing={<span style={{ color: 'var(--kraft-green)' }} data-contrast="picked green dot">●</span>} />
          <ActionableListItem label="Inserts" trailing={<span style={{ color: 'var(--kraft-green)' }} data-contrast="green dot">●</span>} />
        </ActionableList>
        <Inline gap={16}>{tones.map(tone => <Sticker key={tone} tone={tone} shape="pill">
          <span style={{ color: 'var(--kraft-attention)' }}><Icon name="bolt" data-contrast={`yellow glyph on ${tone} sticker`} /></span>Rush
        </Sticker>)}</Inline>
      </Stack>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    const error = matrix.querySelector<HTMLElement>('.kraft-form-field-error')!;
    error.dataset.contrast = 'form error';
    // Paper's green sits under 3:1 on textured paper whether picked or not; the picked-row fix is a Night one.
    if (theme === 'paper') matrix.querySelectorAll<HTMLElement>('.kraft-list-item [data-contrast]').forEach(dot => { delete dot.dataset.contrast; });
    const glyphs = [...matrix.querySelectorAll<HTMLElement>('.kraft-sticker [data-contrast], .kraft-list-item [data-contrast]')];
    glyphs.forEach(glyph => { glyph.dataset.glyph = glyph.dataset.contrast; delete glyph.dataset.contrast; });
    await verifyPaintedContrast(matrix);
    matrix.querySelectorAll<HTMLElement>('[data-contrast]').forEach(sample => { delete sample.dataset.contrast; });
    glyphs.forEach(glyph => { glyph.dataset.contrast = glyph.dataset.glyph; });
    await verifyPaintedContrast(matrix, 3);
    const attentionGlyph = matrix.querySelector('.kraft-sticker[data-tone="attention"] .kraft-icon')!;
    expect(getComputedStyle(attentionGlyph).color, 'attention glyph prints in the sticker ink')
      .toBe(getComputedStyle(attentionGlyph.closest('.kraft-sticker')!).color);
  });

  it.each([true, false])('keeps destructive menu items and picked select dots visible with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration}
      motion={decoration} tilt={decoration} style={{ ...font, width: 520, height: 420, padding: 24 }}>
      <Inline align="start" gap={24}>
        <Menu defaultOpen label="Proof actions" trigger={<Button>Actions</Button>} onAction={() => {}} side="bottom" align="start" items={[
          { id: 'copy', label: 'Duplicate' },
          { id: 'delete', label: 'Delete proof', destructive: true },
        ]} />
      </Inline>
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    const destructive = await view.findByRole('menuitem', { name: 'Delete proof' });
    destructive.querySelector<HTMLElement>('.kraft-menu-label')!.dataset.contrast = 'destructive';
    await verifyPaintedContrast(matrix);
    act(() => destructive.focus());
    expect(destructive).toHaveAttribute('data-highlighted');
    await verifyPaintedContrast(matrix);
    cleanup();

    const tonesWithDots = ['neutral', 'blue', 'sage', 'danger', 'attention'] as const;
    const select = render(<ThemeProvider theme={theme} texture={decoration} motion={decoration} tilt={decoration} style={{ ...font, width: 520, padding: 24 }}>
      <Select label="Status" variant="compact" defaultValue="sage" options={tonesWithDots.map(tone => ({ value: tone, label: tone, statusDot: tone }))} />
    </ThemeProvider>);
    await userEvent.click(select.getByRole('combobox', { name: 'Status' }));
    const picked = await select.findByRole('option', { name: 'sage' });
    expect(picked).toHaveAttribute('data-state', 'checked');
    const row = channels(getComputedStyle(picked).backgroundColor);
    const dot = picked.querySelector('.kraft-select-status-dot')!;
    expect(contrast(channels(getComputedStyle(dot).backgroundColor), row), 'green dot on the picked row').toBeGreaterThanOrEqual(3);
    for (const option of select.getAllByRole('option')) {
      const rim = channels(getComputedStyle(option.querySelector('.kraft-select-status-dot')!).borderTopColor);
      expect(contrast(rim, row), `${option.textContent} dot rim on a picked row`).toBeGreaterThanOrEqual(3);
    }
    await userEvent.keyboard('{Escape}');
  });

  it('keeps printed-label ink readable across the entire gloss gradient', () => {
    const view = render(<ThemeProvider theme={theme}>{tones.map(tone => <Badge key={tone} tone={tone}>{tone}</Badge>)}</ThemeProvider>);
    for (const mark of view.container.querySelectorAll<HTMLElement>('.kraft-badge')) {
      const css = getComputedStyle(mark);
      const base = channels(css.backgroundColor).slice(0, 3);
      const gloss = channels(css.getPropertyValue('--kraft-mark-gloss'));
      const ink = channels(css.color).slice(0, 3);
      for (const alpha of [0, gloss[3]]) {
        const ground = base.map((value, i) => gloss[i] * alpha + value * (1 - alpha));
        expect(contrast(ink, ground), `${theme}/${mark.dataset.tone}: full gloss range`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  it('keeps material ink readable across every texture texel and light-gradient endpoint', async () => {
    const view = render(<ThemeProvider theme={theme}>{materials.map(material => <Surface key={material} material={material} data-testid={`bounds-${material}`}><Text>Primary ink</Text><Text tone="muted">Secondary ink</Text>{statusTones.map(tone => <Text key={tone} tone={tone}>{tone} ink</Text>)}<Link href="#notes">Link ink</Link></Surface>)}</ThemeProvider>);
    for (const material of materials) {
      const surface = view.getByTestId(`bounds-${material}`);
      const css = getComputedStyle(surface);
      const base = channels(css.backgroundColor).slice(0, 3);
      const face = channels(css.getPropertyValue('--kraft-face'));
      const tile = css.getPropertyValue(material === 'cardboard' ? '--kraft-pulp-board' : '--kraft-pulp-paper').trim();
      const url = tile.match(/^url\(["']?(.*?)["']?\)$/)![1];
      const image = await imagePixels(url);
      let darkest = Infinity, lightest = -Infinity;
      for (let i = 0; i < image.data.length; i += 4) {
        const alpha = image.data[i + 3] / 255;
        const ground = base.map((value, channel) => image.data[i + channel] * alpha + value * (1 - alpha));
        for (const amount of [0, face[3]]) {
          const value = luminance(ground.map((channel, i) => face[i] * amount + channel * (1 - amount)));
          darkest = Math.min(darkest, value); lightest = Math.max(lightest, value);
        }
      }
      for (const el of surface.querySelectorAll<HTMLElement>('.kraft-text,.kraft-link')) {
        const ink = luminance(channels(getComputedStyle(el).color).slice(0, 3));
        const minimum = ink >= darkest && ink <= lightest ? 1 : Math.min((Math.max(ink, darkest) + 0.05) / (Math.min(ink, darkest) + 0.05), (Math.max(ink, lightest) + 0.05) / (Math.min(ink, lightest) + 0.05));
        expect(minimum, `${theme}/${material}/${el.textContent}: full material range`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  it.each([true, false])('keeps labels and material compositions readable with texture=%s', async texture => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={texture} style={{ ...font, width: 880, padding: 24 }}>
      <Stack gap={24}>
        <div style={{ display: 'flex', gap: 24 }}>{tones.map(tone => <Badge key={tone} tone={tone} data-contrast={`badge-${tone}`}>{tone}</Badge>)}</div>
        {(['round', 'pill', 'square'] as const).map(shape => <div key={shape} style={{ display: 'flex', gap: 24 }}>{tones.map(tone => <Sticker key={tone} tone={tone} shape={shape} data-contrast={`sticker-${shape}-${tone}`}>{tone === 'blue' ? 'Keep' : tone}</Sticker>)}</div>)}
        <Sticker shape="pill" data-contrast="sticker-blue-long-pill">A printed mark</Sticker>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>{materials.map(material => <Surface key={material} material={material} padding={16}><Stack gap={12}>
          <Text data-contrast={`${material}-body`}>A clear note.</Text>
          <Text tone="muted" data-contrast={`${material}-muted`}>A secondary note.</Text>
          {statusTones.map(tone => <Text key={tone} as="span" tone={tone} data-contrast={`${material}-${tone}`}>A {tone} note.</Text>)}
          <Text variant="hand" size="md" tone="danger" data-contrast={`${material}-hand-danger`}>Overdue since Friday</Text>
          <Link href="#notes" data-contrast={`${material}-link`}>Read the notes</Link>
        </Stack></Surface>)}</div>
        <Inline gap={16}>{statusTones.map(tone => <Text key={tone} as="span" tone={tone} data-contrast={`desk-${tone}`}>A {tone} note.</Text>)}</Inline>
        <Surface material="kraft" padding={12}><Surface material="paper" padding={12}><Text tone="muted" data-contrast="nested-paper-muted">A nested paper note.</Text><Link href="#nested" data-contrast="nested-paper-link">Read a nested note</Link></Surface></Surface>
        <Surface material="kraft" padding={12}><ThemeProvider theme={theme === 'paper' ? 'night' : 'paper'} style={{padding:12}}><Text tone="muted" data-contrast="nested-theme-muted">The inner theme owns its ink.</Text><Link href="#inner" data-contrast="nested-theme-link">Read an inner note</Link></ThemeProvider></Surface>
      </Stack>
    </ThemeProvider>);
    await verifyPaintedContrast(view.getByTestId('contrast-matrix'));
  });
  it.each([true, false])('keeps tab labels, details, and counts readable with decoration=%s', async decoration => {
    const view = render(<ThemeProvider data-testid="contrast-matrix" theme={theme} texture={decoration} motion={decoration} tilt={decoration} style={{ ...font, width: 540, padding: 24 }}>
      <Tabs aria-label="Notebook" panel="bare" activationMode="manual" items={[
        { id: 'notes', label: 'Notes', description: 'New this week', trailing: <Badge tone="attention" data-contrast="selected-count">3</Badge>, content: <Text>Recent notes</Text> },
        { id: 'sketches', label: 'Sketches', description: 'Ready to share', trailing: <Icon name="check" label="Complete" /> },
        { id: 'inbox', label: 'Inbox', iconOnly: true, leading: <Icon name="inbox" />, trailing: <Badge tone="blue" data-contrast="icon-tab-count">12</Badge> },
      ]} />
    </ThemeProvider>);
    const matrix = view.getByTestId('contrast-matrix');
    for (const sample of matrix.querySelectorAll<HTMLElement>('.kraft-tab-label, .kraft-tab-description')) {
      sample.dataset.contrast = sample.textContent!;
    }
    await verifyPaintedContrast(matrix);
    const tabs = view.getAllByRole('tab');
    for (const tab of tabs) {
      act(() => tab.focus());
      const css = getComputedStyle(tab);
      const ink = channels(css.outlineColor);
      const fill = channels(css.backgroundColor);
      expect(css.outlineStyle).toBe('solid');
      expect(contrast(ink, fill), `${tab.textContent}: focus outline`).toBeGreaterThanOrEqual(3);
      if (tab.getAttribute('aria-selected') === 'true') {
        expect(contrast(channels(css.borderTopColor), fill), `${tab.textContent}: selection mark`).toBeGreaterThanOrEqual(3);
      }
    }
    act(() => tabs.at(-1)?.blur());
    for (const mark of matrix.querySelectorAll<SVGElement>('.kraft-tab svg')) {
      const tab = mark.closest('.kraft-tab')!;
      mark.dataset.contrast = `glyph-${tab.id}`;
    }
    await verifyPaintedContrast(matrix, 3);
  });
});

it('animates the ink only with motion enabled and no system reduction', async () => {
  const session = cdp();
  const emulateMotion = (value: string) => session.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value }],
  });
  try {
    await emulateMotion('no-preference');
    const view = render(<ThemeProvider>
      <Stamp data-testid="animated-stamp" animate>Done</Stamp>
      <Stamp as="button" animate>Done</Stamp>
      <Stamp as="button" animate pressed>Failed</Stamp>
      <Stamp as="button" pressed>Jira</Stamp>
    </ThemeProvider>);
    const css = (element: HTMLElement) => getComputedStyle(element.firstElementChild!);
    const stamp = view.getByTestId('animated-stamp');
    const off = view.getByRole('button', { pressed: false });
    const on = view.getByRole('button', { name: /failed/i, pressed: true });
    const still = view.getByRole('button', { name: /jira/i, pressed: true });
    expect(css(stamp).animationName).toBe('kraft-stamp-down');
    expect(css(on).animationName).toBe('kraft-stamp-down');
    expect(css(off).animationName).toBe('none');
    expect(css(still).animationName).toBe('none');
    expect(css(stamp).rotate).toBe('-4deg');

    await emulateMotion('reduce');
    expect(css(stamp).animationName).toBe('none');
    expect(css(on).animationName).toBe('none');
    expect(css(stamp).rotate).toBe('-4deg');
  } finally {
    await session.send('Emulation.setEmulatedMedia', { features: [] });
  }
});

it.each([true, false])('switches checkbox and toggle faces with the theme instead of fading them with motion=%s', async motion => {
  const view = render(<ThemeProvider theme="night" motion={motion} data-testid="themed">
    <Checkbox>Labels</Checkbox><Checkbox defaultChecked>Covers</Checkbox><Toggle>Sync</Toggle><Toggle defaultChecked>Proof</Toggle>
  </ThemeProvider>);
  const faces = () => [...view.getByTestId('themed').querySelectorAll<HTMLElement>('.kraft-checkbox-box, .kraft-toggle-track')];
  const settled = (theme: Theme) => {
    const probe = render(<ThemeProvider theme={theme} motion={false}>
      <Checkbox>Labels</Checkbox><Checkbox defaultChecked>Covers</Checkbox><Toggle>Sync</Toggle><Toggle defaultChecked>Proof</Toggle>
    </ThemeProvider>);
    const colors = [...probe.container.querySelectorAll<HTMLElement>('.kraft-checkbox-box, .kraft-toggle-track')]
      .map(face => [getComputedStyle(face).backgroundColor, getComputedStyle(face).borderTopColor]);
    probe.unmount();
    return colors;
  };
  const paper = settled('paper'), night = settled('night');
  for (const [from, to, expected] of [['night', 'paper', paper], ['paper', 'night', night]] as const) {
    view.rerender(<ThemeProvider theme={to} motion={motion} data-testid="themed">
      <Checkbox>Labels</Checkbox><Checkbox defaultChecked>Covers</Checkbox><Toggle>Sync</Toggle><Toggle defaultChecked>Proof</Toggle>
    </ThemeProvider>);
    const now = faces().map(face => [getComputedStyle(face).backgroundColor, getComputedStyle(face).borderTopColor]);
    expect(now, `${from} → ${to}: faces take the new theme on the first frame`).toEqual(expected);
    for (const face of faces()) {
      const colorTransitions = face.getAnimations().filter(animation => /color/i.test((animation as CSSTransition).transitionProperty ?? ''));
      expect(colorTransitions, `${from} → ${to}: no colour fade`).toEqual([]);
    }
  }
});
