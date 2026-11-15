import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { Button, IconButton, ThemeProvider, type Theme } from '../src';
import '../src/styles.css';

afterEach(cleanup);
const longLabel = 'KeepThisVeryLongUnbrokenIdeaIdentifier'.repeat(6);
const plus = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
const layouts = {
  standalone: {},
  flex: { display: 'flex', gap: 12, alignItems: 'start' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' },
} satisfies Record<string, CSSProperties>;

function assertFits(button: HTMLButtonElement, frame: HTMLElement) {
  const buttonRect = button.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  expect(buttonRect.width).toBeGreaterThan(0);
  expect(buttonRect.left).toBeGreaterThanOrEqual(frameRect.left - 1);
  expect(buttonRect.right).toBeLessThanOrEqual(frameRect.right + 1);
  expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth + 1);
}

describe.each<Theme>(['paper', 'night'])('%s button resilience', theme => {
  it.each(Object.entries(layouts))('wraps long labels in %s layouts', (layoutName, style) => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const view = render(<ThemeProvider theme={theme} motion={false}>
        <div data-testid="frame" style={{ width: 180, ...style }}>
          <Button size={size}>{longLabel}</Button>
          {layoutName === 'flex' && <IconButton size="sm" aria-label="Add note">{plus}</IconButton>}
        </div>
      </ThemeProvider>);
      const button = view.getByRole('button', { name: longLabel }) as HTMLButtonElement;
      assertFits(button, view.getByTestId('frame'));
      expect(button.textContent).toBe(longLabel);
      expect(button.getBoundingClientRect().height).toBeGreaterThan(44);
      view.unmount();
    }
  });

  it('wraps loading, translated, RTL, emoji, and nested labels', () => {
    const labels = [
      { text: longLabel, loading: true },
      { text: 'Änderungen an dieser gemeinsamen Notiz endgültig speichern' },
      { text: 'حفظهذهالملاحظةالطويلةللرجوعإليهالاحقًا'.repeat(4), dir: 'rtl' },
      { text: 'この長いメモを次回の作業のために保存する'.repeat(4) },
      { text: '📎📝📌'.repeat(18) },
    ];
    for (const label of labels) {
      const view = render(<ThemeProvider theme={theme} motion={false}>
        <div data-testid="frame" style={{ width: 180 }} dir={label.dir}>
          <Button loading={label.loading}><span>{label.text}</span></Button>
        </div>
      </ThemeProvider>);
      const button = view.getByRole('button') as HTMLButtonElement;
      assertFits(button, view.getByTestId('frame'));
      expect(button.textContent).toBe(label.text);
      if (label.loading) expect(button.querySelector('.kraft-loading-mark')!.getBoundingClientRect().width).toBe(10);
      view.unmount();
    }
  });

  it('preserves pressed hover and normal active states with real pointer input', async () => {
    let pointerDownTransform = '';
    const view = render(<ThemeProvider theme={theme} motion={false}>
      <Button aria-pressed="true">Pinned</Button>
      <Button onMouseDown={event => { pointerDownTransform = getComputedStyle(event.currentTarget).transform; }}>Normal</Button>
    </ThemeProvider>);
    const pinned = view.getByRole('button', { name: 'Pinned' });
    expect(getComputedStyle(pinned).transform).toBe('matrix(1, 0, 0, 1, 2, 3)');
    await page.getByRole('button', { name: 'Pinned' }).hover();
    expect(pinned.matches(':hover')).toBe(true);
    expect(getComputedStyle(pinned).transform).toBe('matrix(1, 0, 0, 1, 2, 3)');
    expect(pinned.getAttribute('aria-pressed')).toBe('true');
    await page.getByRole('button', { name: 'Normal' }).hover();
    const normal = view.getByRole('button', { name: 'Normal' });
    expect(getComputedStyle(normal).transform).toBe('matrix(1, 0, 0, 1, -1, -1)');
    await page.getByRole('button', { name: 'Normal' }).click();
    expect(pointerDownTransform).toBe('matrix(1, 0, 0, 1, 2, 3)');
    expect(getComputedStyle(normal).transform).toBe('matrix(1, 0, 0, 1, -1, -1)');
    expect(getComputedStyle(pinned).transform).toBe('matrix(1, 0, 0, 1, 2, 3)');
  });
});
