import { afterEach, describe, expect, it } from 'vitest';
import { cdp, page } from 'vitest/browser';
import { act, cleanup, render } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { Avatar, AvatarGroup, AvatarPicker, CorkBoard, CorkBoardColumn, CorkBoardItem, Pin, Badge, Blockquote, Button, Code, CodeBlock, DescriptionList, Prose, Icon, iconNames, IconButton, Inline, Mat, Pinwheel, Tape, Stamp, Sticker, StickyNote, Link, Text, Stack, Surface, Table, TableRowAction, Tabs, ThemeProvider, type Theme, type AvatarStatus } from '../src';
import '@fontsource-variable/nunito';
import '@fontsource/caveat/500.css';
import '@fontsource/caveat/600.css';
import '../src/styles.css';
import { SegmentedControl, ToggleChips, type SegmentOption } from '../src';

afterEach(cleanup);
const tones = ['neutral', 'blue', 'sage', 'danger', 'attention'] as const;
const materials = ['paper', 'kraft', 'cardboard'] as const;
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
    const view = render(<ThemeProvider theme={theme}>{materials.map(material => <Surface key={material} material={material} data-testid={`bounds-${material}`}><Text>Primary ink</Text><Text tone="muted">Secondary ink</Text><Link href="#notes">Link ink</Link></Surface>)}</ThemeProvider>);
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
          <Link href="#notes" data-contrast={`${material}-link`}>Read the notes</Link>
        </Stack></Surface>)}</div>
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
