import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { Badge, Sticker, Link, Text, Stack, Surface, ThemeProvider, type Theme } from '../src';
import '@fontsource-variable/nunito';
import '../src/styles.css';

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
function channels(color: string) { return color.match(/[\d.]+/g)!.map(Number); }
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
async function verifyPaintedContrast(matrix: HTMLElement) {
  await document.fonts.load('800 12px "Nunito Variable"');
  await document.fonts.load('400 14px "Nunito Variable"');
  await document.fonts.ready;
  const container = matrix.getBoundingClientRect();
  const samples = [...matrix.querySelectorAll<HTMLElement>('[data-contrast]')].map(el => ({
    el, name: el.dataset.contrast!, style: el.getAttribute('style'),
    rect: el.getBoundingClientRect(),
    foreground: getComputedStyle(el).color.match(/[\d.]+/g)!.slice(0, 3).map(Number),
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
    expect(glyphs, `${name}: glyph mask must contain rendered text`).toBeGreaterThan(0);
    if (minimum < 4.5) failures.push(`${name}: ${minimum.toFixed(3)}:1`);
  }
  expect(failures, 'Normal text must reach 4.5:1 on the actual painted material').toEqual([]);
}

describe.each<Theme>(['paper', 'night'])('%s painted contrast', theme => {
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
});
